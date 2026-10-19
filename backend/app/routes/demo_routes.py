import json
import uuid
from datetime import datetime, timezone
from flask import Blueprint, jsonify, session, request
from app.database import db_session
from app.models.user import User
from app.models.startup import Startup, Document
from app.models.tender import Tender, TenderVersion
from app.models.requirement import Requirement, EvidenceMapping
from app.models.audit import ActionItem, ReadinessAudit
from app.models.journey import RoadmapStep, ApplicationRecord
from app.services.mock_data import (
    SAMPLE_STARTUP,
    SAMPLE_DOCUMENTS,
    SAMPLE_TENDER,
    SAMPLE_REQUIREMENTS,
    SAMPLE_EVIDENCE,
    SAMPLE_ACTIONS,
    SAMPLE_CHANGES,
    SAMPLE_ROADMAP_STEPS,
    SAMPLE_APPLICATIONS
)

demo_bp = Blueprint("demo", __name__, url_prefix="/api/demo")

def get_or_create_demo_user():
    demo_user = db_session.query(User).filter_by(email="demo@procureease.in").first()
    if not demo_user:
        demo_user = User(
            id=str(uuid.uuid4()),
            name="Demo Founder",
            email="demo@procureease.in",
            company_name=SAMPLE_STARTUP["name"],
            is_demo=True
        )
        demo_user.set_password("demo1234")
        db_session.add(demo_user)
        db_session.commit()
    return demo_user

@demo_bp.route("/load", methods=["POST"])
def load_demo_data():
    """Seeds complete realistic fictional demo scenario for hackathon presentation without wiping real registered users."""
    demo_user = get_or_create_demo_user()

    # 1. Clear ONLY demo user's isolated records
    ApplicationRecord.query.filter_by(user_id=demo_user.id).delete()
    RoadmapStep.query.filter_by(user_id=demo_user.id).delete()
    Document.query.filter_by(user_id=demo_user.id).delete()
    Startup.query.filter_by(user_id=demo_user.id).delete()
    db_session.commit()

    # 2. Seed Demo Startup
    startup = Startup(
        user_id=demo_user.id,
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
        certifications_json=json.dumps(SAMPLE_STARTUP["certifications"])
    )
    db_session.add(startup)
    db_session.flush()

    # 3. Seed Documents for Demo User
    for d_data in SAMPLE_DOCUMENTS:
        doc = Document(
            user_id=demo_user.id,
            startup_id=startup.id,
            filename=d_data["filename"],
            original_filename=d_data["original_filename"],
            category=d_data["category"],
            file_size_bytes=d_data["file_size_bytes"],
            page_count=d_data["page_count"],
            status=d_data["status"],
            file_path=f"uploads/documents/{d_data['filename']}"
        )
        db_session.add(doc)

    # 4. Seed or refresh sample Tender
    tender = Tender.query.filter_by(tender_id=SAMPLE_TENDER["tender_id"]).first()
    if not tender:
        tender = Tender(
            title=SAMPLE_TENDER["title"],
            organization=SAMPLE_TENDER["organization"],
            tender_id=SAMPLE_TENDER["tender_id"],
            deadline=SAMPLE_TENDER["deadline"],
            emd_amount=SAMPLE_TENDER["emd_amount"],
            emd_exemption_allowed=SAMPLE_TENDER["emd_exemption_allowed"],
            estimated_budget=SAMPLE_TENDER["estimated_budget"],
            active_version=SAMPLE_TENDER["active_version"],
            file_path="uploads/tenders/GEM_2026_B_89210.pdf",
            total_pages=SAMPLE_TENDER["total_pages"]
        )
        db_session.add(tender)
        db_session.flush()

        t_version = TenderVersion(
            tender_id=tender.id,
            version_number=2,
            published_date="16 Oct 2026",
            deadline="28 Oct 2026",
            required_docs_count=6,
            change_summary_json=json.dumps(SAMPLE_CHANGES)
        )
        db_session.add(t_version)

        for r_data in SAMPLE_REQUIREMENTS:
            req = Requirement(
                id=r_data["id"],
                tender_id=tender.id,
                category=r_data["category"],
                title=r_data["title"],
                clause_text=r_data["clause_text"],
                plain_language=r_data["plain_language"],
                source_page=r_data["source_page"],
                source_section=r_data["source_section"],
                is_mandatory=r_data["is_mandatory"],
                potential_relaxation_rule=r_data["potential_relaxation_rule"],
                status=r_data["status"]
            )
            db_session.add(req)

        for e_data in SAMPLE_EVIDENCE:
            evidence = EvidenceMapping(
                requirement_id=e_data["requirement_id"],
                document_name=e_data["document_name"] or "",
                page_number=e_data["page_number"],
                evidence_text=e_data["evidence_text"],
                confidence=e_data["confidence"],
                status=e_data["status"],
                notes=e_data["notes"]
            )
            db_session.add(evidence)

        for a_data in SAMPLE_ACTIONS:
            action = ActionItem(
                id=a_data["id"],
                requirement_id=a_data["requirement_id"],
                title=a_data["title"],
                priority=a_data["priority"],
                reason=a_data["reason"],
                recommended_action=a_data["recommended_action"],
                status=a_data["status"]
            )
            db_session.add(action)

        audit = ReadinessAudit(
            tender_id=tender.id,
            startup_id=startup.id,
            overall_score=78,
            match_score=82,
            satisfied_count=12,
            partial_count=3,
            missing_critical_count=2,
            verification_count=3,
            score_breakdown_json=json.dumps({
                "base_satisfied_points": 60,
                "partial_evidence_points": 18,
                "missing_critical_deduction": 20,
                "verification_pending_deduction": 5
            }),
            final_status="NOT_READY_FOR_SUBMISSION"
        )
        db_session.add(audit)

    # 5. Seed Roadmap Steps for Demo User
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

    # 6. Seed Applications for Demo User
    for a in SAMPLE_APPLICATIONS:
        app_rec = ApplicationRecord(
            user_id=demo_user.id,
            tender_id=a["tender_id"],
            tender_title=a.get("tender_title", ""),
            bid_id=a["bid_id"],
            submission_date=a.get("submission_date", ""),
            portal_name=a.get("portal_name", "Government e-Marketplace (GeM)"),
            status=a.get("status", "SUBMITTED"),
            evaluated_date=a.get("evaluated_date", ""),
            award_amount=a.get("award_amount", ""),
            contract_status=a.get("contract_status", "PROJECT_STARTED"),
            project_progress_pct=a.get("project_progress_pct", 35),
            notes=a.get("notes", "")
        )
        db_session.add(app_rec)

    db_session.commit()

    return jsonify({
        "success": True,
        "message": "Fictional Demo Scenario loaded successfully! (SmartSense Technologies + Tender GEM/2026/B/89210 + 12-Step Guided Roadmap)",
        "startup": startup.to_dict(),
        "tender": tender.to_dict() if tender else None
    }), 200

@demo_bp.route("/reset", methods=["POST"])
def reset_demo_data():
    """Clears demo records from SQLite without affecting real users."""
    demo_user = db_session.query(User).filter_by(email="demo@procureease.in").first()
    if demo_user:
        ApplicationRecord.query.filter_by(user_id=demo_user.id).delete()
        RoadmapStep.query.filter_by(user_id=demo_user.id).delete()
        Document.query.filter_by(user_id=demo_user.id).delete()
        Startup.query.filter_by(user_id=demo_user.id).delete()
        db_session.commit()

    return jsonify({
        "success": True,
        "message": "Demo data reset to clean state."
    }), 200
