import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(String(50), primary_key=True) # e.g. ACT-001
    requirement_id = Column(String(50), ForeignKey("requirements.id"), nullable=False)
    title = Column(String(255), nullable=False)
    priority = Column(String(50), default="HIGH") # CRITICAL, HIGH, MEDIUM, VERIFICATION
    reason = Column(Text, default="")
    recommended_action = Column(Text, default="")
    status = Column(String(50), default="NOT_STARTED") # NOT_STARTED, IN_PROGRESS, COMPLETED, NEEDS_VERIFICATION
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    requirement = relationship("Requirement", back_populates="actions")

    def to_dict(self):
        return {
            "id": self.id,
            "requirement_id": self.requirement_id,
            "title": self.title,
            "priority": self.priority,
            "reason": self.reason,
            "recommended_action": self.recommended_action,
            "status": self.status,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class ReadinessAudit(Base):
    __tablename__ = "readiness_audits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tender_id = Column(String(36), ForeignKey("tenders.id"), nullable=False)
    startup_id = Column(String(36), ForeignKey("startups.id"), nullable=True)
    overall_score = Column(Integer, default=0) # 0 to 100
    match_score = Column(Integer, default=0) # 0 to 100
    satisfied_count = Column(Integer, default=0)
    partial_count = Column(Integer, default=0)
    missing_critical_count = Column(Integer, default=0)
    verification_count = Column(Integer, default=0)
    score_breakdown_json = Column(Text, default="{}")
    final_status = Column(String(100), default="NOT_READY_FOR_SUBMISSION") # NOT_READY_FOR_SUBMISSION, READY_FOR_SUBMISSION
    disclaimer_acknowledged = Column(Boolean, default=False)
    computed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tender = relationship("Tender", back_populates="audits")

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "tender_id": self.tender_id,
            "startup_id": self.startup_id,
            "overall_score": self.overall_score,
            "match_score": self.match_score,
            "satisfied_count": self.satisfied_count,
            "partial_count": self.partial_count,
            "missing_critical_count": self.missing_critical_count,
            "verification_count": self.verification_count,
            "score_breakdown": json.loads(self.score_breakdown_json) if self.score_breakdown_json else {},
            "final_status": self.final_status,
            "disclaimer_acknowledged": self.disclaimer_acknowledged,
            "computed_at": self.computed_at.isoformat() if self.computed_at else None,
        }
