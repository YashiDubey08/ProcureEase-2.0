import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(String(50), primary_key=True) # e.g. REQ-001
    tender_id = Column(String(36), ForeignKey("tenders.id"), nullable=False)
    category = Column(String(100), nullable=False) # ELIGIBILITY, EXPERIENCE, FINANCIAL, TECHNICAL, CERTIFICATION, DOCUMENTS, SUBMISSION
    title = Column(String(255), nullable=False)
    clause_text = Column(Text, nullable=False) # Exact tender excerpt
    plain_language = Column(Text, default="") # Plain language translation
    source_page = Column(Integer, default=1)
    source_section = Column(String(255), default="")
    is_mandatory = Column(Boolean, default=True)
    potential_relaxation_rule = Column(String(255), default=None) # e.g. "Startup Prior Experience & Turnover Exemption Rule"
    status = Column(String(50), default="MISSING") # MET, PARTIAL, MISSING, VERIFY
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tender = relationship("Tender", back_populates="requirements")
    evidence_mappings = relationship("EvidenceMapping", back_populates="requirement", cascade="all, delete-orphan")
    actions = relationship("ActionItem", back_populates="requirement", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "tender_id": self.tender_id,
            "category": self.category,
            "title": self.title,
            "clause_text": self.clause_text,
            "plain_language": self.plain_language,
            "source_page": self.source_page,
            "source_section": self.source_section,
            "is_mandatory": self.is_mandatory,
            "potential_relaxation_rule": self.potential_relaxation_rule,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class EvidenceMapping(Base):
    __tablename__ = "evidence_mappings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requirement_id = Column(String(50), ForeignKey("requirements.id"), nullable=False)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)
    document_name = Column(String(255), default="")
    page_number = Column(Integer, default=1)
    evidence_text = Column(Text, default="")
    confidence = Column(String(50), default="HIGH") # HIGH, MEDIUM, NEEDS_VERIFICATION
    status = Column(String(50), default="MET") # MET, PARTIAL, MISSING, VERIFY
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    requirement = relationship("Requirement", back_populates="evidence_mappings")

    def to_dict(self):
        return {
            "id": self.id,
            "requirement_id": self.requirement_id,
            "document_id": self.document_id,
            "document_name": self.document_name,
            "page_number": self.page_number,
            "evidence_text": self.evidence_text,
            "confidence": self.confidence,
            "status": self.status,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
