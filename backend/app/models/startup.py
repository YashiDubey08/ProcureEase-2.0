import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Startup(Base):
    __tablename__ = "startups"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True, index=True)
    
    # Basic Information
    name = Column(String(255), nullable=False)
    founder_name = Column(String(255), default="")
    email = Column(String(255), default="")
    phone = Column(String(50), default="")
    sector = Column(String(255), default="")
    business_domain = Column(String(100), default="Technology")
    state_location = Column(String(100), default="")
    business_structure = Column(String(100), default="Private Limited Company")
    product_description = Column(Text, default="")

    # Operational & Legal Applicability Factors
    has_employees = Column(Boolean, default=False)
    has_physical_premises = Column(Boolean, default=False)
    is_interstate_or_ecommerce = Column(Boolean, default=False)
    creates_ip = Column(Boolean, default=True)

    # Business Information
    company_stage = Column(String(100), default="") # Ideation, Early Stage, Seed, Growth, Scaled
    dpiit_status = Column(Boolean, default=False) # DPIIT Recognized Startup
    dpiit_number = Column(String(100), default="")
    msme_status = Column(Boolean, default=False) # MSME / Udyam Registered
    msme_number = Column(String(100), default="")
    gst_status = Column(String(50), default="") # Registered, Exempt, In Process
    gstin = Column(String(50), default="")
    years_experience = Column(Integer, default=0)
    team_size = Column(Integer, default=0)
    annual_turnover_lakhs = Column(Float, default=0.0)

    # Capability Information (JSON encoded strings or text)
    capabilities_json = Column(Text, default="[]")
    products_services_json = Column(Text, default="[]")
    past_projects_json = Column(Text, default="[]")
    certifications_json = Column(Text, default="[]")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    documents = relationship("Document", back_populates="startup", cascade="all, delete-orphan")

    def to_dict(self):
        def parse_json(val, default):
            if not val:
                return default
            try:
                return json.loads(val)
            except Exception:
                return default

        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "founder_name": self.founder_name,
            "email": self.email,
            "phone": self.phone,
            "sector": self.sector,
            "business_domain": self.business_domain or self.sector or "Technology",
            "state_location": self.state_location or "",
            "business_structure": self.business_structure or "Private Limited Company",
            "has_employees": bool(self.has_employees),
            "has_physical_premises": bool(self.has_physical_premises),
            "is_interstate_or_ecommerce": bool(self.is_interstate_or_ecommerce),
            "creates_ip": bool(self.creates_ip),
            "product_description": self.product_description,
            "company_stage": self.company_stage or "Early Stage",
            "dpiit_status": bool(self.dpiit_status),
            "dpiit_number": self.dpiit_number or "",
            "msme_status": bool(self.msme_status),
            "msme_number": self.msme_number or "",
            "gst_status": self.gst_status or "",
            "gstin": self.gstin or "",
            "years_experience": self.years_experience if self.years_experience is not None else 0,
            "team_size": self.team_size if self.team_size is not None else 0,
            "annual_turnover_lakhs": self.annual_turnover_lakhs if self.annual_turnover_lakhs is not None else 0.0,
            "capabilities": parse_json(self.capabilities_json, []),
            "products_services": parse_json(self.products_services_json, []),
            "past_projects": parse_json(self.past_projects_json, []),
            "certifications": parse_json(self.certifications_json, []),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    startup_id = Column(String(36), ForeignKey("startups.id"), nullable=True)
    user_id = Column(String(36), nullable=True, index=True)
    step_key = Column(String(50), nullable=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    file_path = Column(String(500), default="")
    file_size_bytes = Column(Integer, default=0)
    page_count = Column(Integer, default=1)
    status = Column(String(50), default="Available for Evidence Mapping")
    preparation_status = Column(String(50), default="UPLOADED") # NOT_PREPARED, DRAFT, PREPARED_LOCAL, UPLOADED
    is_required = Column(Boolean, default=True)
    mime_type = Column(String(100), default="")
    upload_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    startup = relationship("Startup", back_populates="documents")

    def to_dict(self):
        return {
            "id": self.id,
            "startup_id": self.startup_id,
            "user_id": self.user_id,
            "step_key": self.step_key,
            "filename": self.filename,
            "original_filename": self.original_filename,
            "category": self.category,
            "file_size_bytes": self.file_size_bytes,
            "page_count": self.page_count,
            "status": self.status,
            "preparation_status": self.preparation_status or "UPLOADED",
            "is_required": bool(self.is_required),
            "mime_type": self.mime_type or "",
            "upload_date": self.upload_date.isoformat() if self.upload_date else None,
        }
