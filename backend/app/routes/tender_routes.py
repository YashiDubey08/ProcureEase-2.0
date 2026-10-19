import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app.config import Config
from app.database import db_session
from app.models.tender import Tender, TenderVersion
from app.services.pdf_service import extract_pdf_pages
from app.services.mock_data import SAMPLE_TENDER

tender_bp = Blueprint("tenders", __name__, url_prefix="/api/tenders")

@tender_bp.route("", methods=["GET"])
def list_tenders():
    tenders = Tender.query.order_by(Tender.created_at.desc()).all()
    return jsonify({
        "tenders": [t.to_dict() for t in tenders],
        "total_count": len(tenders)
    }), 200

@tender_bp.route("/<tender_id>", methods=["GET"])
def get_tender(tender_id):
    tender = Tender.query.filter_by(id=tender_id).first()
    if not tender:
        return jsonify({"error": "Tender not found."}), 404
    return jsonify({"tender": tender.to_dict()}), 200

@tender_bp.route("/upload", methods=["POST"])
def upload_tender():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded in form data."}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"error": "Selected file has an empty name."}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported for tender processing."}), 400

    original_filename = secure_filename(file.filename) or "tender_document.pdf"
    unique_filename = f"tender_{uuid.uuid4().hex[:8]}_{original_filename}"
    save_path = Config.TENDERS_UPLOAD_FOLDER / unique_filename

    try:
        file.save(str(save_path))
    except Exception as e:
        return jsonify({"error": f"Failed to save tender file: {str(e)}"}), 500

    # Extract text with PyMuPDF
    extraction_result = extract_pdf_pages(str(save_path))
    if not extraction_result["success"]:
        try:
            os.remove(save_path)
        except OSError:
            pass
        return jsonify({"error": extraction_result.get("error", "Failed to parse PDF document.")}), 400

    # Create Tender record
    tender_title = request.form.get("title", "").strip() or original_filename.replace(".pdf", "").replace("_", " ").title()
    organization = request.form.get("organization", "").strip() or "Procurement Authority"
    tender_ref = request.form.get("tender_id", "").strip() or f"TND/{uuid.uuid4().hex[:6].upper()}"
    deadline = request.form.get("deadline", "").strip() or "28 Oct 2026"

    new_tender = Tender(
        title=tender_title,
        organization=organization,
        tender_id=tender_ref,
        deadline=deadline,
        emd_amount=50000.0,
        emd_exemption_allowed=True,
        estimated_budget=14500000.0,
        active_version=1,
        file_path=str(save_path),
        total_pages=extraction_result.get("total_pages", 1)
    )

    try:
        db_session.add(new_tender)
        db_session.commit()
    except Exception as e:
        db_session.rollback()
        return jsonify({"error": f"Failed to save tender record: {str(e)}"}), 500

    return jsonify({
        "success": True,
        "message": f"Tender '{tender_title}' uploaded and parsed successfully ({extraction_result.get('total_pages', 1)} pages).",
        "tender": new_tender.to_dict()
    }), 201

@tender_bp.route("/sample", methods=["POST"])
def load_sample_tender():
    """1-Click loads realistic benchmark IoT tender for demo."""
    existing = Tender.query.filter_by(tender_id=SAMPLE_TENDER["tender_id"]).first()
    if existing:
        return jsonify({
            "success": True,
            "message": "Sample tender is already loaded.",
            "tender": existing.to_dict()
        }), 200

    sample = Tender(
        title=SAMPLE_TENDER["title"],
        organization=SAMPLE_TENDER["organization"],
        tender_id=SAMPLE_TENDER["tender_id"],
        deadline=SAMPLE_TENDER["deadline"],
        emd_amount=SAMPLE_TENDER["emd_amount"],
        emd_exemption_allowed=SAMPLE_TENDER["emd_exemption_allowed"],
        estimated_budget=SAMPLE_TENDER["estimated_budget"],
        active_version=SAMPLE_TENDER["active_version"],
        file_path="uploads/tenders/sample_iot_tender.pdf",
        total_pages=SAMPLE_TENDER["total_pages"]
    )

    try:
        db_session.add(sample)
        db_session.commit()
    except Exception as e:
        db_session.rollback()
        return jsonify({"error": f"Failed to load sample tender: {str(e)}"}), 500

    return jsonify({
        "success": True,
        "message": "Sample Tender GEM/2026/B/89210 loaded successfully.",
        "tender": sample.to_dict()
    }), 201

@tender_bp.route("/<tender_id>", methods=["DELETE"])
def delete_tender(tender_id):
    tender = Tender.query.filter_by(id=tender_id).first()
    if not tender:
        return jsonify({"error": "Tender not found."}), 404

    if tender.file_path and os.path.exists(tender.file_path):
        try:
            os.remove(tender.file_path)
        except OSError:
            pass

    try:
        db_session.delete(tender)
        db_session.commit()
    except Exception as e:
        db_session.rollback()
        return jsonify({"error": f"Failed to delete tender: {str(e)}"}), 500

    return jsonify({
        "success": True,
        "message": "Tender and related analysis deleted successfully."
    }), 200
