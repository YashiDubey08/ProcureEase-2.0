import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime
from app.database import Base

class RoadmapStep(Base):
    __tablename__ = "roadmap_steps"

    id = Column(String(100), primary_key=True) # e.g. "{user_id}_step-1"
    user_id = Column(String(36), nullable=True, index=True)
    step_key = Column(String(50), default="step-1") # e.g. "step-1", "step-2" ... "step-12"
    step_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    short_title = Column(String(100), default="")
    category = Column(String(100), default="")
    description = Column(Text, default="")
    required_action = Column(Text, default="")
    official_portal_name = Column(String(255), default="")
    official_portal_url = Column(String(500), default="")
    internal_route = Column(String(100), default="")
    status = Column(String(50), default="LOCKED") # LOCKED, IN_PROGRESS, COMPLETED
    progress_pct = Column(Integer, default=0)
    evidence_reference = Column(String(255), default="") # e.g. "DIPP98214", "GEM-BID-2026-991"
    notes = Column(Text, default="")
    completed_at = Column(DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.step_key or self.id,
            "step_key": self.step_key or self.id,
            "user_id": self.user_id,
            "step_number": self.step_number,
            "title": self.title,
            "short_title": self.short_title,
            "category": self.category,
            "description": self.description,
            "required_action": self.required_action,
            "official_portal_name": self.official_portal_name,
            "official_portal_url": self.official_portal_url,
            "internal_route": self.internal_route,
            "status": self.status,
            "progress_pct": self.progress_pct,
            "evidence_reference": self.evidence_reference,
            "notes": self.notes,
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
