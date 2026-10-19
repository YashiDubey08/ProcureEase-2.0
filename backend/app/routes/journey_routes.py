import uuid
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request, session
from app.database import db_session
from app.models.journey import RoadmapStep, ApplicationRecord
from app.models.user import User
from app.models.tender import Tender
from app.services.mock_data import (
    SAMPLE_ROADMAP_STEPS,
    SAMPLE_TENDERS_LIST,
    SAMPLE_FINANCIAL_SCHEMES,
    SAMPLE_APPLICATIONS
)

journey_bp = Blueprint("journey", __name__, url_prefix="/api/journey")

def get_current_user_id():
    user_id = session.get("user_id") or request.headers.get("X-User-Id")
    if user_id:
        return user_id
    demo_user = db_session.query(User).filter_by(email="demo@procureease.in").first()
    if demo_user:
        return demo_user.id
    return None

def is_current_user_demo(user_id: str) -> bool:
    if not user_id:
        return True
    user = db_session.query(User).filter_by(id=user_id).first()
    if user and (user.is_demo or user.email == "demo@procureease.in"):
        return True
    return False

def ensure_roadmap_for_user(user_id: str):
    if not user_id:
        return []
    steps = db_session.query(RoadmapStep).filter_by(user_id=user_id).order_by(RoadmapStep.step_number.asc()).all()
    if not steps:
        is_demo = is_current_user_demo(user_id)
        for s in SAMPLE_ROADMAP_STEPS:
            if is_demo:
                status = s.get("status", "LOCKED")
                progress_pct = s.get("progress_pct", 0)
                evidence = s.get("evidence_reference", "")
                completed_at = datetime.now(timezone.utc) if status == "COMPLETED" else None
            else:
                if s["step_number"] == 1:
                    status = "IN_PROGRESS"
                    progress_pct = 0
                else:
                    status = "LOCKED"
                    progress_pct = 0
                evidence = ""
                completed_at = None

            step = RoadmapStep(
                id=f"{user_id}_{s['id']}",
                user_id=user_id,
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
                status=status,
                progress_pct=progress_pct,
                evidence_reference=evidence,
                notes="",
                completed_at=completed_at
            )
            db_session.add(step)
        db_session.commit()
        steps = db_session.query(RoadmapStep).filter_by(user_id=user_id).order_by(RoadmapStep.step_number.asc()).all()
    return steps

@journey_bp.route("/roadmap", methods=["GET"])
def get_roadmap():
    user_id = get_current_user_id()
    if not user_id:
        demo_user = db_session.query(User).filter_by(email="demo@procureease.in").first()
        if demo_user:
            user_id = demo_user.id

    steps = ensure_roadmap_for_user(user_id) if user_id else []
    step_dicts = [s.to_dict() for s in steps]

    completed_count = sum(1 for s in step_dicts if s["status"] == "COMPLETED")
    in_progress_count = sum(1 for s in step_dicts if s["status"] == "IN_PROGRESS")
    total_steps = len(step_dicts)
    overall_progress = int((completed_count / total_steps) * 100) if total_steps > 0 else 0

    current_step = next((s for s in step_dicts if s["status"] == "IN_PROGRESS"), None)
    if not current_step and completed_count < total_steps and step_dicts:
        current_step = next((s for s in step_dicts if s["status"] == "LOCKED"), None)
    if not current_step and completed_count == total_steps and step_dicts:
        current_step = step_dicts[-1]

    return jsonify({
        "steps": step_dicts,
        "total_steps": total_steps,
        "completed_count": completed_count,
        "in_progress_count": in_progress_count,
        "overall_progress_pct": overall_progress,
        "current_step": current_step
    }), 200

@journey_bp.route("/roadmap/<string:step_id>", methods=["PUT"])
def update_roadmap_step(step_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 401

    ensure_roadmap_for_user(user_id)
    step = db_session.query(RoadmapStep).filter(
        RoadmapStep.user_id == user_id,
        (RoadmapStep.id == step_id) | (RoadmapStep.step_key == step_id) | (RoadmapStep.id == f"{user_id}_{step_id}")
    ).first()

    if not step:
        return jsonify({"error": f"Step '{step_id}' not found"}), 404

    data = request.get_json() or {}

    if "status" in data:
        step.status = data["status"]
        if data["status"] == "COMPLETED":
            step.completed_at = datetime.now(timezone.utc)
            step.progress_pct = 100
            # Unlock next step for THIS user
            next_step = db_session.query(RoadmapStep).filter_by(
                user_id=user_id,
                step_number=step.step_number + 1
            ).first()
            if next_step and next_step.status == "LOCKED":
                next_step.status = "IN_PROGRESS"
                next_step.progress_pct = max(next_step.progress_pct, 20)
        elif data["status"] == "IN_PROGRESS":
            step.completed_at = None
            step.progress_pct = data.get("progress_pct", 50)

    if "evidence_reference" in data:
        step.evidence_reference = str(data["evidence_reference"])
    if "notes" in data:
        step.notes = str(data["notes"])
    if "progress_pct" in data and step.status != "COMPLETED":
        step.progress_pct = int(data["progress_pct"])

    db_session.commit()
    return jsonify({
        "success": True,
        "message": f"Step {step.step_number} updated successfully",
        "step": step.to_dict()
    }), 200

@journey_bp.route("/roadmap/reset", methods=["POST"])
def reset_roadmap():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 401

    db_session.query(RoadmapStep).filter_by(user_id=user_id).delete()
    db_session.commit()
    ensure_roadmap_for_user(user_id)
    return jsonify({"success": True, "message": "Procurement roadmap reset"}), 200

@journey_bp.route("/tenders/discovery", methods=["GET"])
def get_discovery_tenders():
    sector = request.args.get("sector", "").strip().lower()
    search = request.args.get("search", "").strip().lower()
    min_score = request.args.get("min_score", type=int)

    filtered = SAMPLE_TENDERS_LIST
    if sector and sector != "all":
        filtered = [t for t in filtered if sector in t.get("sector", "").lower()]
    if search:
        filtered = [
            t for t in filtered 
            if search in t.get("title", "").lower() 
            or search in t.get("tender_id", "").lower()
            or search in t.get("organization", "").lower()
            or any(search in tech.lower() for tech in t.get("key_technologies", []))
        ]
    if min_score is not None:
        filtered = [t for t in filtered if t.get("match_score", 0) >= min_score]

    sectors = list(set(t.get("sector", "") for t in SAMPLE_TENDERS_LIST if t.get("sector")))

    return jsonify({
        "tenders": filtered,
        "total_count": len(filtered),
        "all_sectors": sorted(sectors)
    }), 200

@journey_bp.route("/applications", methods=["GET"])
def get_applications():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"applications": [], "total_count": 0}), 200

    apps = db_session.query(ApplicationRecord).filter_by(user_id=user_id).order_by(ApplicationRecord.created_at.desc()).all()
    # If demo user and empty, seed sample applications
    if not apps and is_current_user_demo(user_id):
        for a in SAMPLE_APPLICATIONS:
            app_rec = ApplicationRecord(
                user_id=user_id,
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
        apps = db_session.query(ApplicationRecord).filter_by(user_id=user_id).order_by(ApplicationRecord.created_at.desc()).all()

    return jsonify({
        "applications": [a.to_dict() for a in apps],
        "total_count": len(apps)
    }), 200

@journey_bp.route("/applications", methods=["POST"])
def create_application():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 401

    data = request.get_json() or {}
    tender_id = data.get("tender_id", "").strip()
    bid_id = (data.get("bid_id") or data.get("portal_bid_id") or "").strip()
    if not tender_id or not bid_id:
        return jsonify({"error": "tender_id and bid_id are required"}), 400

    app_rec = ApplicationRecord(
        user_id=user_id,
        tender_id=tender_id,
        tender_title=data.get("tender_title", "IoT Smart Infrastructure Procurement"),
        bid_id=bid_id,
        submission_date=data.get("submission_date", datetime.now(timezone.utc).strftime("%d %b %Y")),
        portal_name=data.get("portal_name", "Government e-Marketplace (GeM)"),
        status=data.get("status", "SUBMITTED"),
        evaluated_date=data.get("evaluated_date", ""),
        award_amount=data.get("award_amount", ""),
        contract_status=data.get("contract_status", "PENDING"),
        project_progress_pct=int(data.get("project_progress_pct", 0)),
        notes=data.get("notes", "Submitted via official procurement portal.")
    )
    db_session.add(app_rec)

    # Automatically complete Step 7 (Official Portal Submission) and unlock Step 8 (Tracking) for THIS user
    step7 = db_session.query(RoadmapStep).filter_by(user_id=user_id, step_key="step-7").first()
    if step7:
        step7.status = "COMPLETED"
        step7.progress_pct = 100
        step7.evidence_reference = bid_id
        step7.completed_at = datetime.now(timezone.utc)
    step8 = db_session.query(RoadmapStep).filter_by(user_id=user_id, step_key="step-8").first()
    if step8:
        step8.status = "IN_PROGRESS"
        step8.progress_pct = 30
        step8.evidence_reference = f"Tracking Bid: {bid_id}"

    db_session.commit()
    return jsonify({
        "success": True,
        "message": "Bid application recorded and synced with procurement roadmap",
        "application": app_rec.to_dict()
    }), 201

@journey_bp.route("/applications/<string:app_id>", methods=["PUT"])
def update_application(app_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 401

    app_rec = db_session.query(ApplicationRecord).filter_by(id=app_id, user_id=user_id).first()
    if not app_rec:
        return jsonify({"error": f"Application record '{app_id}' not found"}), 404

    data = request.get_json() or {}
    if "status" in data:
        app_rec.status = data["status"]
        if data["status"] == "WON":
            app_rec.contract_status = "CONTRACT_SIGNED"
            step10 = db_session.query(RoadmapStep).filter_by(user_id=user_id, step_key="step-10").first()
            if step10:
                step10.status = "COMPLETED"
                step10.progress_pct = 100
                step10.evidence_reference = "Awarded (L1 Bidder)"
            step11 = db_session.query(RoadmapStep).filter_by(user_id=user_id, step_key="step-11").first()
            if step11:
                step11.status = "IN_PROGRESS"
                step11.progress_pct = 25

    if "contract_status" in data:
        app_rec.contract_status = data["contract_status"]
        if data["contract_status"] == "COMPLETED":
            step11 = db_session.query(RoadmapStep).filter_by(user_id=user_id, step_key="step-11").first()
            if step11:
                step11.status = "COMPLETED"
                step11.progress_pct = 100
            step12 = db_session.query(RoadmapStep).filter_by(user_id=user_id, step_key="step-12").first()
            if step12:
                step12.status = "COMPLETED"
                step12.progress_pct = 100
                step12.evidence_reference = "Project Handover Certified"

    if "award_amount" in data:
        app_rec.award_amount = data["award_amount"]
    if "project_progress_pct" in data:
        app_rec.project_progress_pct = int(data["project_progress_pct"])
    if "notes" in data:
        app_rec.notes = data["notes"]

    db_session.commit()
    return jsonify({
        "success": True,
        "message": "Application lifecycle updated successfully",
        "application": app_rec.to_dict()
    }), 200

@journey_bp.route("/finance/schemes", methods=["GET"])
def get_finance_schemes():
    return jsonify({
        "schemes": SAMPLE_FINANCIAL_SCHEMES,
        "total_count": len(SAMPLE_FINANCIAL_SCHEMES),
        "disclaimer": "ProcureEase provides decision-support information on government financial schemes. Application and loan sanction are subject to official SIDBI, CGTMSE, or bank guidelines."
    }), 200
