import re
import json
from flask import Blueprint, request, jsonify
from app.database import db_session
from app.models.startup import Startup
from app.services.security import get_trusted_user_id, require_auth
from app.services.roadmap_engine import sync_roadmap_for_user

startup_bp = Blueprint("startup", __name__, url_prefix="/api/startup")

EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

def calculate_completion(profile_dict: dict) -> dict:
    """
    Computes profile completeness for personalization.
    """
    fields_to_evaluate = [
        {"name": "Startup / Business Name", "key": "name", "category": "Basic", "required": True},
        {"name": "Business Domain", "key": "business_domain", "category": "Basic", "required": True},
        {"name": "State of Operation", "key": "state_location", "category": "Basic", "required": True},
        {"name": "Business Legal Structure", "key": "business_structure", "category": "Business", "required": True},
        {"name": "Current Stage", "key": "company_stage", "category": "Business", "required": True},
        {"name": "Product / Service Summary", "key": "product_description", "category": "Basic", "required": False},
        {"name": "Founder Contact Email", "key": "email", "category": "Basic", "required": False},
        {"name": "MSME / Udyam Status", "key": "msme_status", "category": "Business", "required": False},
        {"name": "DPIIT Recognition Status", "key": "dpiit_status", "category": "Business", "required": False},
        {"name": "GST Status", "key": "gst_status", "category": "Business", "required": False},
    ]

    total_weight = 0
    earned_weight = 0
    breakdown = []

    for f in fields_to_evaluate:
        key = f["key"]
        weight = 2 if f["required"] else 1
        total_weight += weight
        val = profile_dict.get(key)

        status = "Missing"
        if val is True:
            status = "Completed"
            earned_weight += weight
        elif isinstance(val, (int, float)) and val > 0:
            status = "Completed"
            earned_weight += weight
        elif isinstance(val, str) and len(val.strip()) > 1:
            status = "Completed"
            earned_weight += weight
        elif isinstance(val, list) and len(val) > 0:
            status = "Completed"
            earned_weight += weight

        breakdown.append({
            "name": f["name"],
            "category": f["category"],
            "status": status,
            "required": f["required"]
        })

    percentage = int(round((earned_weight / total_weight) * 100)) if total_weight > 0 else 0

    return {
        "percentage": percentage,
        "completed_count": sum(1 for b in breakdown if b["status"] == "Completed"),
        "missing_count": sum(1 for b in breakdown if b["status"] == "Missing"),
        "breakdown": breakdown
    }

@startup_bp.route("/profile", methods=["GET"])
@require_auth
def get_profile():
    user_id = get_trusted_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    startup = Startup.query.filter_by(user_id=user_id).first()
    if not startup:
        return jsonify({
            "exists": False,
            "profile": None,
            "completion": {
                "percentage": 0,
                "completed_count": 0,
                "missing_count": 10,
                "breakdown": []
            }
        }), 200

    profile_dict = startup.to_dict()
    completion = calculate_completion(profile_dict)
    return jsonify({
        "exists": True,
        "profile": profile_dict,
        "completion": completion
    }), 200

@startup_bp.route("/profile", methods=["POST"])
@require_auth
def save_profile():
    user_id = get_trusted_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}

    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Startup / Business Name is required."}), 400

    email = data.get("email", "").strip()
    if email and not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Please provide a valid contact email address."}), 400

    startup = Startup.query.filter_by(user_id=user_id).first()
    if not startup:
        startup = Startup(name=name, user_id=user_id)
        db_session.add(startup)

    # Basic Info
    startup.name = name
    startup.founder_name = data.get("founder_name", "").strip()
    startup.email = email
    startup.phone = data.get("phone", "").strip()
    startup.product_description = data.get("product_description", "").strip()

    # Domain & Personalization Parameters
    domain = data.get("business_domain") or data.get("sector") or "Technology"
    startup.business_domain = domain.strip()
    startup.sector = domain.strip()
    startup.state_location = data.get("state_location", "").strip()
    startup.business_structure = data.get("business_structure", "Private Limited Company").strip()
    startup.company_stage = data.get("company_stage", "Early Stage").strip()

    # Operational Flags
    startup.has_employees = bool(data.get("has_employees", False))
    startup.has_physical_premises = bool(data.get("has_physical_premises", False))
    startup.is_interstate_or_ecommerce = bool(data.get("is_interstate_or_ecommerce", False))
    startup.creates_ip = bool(data.get("creates_ip", True))

    # Existing Registration Numbers if already completed
    startup.dpiit_status = bool(data.get("dpiit_status", False))
    startup.dpiit_number = data.get("dpiit_number", "").strip()
    startup.msme_status = bool(data.get("msme_status", False))
    startup.msme_number = data.get("msme_number", "").strip()
    startup.gst_status = data.get("gst_status", "").strip()
    startup.gstin = data.get("gstin", "").strip()

    try:
        startup.years_experience = int(data.get("years_experience", 0))
    except (ValueError, TypeError):
        startup.years_experience = 0

    try:
        startup.team_size = int(data.get("team_size", 0))
    except (ValueError, TypeError):
        startup.team_size = 0

    try:
        startup.annual_turnover_lakhs = float(data.get("annual_turnover_lakhs", 0.0))
    except (ValueError, TypeError):
        startup.annual_turnover_lakhs = 0.0

    db_session.commit()

    # Recalculate & personalize roadmap based on updated profile
    profile_dict = startup.to_dict()
    sync_roadmap_for_user(user_id, profile_dict)

    completion = calculate_completion(profile_dict)

    return jsonify({
        "success": True,
        "message": "Startup profile saved and documentation roadmap updated.",
        "profile": profile_dict,
        "completion": completion
    }), 200
