import os
import re
import secrets
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, session
from app.database import db_session
from app.models.user import User
from app.models.startup import Startup, Document
from app.models.journey import RoadmapStep, ApplicationRecord
from app.services.security import (
    get_trusted_user_id,
    require_auth,
    rate_limit,
    generate_auth_token
)
from app.services.roadmap_engine import sync_roadmap_for_user

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

def get_current_user():
    user_id = get_trusted_user_id()
    if user_id:
        return db_session.query(User).filter_by(id=user_id).first()
    return None

@auth_bp.route("/register", methods=["POST"])
@rate_limit(max_requests=10, window_seconds=60)
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    company_name = data.get("company_name", "").strip()

    if not name or not email or not password or not company_name:
        return jsonify({"error": "All fields (Full Name, Company Name, Email, Password) are required."}), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Please enter a valid email address."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    existing_user = db_session.query(User).filter_by(email=email).first()
    if existing_user:
        # Safe message: account already exists
        return jsonify({"error": "An account with this email address already exists. Please log in."}), 400

    # 1. Create User
    user = User(
        name=name,
        email=email,
        company_name=company_name,
        is_demo=False,
        email_verified=False,
        email_verification_token=secrets.token_urlsafe(24)
    )
    user.set_password(password)
    db_session.add(user)
    db_session.flush()

    # 2. Create Initial Startup Profile for this user
    startup = Startup(
        name=company_name,
        founder_name=name,
        email=email,
        user_id=user.id,
        business_domain="Technology",
        state_location="",
        business_structure="Private Limited Company",
        company_stage="Early Stage",
        has_employees=False,
        has_physical_premises=False,
        is_interstate_or_ecommerce=False,
        creates_ip=True
    )
    db_session.add(startup)
    db_session.flush()

    # 3. Generate Personalized Roadmap for this user
    sync_roadmap_for_user(user.id, startup.to_dict())

    db_session.commit()

    # Set secure server-side session and auth token
    session["user_id"] = user.id
    token = generate_auth_token(user.id)

    return jsonify({
        "success": True,
        "message": "Account created successfully.",
        "user": user.to_dict(),
        "startup": startup.to_dict(),
        "token": token
    }), 201

@auth_bp.route("/login", methods=["POST"])
@rate_limit(max_requests=10, window_seconds=60)
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = db_session.query(User).filter_by(email=email).first()
    if not user or not user.check_password(password):
        # Safe generic error message to prevent user enumeration
        return jsonify({"error": "Invalid email or password."}), 401

    session["user_id"] = user.id
    token = generate_auth_token(user.id)

    startup = db_session.query(Startup).filter_by(user_id=user.id).first()

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user.name}!",
        "user": user.to_dict(),
        "startup": startup.to_dict() if startup else None,
        "token": token
    }), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    session.clear()
    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    }), 200

@auth_bp.route("/me", methods=["GET"])
def me():
    user = get_current_user()
    if not user:
        return jsonify({
            "authenticated": False,
            "user": None,
            "startup": None
        }), 200

    startup = db_session.query(Startup).filter_by(user_id=user.id).first()
    token = generate_auth_token(user.id)

    return jsonify({
        "authenticated": True,
        "user": user.to_dict(),
        "startup": startup.to_dict() if startup else None,
        "token": token
    }), 200

@auth_bp.route("/forgot-password", methods=["POST"])
@rate_limit(max_requests=5, window_seconds=60)
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()

    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Please enter a valid email address."}), 400

    user = db_session.query(User).filter_by(email=email).first()
    dev_token = None

    if user:
        token = secrets.token_urlsafe(32)
        user.reset_password_token = token
        user.reset_password_expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        db_session.commit()
        dev_token = token

    # Return safe message without leaking whether email is registered
    response_payload = {
        "success": True,
        "message": "If this email is registered, you will receive password reset instructions."
    }
    # For convenient local development and testing, include dev token
    if dev_token:
        response_payload["dev_reset_token"] = dev_token

    return jsonify(response_payload), 200

@auth_bp.route("/reset-password", methods=["POST"])
@rate_limit(max_requests=5, window_seconds=60)
def reset_password():
    data = request.get_json() or {}
    token = data.get("token", "").strip()
    new_password = data.get("new_password", "")

    if not token or not new_password:
        return jsonify({"error": "Token and new password are required."}), 400

    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    user = db_session.query(User).filter_by(reset_password_token=token).first()
    if not user or not user.reset_password_expires_at:
        return jsonify({"error": "Invalid or expired reset token."}), 400

    now_utc = datetime.now(timezone.utc)
    # Handle naive / timezone-aware datetimes safely
    expires_at = user.reset_password_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if now_utc > expires_at:
        return jsonify({"error": "Password reset token has expired. Please request a new one."}), 400

    user.set_password(new_password)
    user.reset_password_token = None
    user.reset_password_expires_at = None
    db_session.commit()

    return jsonify({
        "success": True,
        "message": "Password has been successfully updated. You can now log in."
    }), 200

@auth_bp.route("/verify-email", methods=["GET", "POST"])
def verify_email():
    user = get_current_user()
    data = (request.get_json(silent=True) or {}) if request.method == "POST" else {}
    token = data.get("token", "").strip() or request.args.get("token", "").strip()

    target_user = None
    if token:
        target_user = db_session.query(User).filter_by(email_verification_token=token).first()
    elif user:
        target_user = user

    if not target_user:
        return jsonify({"error": "Invalid or expired email verification token."}), 400

    target_user.email_verified = True
    target_user.email_verification_token = None
    db_session.commit()

    return jsonify({
        "success": True,
        "message": "Email address verified successfully.",
        "email_verified": True,
        "user": target_user.to_dict()
    }), 200

@auth_bp.route("/resend-verification", methods=["POST"])
@require_auth
@rate_limit(max_requests=3, window_seconds=60)
def resend_verification():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if user.email_verified:
        return jsonify({"message": "Email address is already verified."}), 200

    token = secrets.token_urlsafe(24)
    user.email_verification_token = token
    db_session.commit()

    return jsonify({
        "success": True,
        "message": "A verification link has been sent to your email address.",
        "dev_verification_token": token
    }), 200

@auth_bp.route("/change-password", methods=["POST"])
@require_auth
def change_password():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}
    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")

    if not current_password or not new_password:
        return jsonify({"error": "Current password and new password are required."}), 400

    if not user.check_password(current_password):
        return jsonify({"error": "Current password is incorrect."}), 400

    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters long."}), 400

    user.set_password(new_password)
    db_session.commit()

    return jsonify({
        "success": True,
        "message": "Password changed successfully."
    }), 200

@auth_bp.route("/delete-account", methods=["POST"])
@require_auth
def delete_account():
    """
    Deletes the authenticated user's account and all associated startup data,
    roadmap steps, document records, and physical files from disk.
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}
    password = data.get("password", "")

    if not user.is_demo and not user.check_password(password):
        return jsonify({"error": "Incorrect password. Account deletion cancelled."}), 400

    user_id = user.id

    # 1. Remove physical files for this user
    user_docs = db_session.query(Document).filter_by(user_id=user_id).all()
    for d in user_docs:
        if d.file_path and os.path.exists(d.file_path):
            try:
                os.remove(d.file_path)
            except OSError:
                pass

    # 2. Delete database records
    db_session.query(Document).filter_by(user_id=user_id).delete()
    db_session.query(RoadmapStep).filter_by(user_id=user_id).delete()
    db_session.query(ApplicationRecord).filter_by(user_id=user_id).delete()
    db_session.query(Startup).filter_by(user_id=user_id).delete()
    db_session.query(User).filter_by(id=user_id).delete()
    db_session.commit()

    # 3. Clear session
    session.clear()

    return jsonify({
        "success": True,
        "message": "Your account and all associated data have been permanently deleted."
    }), 200

@auth_bp.route("/demo", methods=["POST"])
def activate_demo():
    """
    Activates the 1-Click Demo Mode as a clean isolated demo user.
    """
    demo_email = "demo@procureease.in"
    demo_user = db_session.query(User).filter_by(email=demo_email).first()
    if not demo_user:
        demo_user = User(
            id="demo-user-id",
            name="Vikram Malhotra",
            email=demo_email,
            company_name="TechNova Solutions",
            is_demo=True,
            email_verified=True
        )
        demo_user.set_password("DemoFounder2026!")
        db_session.add(demo_user)
        db_session.flush()

    # Ensure demo startup exists
    demo_startup = db_session.query(Startup).filter_by(user_id=demo_user.id).first()
    if not demo_startup:
        demo_startup = Startup(
            user_id=demo_user.id,
            name="TechNova Solutions",
            founder_name="Vikram Malhotra",
            email=demo_email,
            business_domain="Technology",
            state_location="Maharashtra",
            business_structure="Private Limited Company",
            company_stage="Early Stage",
            has_employees=True,
            has_physical_premises=True,
            is_interstate_or_ecommerce=True,
            creates_ip=True,
            product_description="IoT smart environmental monitoring and sensor telemetry nodes for smart cities and industrial facilities.",
            dpiit_status=True,
            dpiit_number="DIPP98214",
            msme_status=True,
            msme_number="UDYAM-MH-02-0098412",
            gst_status="Registered",
            gstin="27AABCT1345L1Z8"
        )
        db_session.add(demo_startup)
        db_session.flush()

    # Sync personalized roadmap for demo user
    steps = sync_roadmap_for_user(demo_user.id, demo_startup.to_dict())

    # Pre-populate some realistic sample progress for demo mode
    if steps and steps[0].status == "NOT_STARTED":
        steps[0].status = "COMPLETED"
        steps[0].reference_number = "U72900MH2025PTC398210"
        steps[0].notes = "Incorporated via SPICe+ with MCA Mumbai."
        if len(steps) > 1:
            steps[1].status = "COMPLETED"
            steps[1].reference_number = "AABCT1345L"
            steps[1].notes = "PAN and TAN allotted."
        if len(steps) > 2:
            steps[2].status = "COMPLETED"
            steps[2].reference_number = "HDFC0001824-998210"
            steps[2].notes = "Current account active with HDFC Bank."
        if len(steps) > 3:
            steps[3].status = "IN_PROGRESS"
            steps[3].reference_number = "ARN-270826998124"
            steps[3].notes = "GST registration under review."
        db_session.commit()

    session["user_id"] = demo_user.id
    token = generate_auth_token(demo_user.id)

    return jsonify({
        "success": True,
        "message": "Demo mode activated as TechNova Solutions.",
        "user": demo_user.to_dict(),
        "startup": demo_startup.to_dict(),
        "token": token
    }), 200
