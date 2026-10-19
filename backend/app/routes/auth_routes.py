import re
import json
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, session
from app.database import db_session
from app.models.user import User
from app.models.startup import Startup, Document
from app.models.journey import RoadmapStep, ApplicationRecord
from app.services.mock_data import (
    SAMPLE_STARTUP,
    SAMPLE_DOCUMENTS,
    SAMPLE_ROADMAP_STEPS,
    SAMPLE_APPLICATIONS
)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        auth_header = request.headers.get("X-User-Id")
        if auth_header:
            user_id = auth_header
    if user_id:
        return db_session.query(User).filter_by(id=user_id).first()
    return None

def ensure_demo_data_for_user(demo_user):
    """Ensures demo user has complete sample data without polluting other users."""
    # 1. Startup
    demo_startup = db_session.query(Startup).filter_by(user_id=demo_user.id).first()
    if not demo_startup:
        demo_startup = Startup(
            name=SAMPLE_STARTUP["name"],
            founder_name=SAMPLE_STARTUP["founder_name"],
            email=demo_user.email,
            phone=SAMPLE_STARTUP["phone"],
            sector=SAMPLE_STARTUP["sector"],
            product_description=SAMPLE_STARTUP["product_description"],
            company_stage=SAMPLE_STARTUP["company_stage"],
            dpiit_status=SAMPLE_STARTUP["dpiit_status"],
            dpiit_number=SAMPLE_STARTUP["dpiit_number"],
            msme_status=SAMPLE_STARTUP["msme_status"],
            msme_number=SAMPLE_STARTUP["msme_number"],
            gst_status=SAMPLE_STARTUP["gst_status"],
            gstin=SAMPLE_STARTUP["gstin"],
            years_experience=SAMPLE_STARTUP["years_experience"],
            team_size=SAMPLE_STARTUP["team_size"],
            annual_turnover_lakhs=SAMPLE_STARTUP["annual_turnover_lakhs"],
            capabilities_json=json.dumps(SAMPLE_STARTUP["capabilities"]),
            products_services_json=json.dumps(SAMPLE_STARTUP["products_services"]),
            past_projects_json=json.dumps(SAMPLE_STARTUP["past_projects"]),
            certifications_json=json.dumps(SAMPLE_STARTUP["certifications"]),
            user_id=demo_user.id
        )
        db_session.add(demo_startup)
        db_session.flush()

    # 2. Demo Documents
    doc_count = db_session.query(Document).filter_by(user_id=demo_user.id).count()
    if doc_count == 0:
        for d in SAMPLE_DOCUMENTS:
            new_doc = Document(
                startup_id=demo_startup.id,
                user_id=demo_user.id,
                filename=d["filename"],
                original_filename=d["original_filename"],
                category=d["category"],
                file_size_bytes=d["file_size_bytes"],
                page_count=d["page_count"],
                status=d["status"],
                file_path=f"uploads/documents/{d['filename']}"
            )
            db_session.add(new_doc)

    # 3. Demo Roadmap Steps
    step_count = db_session.query(RoadmapStep).filter_by(user_id=demo_user.id).count()
    if step_count == 0:
        for s in SAMPLE_ROADMAP_STEPS:
            step = RoadmapStep(
                id=f"{demo_user.id}_{s['id']}",
                user_id=demo_user.id,
                step_key=s["id"],
                step_number=s["step_number"],
                title=s["title"],
                short_title=s.get("short_title", ""),
                category=s.get("category", ""),
                description=s.get("description", ""),
                required_action=s.get("required_action", ""),
                official_portal_name=s.get("official_portal_name", ""),
                official_portal_url=s.get("official_portal_url", ""),
                internal_route=s.get("internal_route", ""),
                status=s.get("status", "LOCKED"),
                progress_pct=s.get("progress_pct", 0),
                evidence_reference=s.get("evidence_reference", ""),
                notes=s.get("notes", ""),
                completed_at=datetime.now(timezone.utc) if s.get("status") == "COMPLETED" else None
            )
            db_session.add(step)

    # 4. Demo Applications
    app_count = db_session.query(ApplicationRecord).filter_by(user_id=demo_user.id).count()
    if app_count == 0:
        for a in SAMPLE_APPLICATIONS:
            app_rec = ApplicationRecord(
                user_id=demo_user.id,
                tender_id=a["tender_id"],
                tender_title=a.get("tender_title", ""),
                bid_id=a["bid_id"],
                submission_date=a.get("submission_date", ""),
                portal_name=a.get("portal_name", "GeM Portal"),
                status=a.get("status", "SUBMITTED"),
                evaluated_date=a.get("evaluated_date", ""),
                award_amount=a.get("award_amount", ""),
                contract_status=a.get("contract_status", "PROJECT_STARTED"),
                project_progress_pct=a.get("project_progress_pct", 35),
                notes=a.get("notes", "")
            )
            db_session.add(app_rec)

    db_session.commit()
    return demo_startup

@auth_bp.route("/register", methods=["POST"])
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
        return jsonify({"error": "An account with this email address already exists. Please log in."}), 400

    # 1. Create new User
    user = User(
        name=name,
        email=email,
        company_name=company_name,
        is_demo=False
    )
    user.set_password(password)
    db_session.add(user)
    db_session.flush()

    # 2. Create completely EMPTY Startup Profile for this new user
    # (No pre-filled sector, description, stage, certifications, or past projects)
    startup = Startup(
        name=company_name,
        founder_name=name,
        email=email,
        user_id=user.id,
        phone="",
        sector="",
        product_description="",
        company_stage="",
        dpiit_status=False,
        dpiit_number="",
        msme_status=False,
        msme_number="",
        gst_status="",
        gstin="",
        years_experience=0,
        team_size=0,
        annual_turnover_lakhs=0.0,
        capabilities_json="[]",
        products_services_json="[]",
        past_projects_json="[]",
        certifications_json="[]"
    )
    db_session.add(startup)

    # 3. Initialize a fresh 12-stage roadmap for this new user:
    # Step 1 = ACTIVE (IN_PROGRESS), Steps 2 through 12 = LOCKED
    for s in SAMPLE_ROADMAP_STEPS:
        step = RoadmapStep(
            id=f"{user.id}_{s['id']}",
            user_id=user.id,
            step_key=s["id"],
            step_number=s["step_number"],
            title=s["title"],
            short_title=s.get("short_title", ""),
            category=s.get("category", ""),
            description=s.get("description", ""),
            required_action=s.get("required_action", ""),
            official_portal_name=s.get("official_portal_name", ""),
            official_portal_url=s.get("official_portal_url", ""),
            internal_route=s.get("internal_route", ""),
            status="IN_PROGRESS" if s["step_number"] == 1 else "LOCKED",
            progress_pct=0,
            evidence_reference="",
            notes="",
            completed_at=None
        )
        db_session.add(step)

    db_session.commit()

    # Set session
    session["user_id"] = user.id

    return jsonify({
        "success": True,
        "message": "Account created successfully.",
        "user": user.to_dict(),
        "startup": startup.to_dict()
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = db_session.query(User).filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    session["user_id"] = user.id

    startup = db_session.query(Startup).filter_by(user_id=user.id).first()

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user.name}!",
        "user": user.to_dict(),
        "startup": startup.to_dict() if startup else None
    }), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
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

    return jsonify({
        "authenticated": True,
        "user": user.to_dict(),
        "startup": startup.to_dict() if startup else None
    }), 200

@auth_bp.route("/demo", methods=["POST"])
def activate_demo():
    """
    Activates the 1-Click Judge/Demo Mode as TechNova Solutions with its own isolated sample data.
    """
    demo_email = "demo@procureease.in"
    demo_user = db_session.query(User).filter_by(email=demo_email).first()
    if not demo_user:
        demo_user = User(
            id="demo-user-id",
            name="Vikram Malhotra",
            email=demo_email,
            company_name="TechNova Solutions",
            is_demo=True
        )
        demo_user.set_password("DemoJudge2026!")
        db_session.add(demo_user)
        db_session.flush()

    # Ensure demo user has isolated sample profile, documents, roadmap, and applications
    demo_startup = ensure_demo_data_for_user(demo_user)

    session["user_id"] = demo_user.id

    return jsonify({
        "success": True,
        "message": "Demo mode activated as TechNova Solutions.",
        "user": demo_user.to_dict(),
        "startup": demo_startup.to_dict() if demo_startup else None
    }), 200
