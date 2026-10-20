import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime
from app.database import Base

class RoadmapStep(Base):
    __tablename__ = "roadmap_steps"

    id = Column(String(100), primary_key=True) # e.g. "{user_id}_step-1"
    user_id = Column(String(36), nullable=True, index=True)
    step_key = Column(String(50), default="step-1") # e.g. "step-1", "step-2" ...
    step_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    short_title = Column(String(100), default="")
    category = Column(String(100), default="")
    description = Column(Text, default="")
    why_necessary = Column(Text, default="")
    applicability = Column(Text, default="")
    required_action = Column(Text, default="")
    required_documents_json = Column(Text, default="[]")
    official_portal_name = Column(String(255), default="")
    official_portal_url = Column(String(500), default="")
    verification_source = Column(String(255), default="")
    last_verified_date = Column(String(100), default="October 2026")
    estimated_duration = Column(String(100), default="")
    prerequisites_json = Column(Text, default="[]")
    internal_route = Column(String(100), default="")
    status = Column(String(50), default="NOT_STARTED") # NOT_STARTED, IN_PROGRESS, SUBMITTED, COMPLETED, NEEDS_ATTENTION
    progress_pct = Column(Integer, default=0)
    evidence_reference = Column(String(255), default="")
    reference_number = Column(String(255), default="")
    submission_date = Column(String(100), default="")
    notes = Column(Text, default="")
    completed_at = Column(DateTime, nullable=True)

    def to_dict(self):
        def parse_json(val, default):
            if not val:
                return default
            try:
                return json.loads(val)
            except Exception:
                return default

        ref = self.reference_number or self.evidence_reference or ""
        return {
            "id": self.id,
            "step_key": self.step_key or self.id,
            "user_id": self.user_id,
            "step_number": self.step_number,
            "title": self.title,
            "short_title": self.short_title or self.title,
            "category": self.category,
            "description": self.description,
            "why_necessary": self.why_necessary or "",
            "applicability": self.applicability or "Applicable to standard registrations",
            "required_action": self.required_action or self.description,
            "required_documents": parse_json(self.required_documents_json, []),
            "official_portal_name": self.official_portal_name,
            "official_portal_url": self.official_portal_url,
            "verification_source": self.verification_source or "Authoritative Government Portal",
            "last_verified_date": self.last_verified_date or "October 2026",
            "estimated_duration": self.estimated_duration or "3-7 business days",
            "prerequisites": parse_json(self.prerequisites_json, []),
            "internal_route": self.internal_route or "/roadmap",
            "status": self.status or "NOT_STARTED",
            "progress_pct": self.progress_pct if self.progress_pct is not None else 0,
            "evidence_reference": ref,
            "reference_number": ref,
            "submission_date": self.submission_date or "",
            "notes": self.notes or "",
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }

class ApplicationRecord(Base):
    __tablename__ = "application_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True, index=True)
    tender_id = Column(String(100), nullable=False)
    tender_title = Column(String(500), default="")
    bid_id = Column(String(100), nullable=False) # e.g. "GEM/BID/2026/89210-A"
    submission_date = Column(String(100), default="")
    portal_name = Column(String(100), default="GeM Portal")
    status = Column(String(50), default="SUBMITTED") # DRAFT, READY, SUBMITTED, UNDER_EVALUATION, RESULT_DECLARED, WON, NOT_WON
    evaluated_date = Column(String(100), default="")
    award_amount = Column(String(100), default="")
    contract_status = Column(String(50), default="PENDING") # PENDING, CONTRACT_SIGNED, PROJECT_STARTED, IN_PROGRESS, COMPLETED
    project_progress_pct = Column(Integer, default=0)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "tender_id": self.tender_id,
            "tender_title": self.tender_title,
            "bid_id": self.bid_id,
            "submission_date": self.submission_date,
            "portal_name": self.portal_name,
            "status": self.status,
            "evaluated_date": self.evaluated_date,
            "award_amount": self.award_amount,
            "contract_status": self.contract_status,
            "project_progress_pct": self.project_progress_pct,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
