import os
import uuid
from pathlib import Path
from flask import Blueprint, request, jsonify, send_file, session
from werkzeug.utils import secure_filename
import pymupdf
from app.config import Config
from app.database import db_session
from app.models.startup import Document, Startup
from app.models.user import User

document_bp = Blueprint("documents", __name__, url_prefix="/api/documents")

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "doc", "docx"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024 # 15 MB

VALID_CATEGORIES = [
    "GST Certificate",
    "MSME/Udyam Certificate",
    "DPIIT Certificate",
    "Company Registration",
    "ISO Certificate",
    "Experience/Project Proof",
    "Product/Technical Documents",
    "Other Documents"
]

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def get_current_user_id():
    return session.get("user_id") or request.headers.get("X-User-Id")

@document_bp.route("", methods=["GET"])
def list_documents():
    user_id = get_current_user_id()
    if user_id:
        docs = Document.query.filter_by(user_id=user_id).order_by(Document.upload_date.desc()).all()
    else:
        # Fallback to demo user if available
        demo_user = db_session.query(User).filter_by(email="demo@procureease.in").first()
        if demo_user:
            docs = Document.query.filter_by(user_id=demo_user.id).order_by(Document.upload_date.desc()).all()
        else:
            docs = []

    docs_list = [d.to_dict() for d in docs]

    # Category counts
    category_summary = {}
    for cat in VALID_CATEGORIES:
        category_summary[cat] = sum(1 for d in docs_list if d["category"] == cat)

    return jsonify({
        "documents": docs_list,
        "total_count": len(docs_list),
        "category_summary": category_summary,
        "valid_categories": VALID_CATEGORIES
    }), 200

@document_bp.route("/upload", methods=["POST"])
def upload_document():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized. Please log in to upload documents."}), 401

    # 1. Check if file is in request
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded in form data."}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"error": "Selected file has an empty name."}), 400

    # 2. Validate extension
    if not allowed_file(file.filename):
        return jsonify({
            "error": f"File type not supported. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        }), 400

    # 3. Validate category
    category = request.form.get("category", "Other Documents").strip()
    if category not in VALID_CATEGORIES:
        category = "Other Documents"

    # 4. Save file to disk
    original_filename = secure_filename(file.filename) or "uploaded_document"
    file_ext = original_filename.rsplit(".", 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex[:10]}_{original_filename}"
    save_path = Config.DOCS_UPLOAD_FOLDER / unique_filename

    try:
        file.save(str(save_path))
    except Exception as e:
        return jsonify({"error": f"Failed to save file to disk: {str(e)}"}), 500

    file_size = os.path.getsize(save_path)
    if file_size > MAX_FILE_SIZE_BYTES:
        try:
            os.remove(save_path)
        except OSError:
            pass
        return jsonify({"error": "File size exceeds the 15 MB limit."}), 400

    # 5. Extract page count if PDF using PyMuPDF
    page_count = 1
    if file_ext == "pdf":
        try:
            doc = pymupdf.open(str(save_path))
            page_count = len(doc)
            doc.close()
        except Exception:
            page_count = 1

    # 6. Associate with user's startup
    startup = Startup.query.filter_by(user_id=user_id).first()
    startup_id = startup.id if startup else None

    # 7. Persist to SQLite tagged with user_id
    new_doc = Document(
        startup_id=startup_id,
        user_id=user_id,
        filename=unique_filename,
        original_filename=original_filename,
        category=category,
        file_path=str(save_path),
        file_size_bytes=file_size,
        page_count=page_count,
        status="Available for Evidence Mapping"
    )

    try:
        db_session.add(new_doc)
        db_session.commit()
    except Exception as e:
        db_session.rollback()
        return jsonify({"error": f"Failed to save document metadata: {str(e)}"}), 500

    return jsonify({
        "success": True,
        "message": f"'{original_filename}' uploaded successfully.",
        "document": new_doc.to_dict()
    }), 201

@document_bp.route("/<doc_id>", methods=["GET"])
def get_document(doc_id):
    user_id = get_current_user_id()
    doc = Document.query.filter_by(id=doc_id).first()
    if not doc:
        return jsonify({"error": "Document not found."}), 404
    if user_id and doc.user_id and doc.user_id != user_id:
        return jsonify({"error": "Access denied."}), 403
    return jsonify({"document": doc.to_dict()}), 200

@document_bp.route("/<doc_id>/download", methods=["GET"])
def download_document(doc_id):
    user_id = get_current_user_id()
    doc = Document.query.filter_by(id=doc_id).first()
    if not doc or not doc.file_path or not os.path.exists(doc.file_path):
        return jsonify({"error": "File not found on server disk."}), 404
    if user_id and doc.user_id and doc.user_id != user_id:
        return jsonify({"error": "Access denied."}), 403
    return send_file(doc.file_path, as_attachment=True, download_name=doc.original_filename)

@document_bp.route("/<doc_id>", methods=["DELETE"])
def delete_document(doc_id):
    user_id = get_current_user_id()
    doc = Document.query.filter_by(id=doc_id).first()
    if not doc:
        return jsonify({"error": "Document not found."}), 404
    if user_id and doc.user_id and doc.user_id != user_id:
        return jsonify({"error": "Access denied."}), 403

    # Remove physical file from disk
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except OSError:
            pass

    # Delete record from SQLite
    try:
        db_session.delete(doc)
        db_session.commit()
    except Exception as e:
        db_session.rollback()
        return jsonify({"error": f"Failed to delete record: {str(e)}"}), 500

    return jsonify({
        "success": True,
        "message": "Document deleted successfully."
    }), 200
