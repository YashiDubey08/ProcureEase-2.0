import re
import json
from flask import Blueprint, request, jsonify, session
from app.database import db_session
from app.models.startup import Startup
from app.models.user import User

startup_bp = Blueprint("startup", __name__, url_prefix="/api/startup")

EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

def calculate_completion(profile_dict):
    """
    Deterministically computes profile completion percentage and field statuses.
    Green = Completed, Amber = Partial, Red = Missing.
    Initial state with only signup credentials returns 0%.
    """
    fields_to_evaluate = [
        {"name": "Business Sector", "key": "sector", "category": "Basic", "required": True},
        {"name": "Product Description", "key": "product_description", "category": "Basic", "required": True},
        {"name": "Startup Stage", "key": "company_stage", "category": "Business", "required": True},
        {"name": "DPIIT Recognition", "key": "dpiit_status", "category": "Business", "required": False},
        {"name": "MSME / Udyam", "key": "msme_status", "category": "Business", "required": False},
        {"name": "GST Status", "key": "gst_status", "category": "Business", "required": True},
        {"name": "Years of Experience", "key": "years_experience", "category": "Business", "required": True},
        {"name": "Team Size", "key": "team_size", "category": "Business", "required": False},
        {"name": "Technical Capabilities", "key": "capabilities", "category": "Capabilities", "required": True},
        {"name": "Products & Services", "key": "products_services", "category": "Capabilities", "required": True},
        {"name": "Past Projects / Experience", "key": "past_projects", "category": "Capabilities", "required": False},
        {"name": "Certifications", "key": "certifications", "category": "Capabilities", "required": False},
    ]

    total_points = 0
    earned_points = 0
    breakdown = []

    for f in fields_to_evaluate:
        key = f["key"]
        weight = 2 if f["required"] else 1
        total_points += weight
        val = profile_dict.get(key)

        status = "Missing"
        if val is None or val == "" or val == []:
            status = "Missing"
        elif isinstance(val, bool):
            if val is True:
                status = "Completed"
                earned_points += weight
            else:
                status = "Missing"
        elif isinstance(val, (int, float)):
            if val > 0:
                status = "Completed"
                earned_points += weight
            else:
                status = "Missing"
        elif isinstance(val, list):
            if len(val) >= 2:
                status = "Completed"
                earned_points += weight
            elif len(val) == 1:
                status = "Partial"
                earned_points += (weight * 0.5)
            else:
                status = "Missing"
        else:
            # string field
            val_str = str(val).strip()
            if len(val_str) > 3:
                status = "Completed"
                earned_points += weight
            elif len(val_str) > 0:
                status = "Partial"
                earned_points += (weight * 0.5)
            else:
                status = "Missing"

        breakdown.append({
            "name": f["name"],
            "category": f["category"],
            "status": status,
            "required": f["required"]
        })

    completion_percentage = int(round((earned_points / total_points) * 100)) if total_points > 0 else 0

    return {
        "percentage": completion_percentage,
        "completed_count": sum(1 for b in breakdown if b["status"] == "Completed"),
        "partial_count": sum(1 for b in breakdown if b["status"] == "Partial"),
        "missing_count": sum(1 for b in breakdown if b["status"] == "Missing"),
        "breakdown": breakdown
    }

def get_active_startup():
    user_id = session.get("user_id") or request.headers.get("X-User-Id")
    if user_id:
        return Startup.query.filter_by(user_id=user_id).first()
    # Check if demo user exists
    demo_user = db_session.query(User).filter_by(email="demo@procureease.in").first()
    if demo_user:
        return Startup.query.filter_by(user_id=demo_user.id).first()
    return None

@startup_bp.route("/profile", methods=["GET"])
def get_profile():
    startup = get_active_startup()
    if not startup:
        return jsonify({
            "exists": False,
            "profile": None,
            "completion": {
                "percentage": 0,
                "completed_count": 0,
                "partial_count": 0,
                "missing_count": 12,
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
def save_profile():
    user_id = session.get("user_id") or request.headers.get("X-User-Id")
    data = request.get_json() or {}

    # Validation: Company Name is required
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Startup/Company name is required."}), 400

    # Validation: Email validation if provided
    email = data.get("email", "").strip()
    if email and not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Please provide a valid email address."}), 400

    startup = None
    if user_id:
        startup = Startup.query.filter_by(user_id=user_id).first()
    if not startup:
        startup = Startup(name=name, user_id=user_id)
        db_session.add(startup)

    # Basic Information
    startup.name = name
    startup.founder_name = data.get("founder_name", "").strip()
    startup.email = email
    startup.phone = data.get("phone", "").strip()
    startup.sector = data.get("sector", "").strip()
    startup.product_description = data.get("product_description", "").strip()

    # Business Information
    startup.company_stage = data.get("company_stage", "").strip()
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

    # Capability Information (JSON encoded)
    def clean_list(items):
        if isinstance(items, list):
            return [str(x).strip() for x in items if str(x).strip()]
        if isinstance(items, str):
            return [x.strip() for x in items.split(",") if x.strip()]
        return []

    startup.capabilities_json = json.dumps(clean_list(data.get("capabilities", [])))
    startup.products_services_json = json.dumps(clean_list(data.get("products_services", [])))
    startup.past_projects_json = json.dumps(clean_list(data.get("past_projects", [])))
    startup.certifications_json = json.dumps(clean_list(data.get("certifications", [])))

    db_session.commit()

    profile_dict = startup.to_dict()
    completion = calculate_completion(profile_dict)

    return jsonify({
        "success": True,
        "message": "Startup profile saved and updated successfully.",
        "profile": profile_dict,
        "completion": completion
    }), 200
