import json
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from app.database import db_session
from app.models.journey import RoadmapStep, ApplicationRecord
from app.models.startup import Startup
from app.services.security import get_trusted_user_id, require_auth
from app.services.roadmap_engine import sync_roadmap_for_user
from app.services.mock_data import (
    SAMPLE_TENDERS_LIST,
    SAMPLE_FINANCIAL_SCHEMES,
    SAMPLE_APPLICATIONS
)

journey_bp = Blueprint("journey", __name__, url_prefix="/api/journey")

@journey_bp.route("/roadmap", methods=["GET"])
@require_auth
def get_roadmap():
    user_id = get_trusted_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    startup = db_session.query(Startup).filter_by(user_id=user_id).first()
    startup_dict = startup.to_dict() if startup else {}

    # Sync and fetch steps for this user
    steps = sync_roadmap_for_user(user_id, startup_dict)
    step_dicts = [s.to_dict() for s in steps]

    total_steps = len(step_dicts)
    completed_count = sum(1 for s in step_dicts if s["status"] == "COMPLETED")
    in_progress_count = sum(1 for s in step_dicts if s["status"] == "IN_PROGRESS")
    submitted_count = sum(1 for s in step_dicts if s["status"] == "SUBMITTED")
    needs_attention_count = sum(1 for s in step_dicts if s["status"] == "NEEDS_ATTENTION")
    not_started_count = sum(1 for s in step_dicts if s["status"] == "NOT_STARTED")

    overall_progress = int(round((completed_count / total_steps) * 100)) if total_steps > 0 else 0

    # Determine next recommended action
    next_step = next((s for s in step_dicts if s["status"] in ["IN_PROGRESS", "NEEDS_ATTENTION"]), None)
    if not next_step and completed_count < total_steps:
        next_step = next((s for s in step_dicts if s["status"] == "NOT_STARTED"), None)
    if not next_step and total_steps > 0:
        next_step = step_dicts[-1]

    pending_steps = [s for s in step_dicts if s["status"] != "COMPLETED"]

    return jsonify({
        "steps": step_dicts,
        "total_steps": total_steps,
        "completed_count": completed_count,
        "in_progress_count": in_progress_count,
        "submitted_count": submitted_count,
        "needs_attention_count": needs_attention_count,
        "not_started_count": not_started_count,
        "overall_progress_pct": overall_progress,
        "current_step": next_step,
        "next_recommended_action": next_step,
        "pending_steps": pending_steps
    }), 200

@journey_bp.route("/roadmap/<string:step_id>", methods=["PUT"])
@require_auth
def update_roadmap_step(step_id):
    user_id = get_trusted_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    # Ownership check: if step_id matches another user's step record, reject with 403
    target_by_id = db_session.query(RoadmapStep).filter(RoadmapStep.id == step_id).first()
    if target_by_id and target_by_id.user_id != user_id:
        return jsonify({"error": "Forbidden: You do not own this roadmap step."}), 403

    step = db_session.query(RoadmapStep).filter(
        RoadmapStep.user_id == user_id,
        (RoadmapStep.id == step_id) | (RoadmapStep.step_key == step_id) | (RoadmapStep.id == f"{user_id}_{step_id}")
    ).first()

    if not step:
        return jsonify({"error": f"Step '{step_id}' not found."}), 404

    data = request.get_json() or {}

    # Validate and update status
    valid_statuses = ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "COMPLETED", "NEEDS_ATTENTION"]
    if "status" in data:
        new_status = data["status"].strip().upper()
        if new_status in valid_statuses:
            step.status = new_status
            if new_status == "COMPLETED":
                step.completed_at = datetime.now(timezone.utc)
                step.progress_pct = 100
                # Unlock next step if it's currently NOT_STARTED
                next_step = db_session.query(RoadmapStep).filter_by(
                    user_id=user_id,
                    step_number=step.step_number + 1
                ).first()
                if next_step and next_step.status == "NOT_STARTED":
                    next_step.status = "IN_PROGRESS"
                    next_step.progress_pct = 25
            elif new_status == "IN_PROGRESS":
                step.completed_at = None
                step.progress_pct = data.get("progress_pct", 50)
            elif new_status == "SUBMITTED":
                step.progress_pct = 80
            elif new_status == "NEEDS_ATTENTION":
                step.progress_pct = max(step.progress_pct, 20)
            elif new_status == "NOT_STARTED":
                step.completed_at = None
                step.progress_pct = 0

    if "reference_number" in data or "evidence_reference" in data:
        ref = str(data.get("reference_number") or data.get("evidence_reference") or "").strip()
        step.reference_number = ref
        step.evidence_reference = ref

    if "submission_date" in data:
        step.submission_date = str(data.get("submission_date") or "").strip()

    if "notes" in data:
        step.notes = str(data.get("notes") or "").strip()

    if "progress_pct" in data and step.status != "COMPLETED":
        try:
            step.progress_pct = max(0, min(100, int(data["progress_pct"])))
        except (ValueError, TypeError):
            pass

    db_session.commit()

    return jsonify({
        "success": True,
        "message": f"Step '{step.short_title or step.title}' updated successfully.",
        "step": step.to_dict()
    }), 200

@journey_bp.route("/roadmap/reset", methods=["POST"])
@require_auth
def reset_roadmap():
    user_id = get_trusted_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    steps = db_session.query(RoadmapStep).filter_by(user_id=user_id).order_by(RoadmapStep.step_number.asc()).all()
    for idx, s in enumerate(steps):
        s.status = "IN_PROGRESS" if idx == 0 else "NOT_STARTED"
        s.progress_pct = 0
        s.reference_number = ""
        s.evidence_reference = ""
        s.submission_date = ""
        s.notes = ""
        s.completed_at = None

    db_session.commit()

    return jsonify({
        "success": True,
        "message": "Documentation roadmap reset to initial state."
    }), 200

# Legacy compatibility endpoints with strict user isolation
@journey_bp.route("/tenders/discovery", methods=["GET"])
def get_discovery_tenders():
    sector = request.args.get("sector", "").strip().lower()
    search = request.args.get("search", "").strip().lower()

    filtered = SAMPLE_TENDERS_LIST
    if sector and sector != "all":
        filtered = [t for t in filtered if sector in t.get("sector", "").lower()]
    if search:
        filtered = [
            t for t in filtered 
            if search in t.get("title", "").lower() 
            or search in t.get("tender_id", "").lower()
            or search in t.get("organization", "").lower()
        ]

    sectors = list(set(t.get("sector", "") for t in SAMPLE_TENDERS_LIST if t.get("sector")))

    return jsonify({
        "tenders": filtered,
        "total_count": len(filtered),
        "all_sectors": sorted(sectors)
    }), 200

@journey_bp.route("/applications", methods=["GET"])
@require_auth
def get_applications():
    user_id = get_trusted_user_id()
    if not user_id:
        return jsonify({"applications": [], "total_count": 0}), 200

    apps = db_session.query(ApplicationRecord).filter_by(user_id=user_id).order_by(ApplicationRecord.created_at.desc()).all()
    return jsonify({
        "applications": [a.to_dict() for a in apps],
        "total_count": len(apps)
    }), 200

@journey_bp.route("/applications", methods=["POST"])
@require_auth
def create_application():
    user_id = get_trusted_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}
    tender_id = data.get("tender_id", "").strip()
    bid_id = (data.get("bid_id") or data.get("portal_bid_id") or "").strip()
    if not tender_id or not bid_id:
        return jsonify({"error": "tender_id and bid_id are required."}), 400

    app_rec = ApplicationRecord(
        user_id=user_id,
        tender_id=tender_id,
        tender_title=data.get("tender_title", "Registration Application"),
        bid_id=bid_id,
        submission_date=data.get("submission_date", datetime.now(timezone.utc).strftime("%d %b %Y")),
        portal_name=data.get("portal_name", "Official Portal"),
        status=data.get("status", "SUBMITTED"),
        evaluated_date=data.get("evaluated_date", ""),
        award_amount=data.get("award_amount", ""),
        contract_status=data.get("contract_status", "PENDING"),
        project_progress_pct=int(data.get("project_progress_pct", 0)),
        notes=data.get("notes", "Submitted via official portal.")
    )
    db_session.add(app_rec)
    db_session.commit()

    return jsonify({
        "success": True,
        "message": "Application record saved.",
        "application": app_rec.to_dict()
    }), 201

@journey_bp.route("/finance/schemes", methods=["GET"])
def get_finance_schemes():
    return jsonify({
        "schemes": SAMPLE_FINANCIAL_SCHEMES,
        "total_count": len(SAMPLE_FINANCIAL_SCHEMES),
        "disclaimer": "Government scheme guidelines and eligibility are subject to official SIDBI and Ministry of MSME notifications."
    }), 200
