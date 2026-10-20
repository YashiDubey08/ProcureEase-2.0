import os
import uuid
from pathlib import Path
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
import pymupdf
from app.config import Config
from app.database import db_session
from app.models.startup import Document, Startup
from app.services.security import (
    get_trusted_user_id,
    require_auth,
    validate_uploaded_file,
    MAX_DOCUMENT_SIZE_BYTES
)
from app.services.roadmap_engine import get_checklist_for_user

document_bp = Blueprint("documents", __name__, url_prefix="/api/documents")

VALID_CATEGORIES = [
    "Legal & Incorporation",
    "Tax & Regulatory",
    "Identity & Address",
    "Domain Regulatory License",
    "Banking & Finance",
    "Government Recognition",
    "Labor & Workplace",
    "Intellectual Property",
    "Quality & Technical",
    "Other Supporting Document"
]

@document_bp.route("", methods=["GET"])
@require_auth
def list_documents():
    user_id = get_trusted_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    # 1. Fetch user's uploaded documents strictly isolated by user_id
    docs = Document.query.filter_by(user_id=user_id).order_by(Document.upload_date.desc()).all()
    docs_list = [d.to_dict() for d in docs]

    # 2. Fetch personalized checklist generated from their active roadmap steps
    checklist_data = get_checklist_for_user(user_id)

    # Category summary for uploaded documents
    category_summary = {}
    for cat in VALID_CATEGORIES:
        category_summary[cat] = sum(1 for d in docs_list if d.get("category") == cat)

    return jsonify({
        "documents": docs_list,
        "total_count": len(docs_list),
        "checklist": checklist_data.get("documents", []),
        "checklist_total": checklist_data.get("total_count", 0),
        "prepared_count": checklist_data.get("prepared_count", 0),
        "missing_count": checklist_data.get("missing_count", 0),
        "category_summary": category_summary,
        "valid_categories": VALID_CATEGORIES
    }), 200

@document_bp.route("/upload", methods=["POST"])
@require_auth
def upload_document():
    user_id = get_trusted_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized. Please log in to upload documents."}), 401

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded in form data."}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"error": "Selected file has an empty name."}), 400

    # 1. Validate file extension, size, and magic byte signatures
    is_valid, err_msg, ext = validate_uploaded_file(file)
    if not is_valid:
        return jsonify({"error": err_msg, "message": err_msg}), 400

    category = request.form.get("category", "Legal & Incorporation").strip()
    if category not in VALID_CATEGORIES:
        category = "Legal & Incorporation"

    step_key = request.form.get("step_key", "").strip()

    # 2. Generate safe server-side storage name
    original_filename = secure_filename(file.filename) or f"document.{ext}"
    unique_filename = f"{uuid.uuid4().hex}_{original_filename}"
    save_path = Config.DOCS_UPLOAD_FOLDER / unique_filename

    try:
        file.save(str(save_path))
    except Exception as e:
        return jsonify({"error": f"Failed to save file: {str(e)}"}), 500

    # 3. Check physical file size after saving
    file_size = os.path.getsize(save_path)
    if file_size > MAX_DOCUMENT_SIZE_BYTES:
        try:
            os.remove(save_path)
        except OSError:
            pass
        return jsonify({"error": "File size exceeds the 15 MB limit."}), 400

    # 4. Extract PDF page count safely if PDF
    page_count = 1
    if ext == "pdf":
        try:
            doc = pymupdf.open(str(save_path))
            page_count = len(doc)
            doc.close()
        except Exception:
            page_count = 1

    # 5. Link with user's startup
    startup = Startup.query.filter_by(user_id=user_id).first()
    startup_id = startup.id if startup else None

    new_doc = Document(
        startup_id=startup_id,
        user_id=user_id,
        step_key=step_key or None,
        filename=unique_filename,
        original_filename=original_filename,
        category=category,
        file_path=str(save_path),
        file_size_bytes=file_size,
        page_count=page_count,
        status="Uploaded & Verified",
        preparation_status="UPLOADED",
        is_required=True,
        mime_type=f"application/{ext}" if ext == "pdf" else f"image/{ext}"
    )

    try:
        db_session.add(new_doc)
        db_session.commit()
    except Exception as e:
        db_session.rollback()
        # Clean up physical file if DB persistence fails
        if os.path.exists(save_path):
            try:
                os.remove(save_path)
            except OSError:
                pass
        return jsonify({"error": f"Failed to save document metadata: {str(e)}"}), 500

    return jsonify({
        "success": True,
        "message": f"'{original_filename}' uploaded securely.",
        "document": new_doc.to_dict()
    }), 201

@document_bp.route("/status", methods=["POST"])
@require_auth
def update_document_prep_status():
    """
    Allows founders to mark a checklist document as 'PREPARED_LOCAL', 'DRAFT',
    or 'NOT_PREPARED' without uploading sensitive files to the server.
    """
    user_id = get_trusted_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}
    document_name = data.get("name", "").strip()
    prep_status = data.get("status", "PREPARED_LOCAL").strip().upper()
    step_key = data.get("step_key", "").strip()
    category = data.get("category", "General").strip()

    valid_statuses = ["NOT_PREPARED", "DRAFT", "PREPARED_LOCAL", "UPLOADED"]
    if prep_status not in valid_statuses:
        prep_status = "PREPARED_LOCAL"

    if not document_name:
        return jsonify({"error": "Document name is required."}), 400

    # Check if a Document record already exists for this name
    doc = Document.query.filter_by(user_id=user_id, original_filename=document_name).first()
    if not doc:
        startup = Startup.query.filter_by(user_id=user_id).first()
        doc = Document(
            startup_id=startup.id if startup else None,
            user_id=user_id,
            step_key=step_key or None,
            filename=f"local_{uuid.uuid4().hex[:8]}",
            original_filename=document_name,
            category=category,
            file_path="",
            file_size_bytes=0,
            page_count=1,
            status="Prepared Locally",
            preparation_status=prep_status,
            is_required=True
        )
        db_session.add(doc)
    else:
        doc.preparation_status = prep_status

    db_session.commit()

    return jsonify({
        "success": True,
        "message": f"Status for '{document_name}' updated to {prep_status}.",
        "document": doc.to_dict()
    }), 200

@document_bp.route("/<doc_id>", methods=["GET"])
@require_auth
def get_document(doc_id):
    user_id = get_trusted_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    doc = Document.query.filter_by(id=doc_id).first()
    if not doc or doc.user_id != user_id:
        return jsonify({"error": "Document not found."}), 404

    return jsonify({"document": doc.to_dict()}), 200

@document_bp.route("/<doc_id>/download", methods=["GET"])
@document_bp.route("/download/<doc_id>", methods=["GET"])
@require_auth
def download_document(doc_id):
    user_id = get_trusted_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    doc = Document.query.filter_by(id=doc_id).first()
    if not doc or doc.user_id != user_id:
        return jsonify({"error": "Document not found."}), 404

    if not doc.file_path or not os.path.exists(doc.file_path):
        return jsonify({"error": "Physical file does not exist on storage disk."}), 404

    return send_file(doc.file_path, as_attachment=True, download_name=doc.original_filename)

@document_bp.route("/<doc_id>", methods=["DELETE"])
@require_auth
def delete_document(doc_id):
    user_id = get_trusted_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    doc = Document.query.filter_by(id=doc_id).first()
    if not doc or doc.user_id != user_id:
        return jsonify({"error": "Document not found."}), 404

    # Remove physical file from disk
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except OSError:
            pass

    try:
        db_session.delete(doc)
        db_session.commit()
    except Exception as e:
        db_session.rollback()
        return jsonify({"error": f"Failed to delete record: {str(e)}"}), 500

    return jsonify({
        "success": True,
        "message": f"'{doc.original_filename}' deleted successfully."
    }), 200
