"""
ProcureEase 2.0 - Deterministic Startup Documentation Roadmap Engine
Personalizes registration and compliance steps based on startup domain,
business structure, state, and operational parameters.
Verified against official Government of India portals and statutory requirements.
"""

import json
from datetime import datetime, timezone
from app.database import db_session
from app.models.journey import RoadmapStep
from app.models.startup import Document, Startup

# Verified Official Government Portals Catalog
PORTALS = {
    "MCA": {
        "name": "Ministry of Corporate Affairs (MCA21)",
        "url": "https://www.mca.gov.in/",
        "authority": "Ministry of Corporate Affairs, Govt of India",
        "verified": "October 2026"
    },
    "INCOME_TAX": {
        "name": "Income Tax Department / Protean e-Gov",
        "url": "https://www.incometax.gov.in/",
        "authority": "Central Board of Direct Taxes (CBDT)",
        "verified": "October 2026"
    },
    "GST": {
        "name": "GST Common Portal (gst.gov.in)",
        "url": "https://www.gst.gov.in/",
        "authority": "Goods and Services Tax Network (GSTN)",
        "verified": "October 2026"
    },
    "UDYAM": {
        "name": "Udyam Registration Portal",
        "url": "https://udyamregistration.gov.in/",
        "authority": "Ministry of Micro, Small and Medium Enterprises",
        "verified": "October 2026"
    },
    "STARTUP_INDIA": {
        "name": "Startup India Portal (DPIIT)",
        "url": "https://www.startupindia.gov.in/",
        "authority": "Department for Promotion of Industry and Internal Trade",
        "verified": "October 2026"
    },
    "FSSAI": {
        "name": "FoSCoS - Food Safety Compliance System",
        "url": "https://foscos.fssai.gov.in/",
        "authority": "Food Safety and Standards Authority of India",
        "verified": "October 2026"
    },
    "CDSCO": {
        "name": "CDSCO SUGAM Medical Portal",
        "url": "https://cdsco.gov.in/",
        "authority": "Central Drugs Standard Control Organization",
        "verified": "October 2026"
    },
    "LEGAL_METROLOGY": {
        "name": "National Consumer Affairs Portal",
        "url": "https://consumeraffairs.nic.in/",
        "authority": "Department of Consumer Affairs",
        "verified": "October 2026"
    },
    "PARIVESH": {
        "name": "PARIVESH Environmental Clearance Portal",
        "url": "https://parivesh.nic.in/",
        "authority": "Ministry of Environment, Forest and Climate Change",
        "verified": "October 2026"
    },
    "SHRAM_SUVIDHA": {
        "name": "Unified Shram Suvidha Portal (EPFO & ESIC)",
        "url": "https://shramsuvidha.gov.in/",
        "authority": "Ministry of Labour and Employment",
        "verified": "October 2026"
    },
    "IP_INDIA": {
        "name": "Intellectual Property India (CGPDTM)",
        "url": "https://ipindia.gov.in/",
        "authority": "Office of the Controller General of Patents, Designs & Trade Marks",
        "verified": "October 2026"
    },
    "RBI": {
        "name": "Reserve Bank of India Banking Guidance",
        "url": "https://www.rbi.org.in/",
        "authority": "Reserve Bank of India",
        "verified": "October 2026"
    }
}

# States with mandatory State Professional Tax (PT)
PT_STATES = {
    "maharashtra", "karnataka", "tamil nadu", "gujarat", "west bengal",
    "telangana", "andhra pradesh", "kerala", "madhya pradesh", "assam", "odisha"
}

def generate_personalized_roadmap_templates(profile: dict) -> list:
    """
    Deterministically computes the required sequence of roadmap steps tailored
    to the startup's domain, structure, stage, location, and operational parameters.
    """
    domain = (profile.get("business_domain") or profile.get("sector") or "Technology").strip()
    structure = (profile.get("business_structure") or "Private Limited Company").strip()
    state = (profile.get("state_location") or "").strip().lower()
    has_employees = bool(profile.get("has_employees", False) or (profile.get("team_size") or 0) > 1)
    has_premises = bool(profile.get("has_physical_premises", False))
    is_interstate = bool(profile.get("is_interstate_or_ecommerce", False) or domain in ["E-commerce", "Manufacturing"])
    creates_ip = bool(profile.get("creates_ip", True))

    steps = []

    # 1. ENTITY INCORPORATION / LEGAL REGISTRATION
    if "Private Limited" in structure or "One Person Company" in structure:
        steps.append({
            "step_key": "step-incorporation",
            "category": "Entity Incorporation",
            "title": "Incorporate as Private Limited / OPC via SPICe+",
            "short_title": "MCA Entity Incorporation",
            "description": "File the integrated SPICe+ (INC-32) form on the MCA21 portal to reserve company name, incorporate the legal entity, and issue DIN, PAN, TAN, and EPFO/ESIC registrations in a single filing.",
            "why_necessary": "A Private Limited Company creates an independent legal entity with limited liability, required for raising venture equity and issuing ESOPs.",
            "applicability": f"Mandatory for {structure} entities in India.",
            "prerequisites": [],
            "required_documents": [
                {"name": "Digital Signature Certificate (DSC)", "category": "Legal", "is_required": True, "explanation": "Class 3 DSC for proposed directors to electronically sign MCA filings."},
                {"name": "Director PAN & Identity Proof", "category": "Identity", "is_required": True, "explanation": "Self-attested PAN card and Aadhaar/Passport/Voter ID for all directors."},
                {"name": "Director Address Proof", "category": "Identity", "is_required": True, "explanation": "Bank statement or utility bill (less than 2 months old) for all directors."},
                {"name": "Registered Office Address Proof", "category": "Legal", "is_required": True, "explanation": "Recent electricity/water/property tax bill for the registered office address."},
                {"name": "Landlord NOC / Rent Agreement", "category": "Legal", "is_required": True, "explanation": "Signed No-Objection Certificate from premises owner allowing commercial registered office."}
            ],
            "official_portal_name": PORTALS["MCA"]["name"],
            "official_portal_url": PORTALS["MCA"]["url"],
            "verification_source": "Companies Act, 2013 & MCA SPICe+ Integration (MCA21)",
            "last_verified_date": PORTALS["MCA"]["verified"],
            "estimated_duration": "3 to 7 business days"
        })
    elif "LLP" in structure or "Limited Liability Partnership" in structure:
        steps.append({
            "step_key": "step-incorporation",
            "category": "Entity Incorporation",
            "title": "Incorporate LLP via FiLLiP Portal",
            "short_title": "LLP Incorporation",
            "description": "File FiLLiP form on the Ministry of Corporate Affairs portal for name reservation and incorporation of the Limited Liability Partnership, followed by drafting Form 3 (LLP Agreement).",
            "why_necessary": "Provides partnership flexibility with corporate limited liability protection and lower recurring compliance overhead than a Pvt Ltd.",
            "applicability": "Mandatory for Limited Liability Partnerships.",
            "prerequisites": [],
            "required_documents": [
                {"name": "Designated Partner DSC", "category": "Legal", "is_required": True, "explanation": "Class 3 DSC for designated partners."},
                {"name": "Partner PAN & Identity Proof", "category": "Identity", "is_required": True, "explanation": "PAN card and government photo ID of all partners."},
                {"name": "Registered Office Address Proof & NOC", "category": "Legal", "is_required": True, "explanation": "Utility bill and signed owner NOC for the LLP registered office address."},
                {"name": "LLP Agreement (Form 3)", "category": "Legal", "is_required": True, "explanation": "Executed partnership agreement defining profit share and partner duties, stamped per state stamp act."}
            ],
            "official_portal_name": PORTALS["MCA"]["name"],
            "official_portal_url": PORTALS["MCA"]["url"],
            "verification_source": "Limited Liability Partnership Act, 2008 (MCA)",
            "last_verified_date": PORTALS["MCA"]["verified"],
            "estimated_duration": "5 to 10 business days"
        })
    else:
        # Sole Proprietorship / Partnership / Planning
        steps.append({
            "step_key": "step-incorporation",
            "category": "Entity Incorporation",
            "title": "Establish Business Identity & Partnership Deed",
            "short_title": "Business Identity Establishment",
            "description": "Execute a formal partnership deed (if partnership) or establish commercial existence via Shop & Establishment and MSME Udyam registration (if proprietorship).",
            "why_necessary": "Establishes verifiable legal proof of business existence required by banks to open a current commercial bank account.",
            "applicability": f"Applicable for {structure} businesses.",
            "prerequisites": [],
            "required_documents": [
                {"name": "Proprietor / Partner PAN & Aadhaar", "category": "Identity", "is_required": True, "explanation": "Proof of identity and address of the business owner(s)."},
                {"name": "Partnership Deed (if applicable)", "category": "Legal", "is_required": False, "explanation": "Executed deed on judicial stamp paper outlining partner shares and terms."},
                {"name": "Business Premises Proof", "category": "Legal", "is_required": True, "explanation": "Electricity bill, rent agreement, or ownership title of the business location."}
            ],
            "official_portal_name": PORTALS["UDYAM"]["name"],
            "official_portal_url": PORTALS["UDYAM"]["url"],
            "verification_source": "Indian Partnership Act, 1932 & State Commercial Rules",
            "last_verified_date": PORTALS["UDYAM"]["verified"],
            "estimated_duration": "2 to 5 business days"
        })

    # 2. PAN & TAN
    steps.append({
        "step_key": "step-pan-tan",
        "category": "Tax & Regulatory",
        "title": "Obtain Permanent Account Number (PAN) & TAN",
        "short_title": "PAN & TAN Allocation",
        "description": "Verify or apply for entity PAN and Tax Deduction Account Number (TAN) for commercial tax compliance and Tax Deducted at Source (TDS) obligations.",
        "why_necessary": "PAN is the foundational tax identifier in India required for opening bank accounts, invoicing clients, and filing statutory returns.",
        "applicability": "Mandatory for all legal entities. (Integrated automatically if incorporated via MCA SPICe+).",
        "prerequisites": ["step-incorporation"],
        "required_documents": [
            {"name": "Certificate of Incorporation / Partnership Deed", "category": "Legal", "is_required": True, "explanation": "Proof of formation issued by MCA or notarized partnership agreement."},
            {"name": "Authorized Signatory Proof", "category": "Identity", "is_required": True, "explanation": "Identity and address proof of the authorized director or managing partner."}
        ],
        "official_portal_name": PORTALS["INCOME_TAX"]["name"],
        "official_portal_url": PORTALS["INCOME_TAX"]["url"],
        "verification_source": "Income Tax Act, 1961 (CBDT)",
        "last_verified_date": PORTALS["INCOME_TAX"]["verified"],
        "estimated_duration": "1 to 3 business days"
    })

    # 3. CURRENT BANK ACCOUNT
    steps.append({
        "step_key": "step-bank-account",
        "category": "Banking & Finance",
        "title": "Open Dedicated Startup Current Bank Account",
        "short_title": "Current Bank Account",
        "description": "Open a dedicated commercial current account with any RBI-scheduled bank using Certificate of Incorporation, PAN, Board Resolution, and KYC documents.",
        "why_necessary": "Commits shareholder capital, separates business cash flows from personal funds, and enables formal vendor/customer payment collection.",
        "applicability": "Mandatory for all commercial transactions.",
        "prerequisites": ["step-incorporation", "step-pan-tan"],
        "required_documents": [
            {"name": "Certificate of Incorporation / Deed & Entity PAN", "category": "Legal", "is_required": True, "explanation": "Primary constitutional proofs of business."},
            {"name": "Board Resolution for Account Opening", "category": "Legal", "is_required": True, "explanation": "Certified board resolution authorizing specific directors to operate the bank account."},
            {"name": "Director / Signatory KYC Documents", "category": "Identity", "is_required": True, "explanation": "PAN cards and Aadhaar/passports of all authorized bank signatories."}
        ],
        "official_portal_name": PORTALS["RBI"]["name"],
        "official_portal_url": PORTALS["RBI"]["url"],
        "verification_source": "RBI Master Direction - Know Your Customer (KYC) Directions",
        "last_verified_date": PORTALS["RBI"]["verified"],
        "estimated_duration": "2 to 5 business days"
    })

    # 4. GST REGISTRATION
    gst_why = "Mandatory for inter-state business, e-commerce supply, or turnover exceeding threshold. Essential for B2B input tax credit."
    gst_app = "Mandatory if selling online, operating inter-state, or exceeding Rs 20L/40L threshold."
    if domain == "E-commerce" or is_interstate:
        gst_app = "Mandatory regardless of turnover due to inter-state supply and online commerce provisions under Section 24 of the CGST Act."

    steps.append({
        "step_key": "step-gst",
        "category": "Tax & Regulatory",
        "title": "Register for Goods and Services Tax (GSTIN)",
        "short_title": "GST Registration",
        "description": "Apply for a 15-digit GSTIN on the official GST Common Portal (REG-01) for state and central tax compliance, invoicing, and input tax credit.",
        "why_necessary": gst_why,
        "applicability": gst_app,
        "prerequisites": ["step-incorporation", "step-pan-tan", "step-bank-account"],
        "required_documents": [
            {"name": "Entity PAN & Incorporation Certificate", "category": "Legal", "is_required": True, "explanation": "Fundamental tax and constitutional documents."},
            {"name": "Principal Place of Business Proof", "category": "Legal", "is_required": True, "explanation": "Electricity bill, rent agreement, and signed landlord consent/NOC."},
            {"name": "Bank Proof (Cancelled Cheque or First Page of Passbook)", "category": "Banking", "is_required": True, "explanation": "Shows entity account number, MICR, and IFSC code."},
            {"name": "Authorized Signatory Letter of Authorization", "category": "Legal", "is_required": True, "explanation": "Board resolution or authorization letter nominating primary GST signatory."}
        ],
        "official_portal_name": PORTALS["GST"]["name"],
        "official_portal_url": PORTALS["GST"]["url"],
        "verification_source": "Central Goods and Services Tax Act, 2017 (CBIC)",
        "last_verified_date": PORTALS["GST"]["verified"],
        "estimated_duration": "3 to 7 business days"
    })

    # 5. MSME / UDYAM REGISTRATION
    steps.append({
        "step_key": "step-udyam",
        "category": "Government Recognition",
        "title": "Obtain MSME Udyam Registration Certificate",
        "short_title": "MSME Udyam Registration",
        "description": "Register on the official government Udyam Registration Portal. Completely paperless, free of cost, and instant verification using Aadhaar and PAN.",
        "why_necessary": "Unlocks priority sector bank lending, collateral-free credit under CGTMSE, mandatory exemption from Earnest Money Deposits (EMD) in public procurement, and protection against delayed payments.",
        "applicability": "Applicable to Micro, Small, and Medium enterprises in India (Manufacturing and Services).",
        "prerequisites": ["step-incorporation", "step-pan-tan", "step-bank-account"],
        "required_documents": [
            {"name": "Promoter Aadhaar & Business PAN", "category": "Identity", "is_required": True, "explanation": "Aadhaar of proprietor/director and corporate PAN."},
            {"name": "Bank Account & IFSC Details", "category": "Banking", "is_required": True, "explanation": "Active business current account details."}
        ],
        "official_portal_name": PORTALS["UDYAM"]["name"],
        "official_portal_url": PORTALS["UDYAM"]["url"],
        "verification_source": "MSMED Act, 2006 (Ministry of MSME)",
        "last_verified_date": PORTALS["UDYAM"]["verified"],
        "estimated_duration": "Same day (Instant digital certificate)"
    })

    # 6. DPIIT STARTUP INDIA RECOGNITION
    steps.append({
        "step_key": "step-dpiit",
        "category": "Government Recognition",
        "title": "Apply for DPIIT Startup India Recognition",
        "short_title": "Startup India Recognition (DPIIT)",
        "description": "Submit application on the official Startup India portal to receive DPIIT Recognition Certificate, unlocking statutory exemptions and incubator support.",
        "why_necessary": "Entitles eligible startups to 3-year income tax exemption under Section 80-IAC, angel tax relief, 80% discount on patent filing fees, 50% discount on trademark fees, and exemption from prior turnover/experience under GFR 2017 Rule 173(i).",
        "applicability": "Available to entities incorporated as Pvt Ltd, LLP, or Registered Partnership within the last 10 years, with turnover under Rs 100 Crore and demonstrable innovation.",
        "prerequisites": ["step-incorporation", "step-pan-tan"],
        "required_documents": [
            {"name": "Certificate of Incorporation / Registration", "category": "Legal", "is_required": True, "explanation": "Issued by Registrar of Companies (MCA) or Registrar of Firms."},
            {"name": "Startup Innovation & Product Write-up", "category": "Technical", "is_required": True, "explanation": "Brief description highlighting innovation, scalability, and wealth/employment creation potential."},
            {"name": "Website / Pitch Deck / Product Demo Link", "category": "Technical", "is_required": False, "explanation": "Evidence of working product or proof of concept."}
        ],
        "official_portal_name": PORTALS["STARTUP_INDIA"]["name"],
        "official_portal_url": PORTALS["STARTUP_INDIA"]["url"],
        "verification_source": "DPIIT Notification G.S.R. 127(E), Ministry of Commerce & Industry",
        "last_verified_date": PORTALS["STARTUP_INDIA"]["verified"],
        "estimated_duration": "2 to 4 business days"
    })

    # 7. DOMAIN-SPECIFIC MANDATORY LICENSES
    if domain == "Food and Agriculture":
        steps.append({
            "step_key": "step-fssai-food-license",
            "category": "Domain Regulatory License",
            "title": "FSSAI Food Business License / Registration via FoSCoS",
            "short_title": "FSSAI Food Safety License",
            "description": "Apply on the FoSCoS portal for an FSSAI Basic Registration (turnover up to Rs 12L) or State/Central License for manufacturing, processing, packaging, storage, or distribution of food products.",
            "why_necessary": "Mandatory under the Food Safety and Standards Act. Operating without an FSSAI license carries penalties and prohibits sale across retail or digital food marketplaces.",
            "applicability": "Mandatory for all food, beverage, organic produce, cloud kitchens, and agritech food processing businesses in India.",
            "prerequisites": ["step-incorporation", "step-bank-account", "step-gst"],
            "required_documents": [
                {"name": "Food Business Operator (FBO) Photo & ID Proof", "category": "Identity", "is_required": True, "explanation": "Government photo ID of the authorized food business manager."},
                {"name": "Premises Proof & Layout Blueprint", "category": "Legal", "is_required": True, "explanation": "Rent agreement/ownership document and equipment layout plan."},
                {"name": "Food Product Category List", "category": "Technical", "is_required": True, "explanation": "Detailed list of food products, ingredients, and storage conditions."},
                {"name": "Water Potability Test Report (if manufacturing)", "category": "Technical", "is_required": False, "explanation": "NABL-accredited laboratory report confirming water safety standards."}
            ],
            "official_portal_name": PORTALS["FSSAI"]["name"],
            "official_portal_url": PORTALS["FSSAI"]["url"],
            "verification_source": "Food Safety and Standards Act, 2006 & Regulations (FSSAI)",
            "last_verified_date": PORTALS["FSSAI"]["verified"],
            "estimated_duration": "7 to 20 business days"
        })
    elif domain == "Healthcare":
        steps.append({
            "step_key": "step-cdsco-medical-devices",
            "category": "Domain Regulatory License",
            "title": "CDSCO Medical Device / Drug Licensing via SUGAM",
            "short_title": "CDSCO Medical Compliance",
            "description": "Register on the official CDSCO SUGAM portal for medical device classification (Class A/B/C/D), manufacturing licenses (Form MD-3/MD-5), or state drug authority clinical trial permissions.",
            "why_necessary": "Mandatory under the Medical Devices Rules to market, distribute, or import medical equipment, diagnostic software, or healthcare pharmaceuticals.",
            "applicability": "Mandatory for digital health hardware, medical devices, biotechnology, and diagnostic solutions.",
            "prerequisites": ["step-incorporation", "step-gst", "step-bank-account"],
            "required_documents": [
                {"name": "Device Master File (DMF) & Technical Dossier", "category": "Technical", "is_required": True, "explanation": "Complete technical specifications, risk analysis, and clinical evaluations."},
                {"name": "ISO 13485 Quality Management Certificate", "category": "Technical", "is_required": True, "explanation": "Medical devices quality management system standard certification."},
                {"name": "Premises Site Master File & Factory Approval", "category": "Legal", "is_required": True, "explanation": "Proof of manufacturing environment and environmental controls."}
            ],
            "official_portal_name": PORTALS["CDSCO"]["name"],
            "official_portal_url": PORTALS["CDSCO"]["url"],
            "verification_source": "Medical Devices Rules, 2017 & Drugs and Cosmetics Act (CDSCO)",
            "last_verified_date": PORTALS["CDSCO"]["verified"],
            "estimated_duration": "15 to 45 business days"
        })
    elif domain == "E-commerce":
        steps.append({
            "step_key": "step-legal-metrology-ecommerce",
            "category": "Domain Regulatory License",
            "title": "Legal Metrology Packaged Commodities & E-Commerce Compliance",
            "short_title": "Legal Metrology & Consumer Rules",
            "description": "Register under the Legal Metrology (Packaged Commodities) Rules and implement mandatory e-commerce consumer disclosures (country of origin, manufacturer, expiry, and grievance officer).",
            "why_necessary": "Mandatory for direct-to-consumer and marketplace selling. Failure to register attracts seizure of inventory and statutory compounding penalties.",
            "applicability": "Mandatory for all entities selling pre-packaged products online or operating an online commerce marketplace.",
            "prerequisites": ["step-incorporation", "step-gst"],
            "required_documents": [
                {"name": "Packaging Label Mockup / Declarations", "category": "Technical", "is_required": True, "explanation": "Proof of label displaying net quantity, MRP, consumer care, and origin."},
                {"name": "Grievance Redressal Officer Notification", "category": "Legal", "is_required": True, "explanation": "Formal appointment and website disclosure of the designated grievance officer."},
                {"name": "GST Registration Certificate", "category": "Tax", "is_required": True, "explanation": "Proof of active commercial GSTIN."}
            ],
            "official_portal_name": PORTALS["LEGAL_METROLOGY"]["name"],
            "official_portal_url": PORTALS["LEGAL_METROLOGY"]["url"],
            "verification_source": "Legal Metrology Act, 2009 & Consumer Protection (E-Commerce) Rules, 2020",
            "last_verified_date": PORTALS["LEGAL_METROLOGY"]["verified"],
            "estimated_duration": "5 to 14 business days"
        })
    elif domain == "Manufacturing":
        steps.append({
            "step_key": "step-spcb-parivesh-clearances",
            "category": "Domain Regulatory License",
            "title": "Pollution Control Board Consent (CTE/CTO) via PARIVESH",
            "short_title": "SPCB Environmental Clearances",
            "description": "Apply for Consent to Establish (CTE) and subsequent Consent to Operate (CTO) from the State Pollution Control Board according to industrial classification (White, Green, Orange, or Red).",
            "why_necessary": "Mandatory under the Water Act and Air Act before installing machinery or commencing commercial manufacturing production.",
            "applicability": "Mandatory for physical manufacturing units, processing plants, and assembly facilities.",
            "prerequisites": ["step-incorporation", "step-gst"],
            "required_documents": [
                {"name": "Manufacturing Process Flow & Raw Material List", "category": "Technical", "is_required": True, "explanation": "Detailed engineering flowchart of process steps and emissions/effluents."},
                {"name": "Site Layout & Industrial Land Title / Lease", "category": "Legal", "is_required": True, "explanation": "Approved factory layout within designated industrial zone."},
                {"name": "Pollution Control & Waste Treatment Plan", "category": "Technical", "is_required": True, "explanation": "Schematic for effluent treatment (ETP/STP) and hazardous waste handling."}
            ],
            "official_portal_name": PORTALS["PARIVESH"]["name"],
            "official_portal_url": PORTALS["PARIVESH"]["url"],
            "verification_source": "Water (Prevention & Control of Pollution) Act 1974 & Air Act 1981 (CPCB)",
            "last_verified_date": PORTALS["PARIVESH"]["verified"],
            "estimated_duration": "15 to 45 business days"
        })
    else:
        # Technology / Education / Other
        steps.append({
            "step_key": "step-dpdp-compliance",
            "category": "Domain Regulatory License",
            "title": "Data Protection & Terms of Service Legal Architecture",
            "short_title": "Digital Governance & Privacy Compliance",
            "description": "Implement privacy policies, user consent architecture, data retention schedules, and terms of service compliant with the Digital Personal Data Protection (DPDP) Act, 2023.",
            "why_necessary": "Ensures legal enforceability of user contracts, protects company intellectual property, and avoids substantial statutory penalties for personal data breaches.",
            "applicability": "Mandatory for digital platforms, SaaS applications, mobile applications, and online educational portals.",
            "prerequisites": ["step-incorporation"],
            "required_documents": [
                {"name": "Privacy Policy & Cookie Consent Policy", "category": "Legal", "is_required": True, "explanation": "Formal disclosure of personal data collection, processing, and storage practices."},
                {"name": "Customer Terms of Service / SaaS Agreement", "category": "Legal", "is_required": True, "explanation": "Binding contract defining licensing terms, warranties, and limitation of liability."},
                {"name": "Data Protection Officer / Grievance Officer Notice", "category": "Legal", "is_required": True, "explanation": "Designation of contact point for user data correction and grievance redressal."}
            ],
            "official_portal_name": PORTALS["MCA"]["name"],
            "official_portal_url": "https://www.meity.gov.in/",
            "verification_source": "Digital Personal Data Protection Act, 2023 & IT Act, 2000 (MeitY)",
            "last_verified_date": "October 2026",
            "estimated_duration": "3 to 7 business days"
        })

    # 8. LABOR & SOCIAL SECURITY (EPFO & ESIC)
    steps.append({
        "step_key": "step-shram-suvidha",
        "category": "Labor & Workplace",
        "title": "Register on Shram Suvidha for EPFO & ESIC",
        "short_title": "EPFO & ESIC Registration",
        "description": "Obtain Shram Suvidha Unified LIN (Labour Identification Number) and register for Employees' Provident Fund (EPF) and Employee State Insurance (ESI).",
        "why_necessary": "EPF is mandatory for entities with 20+ employees (voluntary earlier); ESI is mandatory for entities with 10+ employees. Integrated during MCA SPICe+ for new companies.",
        "applicability": "Applicable when hiring full-time staff or voluntary registration to issue formal employment benefits.",
        "prerequisites": ["step-incorporation", "step-pan-tan", "step-bank-account"],
        "required_documents": [
            {"name": "Entity PAN & Digital Signature of Signatory", "category": "Legal", "is_required": True, "explanation": "Used to digitally authenticate employer portal registration."},
            {"name": "First Employee List & Date of Joining", "category": "Identity", "is_required": False, "explanation": "Salary structure and Aadhaar numbers of covered employees."}
        ],
        "official_portal_name": PORTALS["SHRAM_SUVIDHA"]["name"],
        "official_portal_url": PORTALS["SHRAM_SUVIDHA"]["url"],
        "verification_source": "EPF & MP Act 1952 and ESI Act 1948 (Ministry of Labour)",
        "last_verified_date": PORTALS["SHRAM_SUVIDHA"]["verified"],
        "estimated_duration": "2 to 5 business days"
    })

    # 9. STATE SHOP & ESTABLISHMENT ACT (If has premises or standard requirement)
    steps.append({
        "step_key": "step-shop-establishment",
        "category": "Local Compliance",
        "title": "State Shop & Commercial Establishment Registration",
        "short_title": "Shop & Establishment Act (Gumasta)",
        "description": "Register the commercial office, tech lab, or retail premises with the state municipal corporation or labor department under the State Shops and Commercial Establishments Act.",
        "why_necessary": "Mandatory local license for operating any commercial office. Regulates working hours, leaves, and provides local statutory proof of address.",
        "applicability": "Mandatory within 30 days of commencing commercial operations at physical premises in the state.",
        "prerequisites": ["step-incorporation", "step-bank-account"],
        "required_documents": [
            {"name": "Office Premises Proof & Photo of Signboard", "category": "Legal", "is_required": True, "explanation": "Photograph of shop/office exterior with business signboard in regional language/English."},
            {"name": "Rental Agreement & Landlord Tax Receipt", "category": "Legal", "is_required": True, "explanation": "Proof of authorized occupation of the commercial space."}
        ],
        "official_portal_name": "State Labor & Municipal Department Portal",
        "official_portal_url": "https://labour.gov.in/",
        "verification_source": f"State Shops & Commercial Establishments Act ({state.title() if state else 'State Authority'})",
        "last_verified_date": "October 2026",
        "estimated_duration": "3 to 10 business days"
    })

    # 10. STATE PROFESSIONAL TAX (PT) (Conditional on State)
    if not state or state in PT_STATES:
        steps.append({
            "step_key": "step-professional-tax",
            "category": "Tax & Regulatory",
            "title": "Enroll for State Professional Tax (PT)",
            "short_title": "Professional Tax Registration (PTEC & PTRC)",
            "description": "Obtain Professional Tax Enrollment Certificate (PTEC) for the business entity and Professional Tax Registration Certificate (PTRC) to deduct and remit PT from employees' salaries.",
            "why_necessary": "Mandatory statutory state tax in applicable states. Non-registration leads to monthly compounding interest and penalties.",
            "applicability": f"Mandatory in states levying Professional Tax (e.g. {state.title() if state else 'Maharashtra, Karnataka, Gujarat, Tamil Nadu'}).",
            "prerequisites": ["step-incorporation", "step-pan-tan"],
            "required_documents": [
                {"name": "Entity Incorporation Certificate & PAN", "category": "Legal", "is_required": True, "explanation": "Foundational business tax documents."},
                {"name": "Director / Employee Salary Register", "category": "Tax", "is_required": False, "explanation": "Salary slabs to calculate applicable monthly PT deduction."}
            ],
            "official_portal_name": "State Commercial Tax Department",
            "official_portal_url": "https://www.gst.gov.in/",
            "verification_source": "State Professional Tax Acts (State Commercial Tax Departments)",
            "last_verified_date": "October 2026",
            "estimated_duration": "3 to 7 business days"
        })

    # 11. INTELLECTUAL PROPERTY (TRADEMARK & PATENT)
    if creates_ip:
        steps.append({
            "step_key": "step-trademark-ip",
            "category": "Intellectual Property",
            "title": "Protect Brand Name & Logo via Trademark Filing",
            "short_title": "Trademark & Brand Protection",
            "description": "File TM-A application on the official IP India portal to protect your startup's brand name, logo, or slogan across relevant NICE classes. Claim 50% government fee concession via DPIIT recognition.",
            "why_necessary": "Prevents competitors from copying your brand identity, establishes proprietary commercial equity, and is required before major marketing spend.",
            "applicability": "Recommended for all consumer, tech, SaaS, healthcare, and FMCG brands.",
            "prerequisites": ["step-incorporation", "step-dpiit"],
            "required_documents": [
                {"name": "High-Resolution Brand Logo Artwork", "category": "Technical", "is_required": True, "explanation": "Exact visual representation of the mark/logo to be protected."},
                {"name": "DPIIT Recognition Certificate (for 50% Fee Subsidy)", "category": "Legal", "is_required": False, "explanation": "Reduces government statutory filing fee from Rs 9,000 to Rs 4,500."},
                {"name": "Affidavit of User Date (if mark already in use)", "category": "Legal", "is_required": False, "explanation": "Notarized affidavit proving earliest date of public commercial use with invoice proof."}
            ],
            "official_portal_name": PORTALS["IP_INDIA"]["name"],
            "official_portal_url": PORTALS["IP_INDIA"]["url"],
            "verification_source": "Trade Marks Act, 1999 & Trade Marks Rules, 2017 (CGPDTM)",
            "last_verified_date": PORTALS["IP_INDIA"]["verified"],
            "estimated_duration": "1 to 2 business days for application filing number (TM allowed immediately)"
        })

    # 12. ANNUAL STATUTORY COMPLIANCES & AUDIT
    steps.append({
        "step_key": "step-annual-compliance",
        "category": "Annual Statutory Governance",
        "title": "Statutory Auditor Appointment & Annual Compliance Schedule",
        "short_title": "Auditor Appointment (ADT-1) & Annual Filings",
        "description": "Appoint First Statutory Auditor via Form ADT-1 within 30 days of incorporation, hold First Board Meeting, and schedule annual MCA (AOC-4, MGT-7) and Income Tax (ITR-6) filings.",
        "why_necessary": "Mandatory under Section 139(6) of the Companies Act. Failure to file ADT-1 or annual returns leads to director disqualification and substantial recurring penalties.",
        "applicability": "Mandatory for all incorporated corporate entities in India.",
        "prerequisites": ["step-incorporation", "step-bank-account"],
        "required_documents": [
            {"name": "Chartered Accountant Written Consent Letter", "category": "Legal", "is_required": True, "explanation": "Formal acceptance from statutory auditor confirming eligibility."},
            {"name": "Certified Board Resolution for Auditor Appointment", "category": "Legal", "is_required": True, "explanation": "Extract of board meeting minutes approving statutory auditor appointment."}
        ],
        "official_portal_name": PORTALS["MCA"]["name"],
        "official_portal_url": PORTALS["MCA"]["url"],
        "verification_source": "Companies Act, 2013 (Section 139 & Section 137)",
        "last_verified_date": PORTALS["MCA"]["verified"],
        "estimated_duration": "Annual ongoing statutory cycle"
    })

    # Number steps sequentially
    for idx, s in enumerate(steps, 1):
        s["step_number"] = idx

    return steps

def sync_roadmap_for_user(user_id: str, profile_dict: dict) -> list:
    """
    Syncs the database roadmap_steps for user_id according to profile attributes,
    preserving existing progress (status, notes, reference numbers, dates).
    """
    if not user_id:
        return []

    templates = generate_personalized_roadmap_templates(profile_dict)

    # Fetch existing records
    existing_steps = db_session.query(RoadmapStep).filter_by(user_id=user_id).all()
    existing_by_key = {s.step_key: s for s in existing_steps}

    # Step keys in newly generated roadmap
    new_keys = set(t["step_key"] for t in templates)

    # 1. Update or create new steps
    synced_steps = []
    has_in_progress = False

    for t in templates:
        key = t["step_key"]
        existing = existing_by_key.get(key)

        if existing:
            # Preserve user's recorded progress
            existing.step_number = t["step_number"]
            existing.title = t["title"]
            existing.short_title = t["short_title"]
            existing.category = t["category"]
            existing.description = t["description"]
            existing.why_necessary = t["why_necessary"]
            existing.applicability = t["applicability"]
            existing.required_action = t["description"]
            existing.required_documents_json = json.dumps(t["required_documents"])
            existing.official_portal_name = t["official_portal_name"]
            existing.official_portal_url = t["official_portal_url"]
            existing.verification_source = t["verification_source"]
            existing.last_verified_date = t["last_verified_date"]
            existing.estimated_duration = t["estimated_duration"]
            existing.prerequisites_json = json.dumps(t["prerequisites"])

            # Map legacy statuses if needed
            if existing.status in ["LOCKED", "NOT_STARTED"]:
                existing.status = "NOT_STARTED"

            if existing.status == "IN_PROGRESS":
                has_in_progress = True

            synced_steps.append(existing)
        else:
            # Create fresh step
            new_step = RoadmapStep(
                id=f"{user_id}_{key}",
                user_id=user_id,
                step_key=key,
                step_number=t["step_number"],
                title=t["title"],
                short_title=t["short_title"],
                category=t["category"],
                description=t["description"],
                why_necessary=t["why_necessary"],
                applicability=t["applicability"],
                required_action=t["description"],
                required_documents_json=json.dumps(t["required_documents"]),
                official_portal_name=t["official_portal_name"],
                official_portal_url=t["official_portal_url"],
                verification_source=t["verification_source"],
                last_verified_date=t["last_verified_date"],
                estimated_duration=t["estimated_duration"],
                prerequisites_json=json.dumps(t["prerequisites"]),
                internal_route="/roadmap",
                status="NOT_STARTED",
                progress_pct=0,
                evidence_reference="",
                reference_number="",
                submission_date="",
                notes=""
            )
            db_session.add(new_step)
            synced_steps.append(new_step)

    # 2. Delete steps that no longer apply to this profile (e.g. if structure changed from Pvt Ltd to Proprietorship)
    for existing in existing_steps:
        if existing.step_key not in new_keys:
            db_session.delete(existing)

    # Ensure at least Step 1 is marked IN_PROGRESS if no step is currently IN_PROGRESS and none completed
    db_session.flush()
    if synced_steps:
        completed_count = sum(1 for s in synced_steps if s.status == "COMPLETED")
        if completed_count == 0 and not any(s.status == "IN_PROGRESS" for s in synced_steps):
            synced_steps[0].status = "IN_PROGRESS"

    db_session.commit()

    # Re-query cleanly sorted
    return db_session.query(RoadmapStep).filter_by(user_id=user_id).order_by(RoadmapStep.step_number.asc()).all()

def get_checklist_for_user(user_id: str) -> dict:
    """
    Constructs the personalized document checklist linked to the user's roadmap steps
    and matches against securely stored files in the database.
    """
    if not user_id:
        return {"documents": [], "total_count": 0, "prepared_count": 0}

    # Fetch user's roadmap steps
    steps = db_session.query(RoadmapStep).filter_by(user_id=user_id).order_by(RoadmapStep.step_number.asc()).all()
    # Fetch user's uploaded documents
    uploaded_docs = db_session.query(Document).filter_by(user_id=user_id).all()
    uploaded_by_filename = {d.original_filename.lower(): d for d in uploaded_docs}
    uploaded_by_cat = {d.category.lower(): d for d in uploaded_docs}

    checklist_items = []

    for s in steps:
        req_docs = []
        try:
            req_docs = json.loads(s.required_documents_json or "[]")
        except Exception:
            pass

        for doc_item in req_docs:
            name = doc_item.get("name", "Document")
            category = doc_item.get("category", "General")
            is_req = doc_item.get("is_required", True)
            expl = doc_item.get("explanation", "")

            # Match against uploaded files
            matched_doc = uploaded_by_filename.get(name.lower()) or uploaded_by_cat.get(name.lower())

            status = "NOT_PREPARED"
            file_meta = None
            if matched_doc:
                status = matched_doc.preparation_status or "UPLOADED"
                file_meta = matched_doc.to_dict()

            checklist_items.append({
                "id": f"{s.step_key}_{name.replace(' ', '_').lower()}",
                "name": name,
                "category": category,
                "step_key": s.step_key,
                "step_title": s.short_title or s.title,
                "step_number": s.step_number,
                "is_required": is_req,
                "explanation": expl,
                "preparation_status": status,
                "uploaded_file": file_meta
            })

    total_count = len(checklist_items)
    prepared_count = sum(1 for d in checklist_items if d["preparation_status"] in ["PREPARED_LOCAL", "UPLOADED"])

    return {
        "documents": checklist_items,
        "total_count": total_count,
        "prepared_count": prepared_count,
        "missing_count": total_count - prepared_count
    }
