"""
ProcureEase 2.0 Security & Data Isolation Module
Enforces server-side authentication, authorization, rate limiting, and private document validation.
"""

import os
import time
import uuid
from functools import wraps
from pathlib import Path
from collections import defaultdict
from threading import Lock
from flask import session, request, jsonify
from app.database import db_session
from app.models.user import User

# Maximum document file size: 15 MB
MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024

# Allowed extensions and magic byte signatures
ALLOWED_FILE_TYPES = {
    "pdf": {
        "magic": [b"%PDF-"],
        "mime": "application/pdf"
    },
    "png": {
        "magic": [b"\x89PNG\r\n\x1a\n"],
        "mime": "image/png"
    },
    "jpg": {
        "magic": [b"\xff\xd8\xff"],
        "mime": "image/jpeg"
    },
    "jpeg": {
        "magic": [b"\xff\xd8\xff"],
        "mime": "image/jpeg"
    }
}

class InMemoryRateLimiter:
    """
    Sliding-window IP rate limiter for authentication & password endpoints.
    Protects against brute force and credential stuffing.
    """
    def __init__(self):
        self.lock = Lock()
        self.requests = defaultdict(list)

    def is_allowed(self, key: str, max_requests: int, window_seconds: int) -> bool:
        now = time.time()
        with self.lock:
            # Clean old records
            timestamps = [t for t in self.requests[key] if now - t < window_seconds]
            if len(timestamps) >= max_requests:
                self.requests[key] = timestamps
                return False
            timestamps.append(now)
            self.requests[key] = timestamps
            return True

rate_limiter = InMemoryRateLimiter()

def get_client_ip() -> str:
    # Check X-Forwarded-For if behind trusted proxy
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"

def rate_limit(max_requests=5, window_seconds=60):
    """Decorator to enforce rate limiting on specific routes."""
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            ip = get_client_ip()
            key = f"{request.endpoint}:{ip}"
            if not rate_limiter.is_allowed(key, max_requests, window_seconds):
                return jsonify({
                    "error": "Too many requests. Please wait a minute before trying again."
                }), 429
            return f(*args, **kwargs)
        return wrapped
    return decorator

def get_trusted_user_id() -> str | None:
    """
    Obtains the trusted user ID ONLY from the server-side session.
    Never trusts caller-supplied headers, request bodies, or URLs.
    Verifies that the user actually exists in the database.
    """
    user_id = session.get("user_id")
    if not user_id:
        return None

    # Verify user exists in database
    user = db_session.query(User).filter_by(id=user_id).first()
    if not user:
        session.pop("user_id", None)
        return None

    return user.id

def require_auth(f):
    """
    Enforces authentication on routes. Rejects unauthenticated callers with 401.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_trusted_user_id()
        if not user_id:
            return jsonify({
                "error": "Authentication required. Please log in to access this resource."
            }), 401
        return f(*args, **kwargs)
    return decorated_function

def validate_uploaded_file(file_storage) -> tuple[bool, str, str]:
    """
    Validates uploaded file:
    1. Extension check
    2. Size check
    3. Magic bytes file signature verification
    Returns: (is_valid, error_message, detected_extension)
    """
    if not file_storage or file_storage.filename == "":
        return False, "No file selected for upload.", ""

    filename = file_storage.filename
    if "." not in filename:
        return False, "File must have an extension.", ""

    ext = filename.rsplit(".", 1)[1].lower()
    if ext not in ALLOWED_FILE_TYPES:
        allowed = ", ".join(f".{k}" for k in sorted(ALLOWED_FILE_TYPES.keys()))
        return False, f"Unsupported file type. Allowed formats: {allowed}", ""

    # Read the first 512 bytes for magic number validation
    header = file_storage.read(512)
    file_storage.seek(0) # Reset stream pointer

    # Check magic bytes
    config = ALLOWED_FILE_TYPES[ext]
    matched = False
    for magic in config["magic"]:
        if header.startswith(magic):
            matched = True
            break

    if not matched:
        return False, f"File content does not match the extension .{ext}.", ""

    return True, "", ext
