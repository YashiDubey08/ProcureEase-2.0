import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Tender(Base):
    __tablename__ = "tenders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(500), nullable=False)
    organization = Column(String(255), nullable=False)
    tender_id = Column(String(100), nullable=False) # e.g. GEM/2026/B/89210
    deadline = Column(String(100), default="")
    emd_amount = Column(Float, default=0.0)
    emd_exemption_allowed = Column(Boolean, default=True)
    estimated_budget = Column(Float, default=0.0)
    active_version = Column(Integer, default=1)
    file_path = Column(String(500), default="")
    total_pages = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    requirements = relationship("Requirement", back_populates="tender", cascade="all, delete-orphan")
    versions = relationship("TenderVersion", back_populates="tender", cascade="all, delete-orphan")
    audits = relationship("ReadinessAudit", back_populates="tender", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "organization": self.organization,
            "tender_id": self.tender_id,
            "deadline": self.deadline,
            "emd_amount": self.emd_amount,
            "emd_exemption_allowed": self.emd_exemption_allowed,
            "estimated_budget": self.estimated_budget,
            "active_version": self.active_version,
            "total_pages": self.total_pages,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class TenderVersion(Base):
    __tablename__ = "tender_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tender_id = Column(String(36), ForeignKey("tenders.id"), nullable=False)
    version_number = Column(Integer, default=1)
    published_date = Column(String(100), default="")
    deadline = Column(String(100), default="")
    required_docs_count = Column(Integer, default=0)
    change_summary_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tender = relationship("Tender", back_populates="versions")

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "tender_id": self.tender_id,
            "version_number": self.version_number,
            "published_date": self.published_date,
            "deadline": self.deadline,
            "required_docs_count": self.required_docs_count,
            "change_summary": json.loads(self.change_summary_json) if self.change_summary_json else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
