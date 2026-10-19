# Realistic fictional demo data for ProcureEase 2.0 demonstration

SAMPLE_STARTUP = {
    "name": "SmartSense Technologies Pvt Ltd",
    "founder_name": "Arjun Sharma",
    "email": "arjun@smartsensetech.in",
    "phone": "+91 98765 43210",
    "sector": "IoT & Smart Infrastructure",
    "product_description": "Enterprise IoT sensor networks, intelligent edge telemetry gateways, and cloud-based predictive municipal monitoring platforms.",
    "company_stage": "Early Stage",
    "dpiit_status": True,
    "dpiit_number": "DIPP98214",
    "msme_status": True,
    "msme_number": "UDYAM-MH-02-0098412",
    "gst_status": "Registered",
    "gstin": "27AABCS1429B1Z4",
    "years_experience": 2,
    "team_size": 14,
    "annual_turnover_lakhs": 42.5,
    "capabilities": [
        "IoT Sensor Hardware",
        "Edge Telemetry Gateways",
        "Cloud Analytics Dashboard",
        "MQTT / LoRaWAN Networking",
        "Predictive Asset Maintenance"
    ],
    "products_services": [
        "SmartSense UrbanEdge Node",
        "CivicFlow Municipal Telemetry Suite",
        "SmartGrid Remote Sensor Firmware"
    ],
    "past_projects": [
        "Smart Water Leakage Monitoring for Pune Smart City Pilot (₹ 18 Lakhs, 2024)",
        "Industrial Air Quality Telemetry for MIDC Phase II (₹ 12 Lakhs, 2025)"
    ],
    "certifications": [
        "GST Certificate",
        "DPIIT Recognition Certificate",
        "MSME Udyam Certificate",
        "CE Compliant Hardware"
    ]
}

SAMPLE_DOCUMENTS = [
    {
        "filename": "GST_Registration_Certificate.pdf",
        "original_filename": "GST_Registration_Certificate.pdf",
        "category": "GST Certificate",
        "file_size_bytes": 412000,
        "page_count": 2,
        "status": "Available for Evidence Mapping"
    },
    {
        "filename": "DPIIT_Startup_Recognition.pdf",
        "original_filename": "DPIIT_Startup_Recognition.pdf",
        "category": "DPIIT Certificate",
        "file_size_bytes": 358000,
        "page_count": 1,
        "status": "Available for Evidence Mapping"
    },
    {
        "filename": "MSME_Udyam_Registration.pdf",
        "original_filename": "MSME_Udyam_Registration.pdf",
        "category": "MSME/Udyam Certificate",
        "file_size_bytes": 289000,
        "page_count": 2,
        "status": "Available for Evidence Mapping"
    },
    {
        "filename": "SmartSense_Product_Datasheet.pdf",
        "original_filename": "SmartSense_Product_Datasheet.pdf",
        "category": "Product/Technical Documents",
        "file_size_bytes": 1420000,
        "page_count": 6,
        "status": "Available for Evidence Mapping"
    },
    {
        "filename": "Pune_Smart_City_Project_Report.pdf",
        "original_filename": "Pune_Smart_City_Project_Report.pdf",
        "category": "Experience/Project Proof",
        "file_size_bytes": 890000,
        "page_count": 8,
        "status": "Available for Evidence Mapping"
    }
]

SAMPLE_TENDER = {
    "title": "Supply, Installation & Maintenance of IoT Smart Monitoring Nodes",
    "organization": "National Smart Infrastructure Mission / State PWD Procurement Division",
    "tender_id": "GEM/2026/B/89210",
    "deadline": "28 Oct 2026",
    "emd_amount": 50000.0,
    "emd_exemption_allowed": True,
    "estimated_budget": 14500000.0,
    "active_version": 2,
    "total_pages": 48
}

SAMPLE_REQUIREMENTS = [
    {
        "id": "REQ-001",
        "category": "ELIGIBILITY",
        "title": "Valid GST Registration",
        "clause_text": "The bidder must possess a valid Goods and Services Tax (GST) registration certificate issued by competent authorities in India.",
        "plain_language": "You must provide a registered and active GST certificate.",
        "source_page": 8,
        "source_section": "Section 2.1 — General Eligibility Criteria",
        "is_mandatory": True,
        "potential_relaxation_rule": None,
        "status": "MET"
    },
    {
        "id": "REQ-002",
        "category": "ELIGIBILITY",
        "title": "DPIIT / MSME EMD Exemption",
        "clause_text": "Earnest Money Deposit (EMD) of INR 50,000 is mandatory. Micro and Small Enterprises (MSEs) registered with Udyam and Startups recognized by DPIIT are eligible for exemption upon submission of valid proof.",
        "plain_language": "INR 50,000 EMD is required, but recognized DPIIT startups and MSMEs can claim full exemption by uploading their certificates.",
        "source_page": 9,
        "source_section": "Section 2.3 — Earnest Money Deposit & Relaxations",
        "is_mandatory": True,
        "potential_relaxation_rule": "Startup & MSME EMD Exemption Policy",
        "status": "MET"
    },
    {
        "id": "REQ-003",
        "category": "EXPERIENCE",
        "title": "Prior Similar Project Experience",
        "clause_text": "The bidder shall have successfully executed at least 3 (three) similar IoT sensor or telemetry deployment projects for government departments or public/private corporations in the last 3 financial years.",
        "plain_language": "Tender demands completion proof for 3 similar IoT projects. You currently have 1 verified project in your documents.",
        "source_page": 12,
        "source_section": "Section 3.1 — Technical Experience & Past Performance",
        "is_mandatory": True,
        "potential_relaxation_rule": "Startup Prior Experience & Turnover Relaxation (DoE O.M. F.20/2/2014-PPD(Pt.))",
        "status": "PARTIAL"
    },
    {
        "id": "REQ-004",
        "category": "FINANCIAL",
        "title": "Minimum Annual Turnover",
        "clause_text": "Average annual financial turnover of the bidder during the last three years ending 31st March of previous financial year should be at least INR 50 Lakhs. Relevant relaxation for DPIIT startups is subject to meeting technical capability.",
        "plain_language": "Tender requests ₹50 Lakhs turnover. Startup turnover is ₹42.5 Lakhs, but DPIIT recognized startups may seek relaxation upon verified technical capability.",
        "source_page": 14,
        "source_section": "Section 3.4 — Financial Eligibility Criteria",
        "is_mandatory": True,
        "potential_relaxation_rule": "DPIIT Turnover Exemption Rule",
        "status": "PARTIAL"
    },
    {
        "id": "REQ-005",
        "category": "TECHNICAL",
        "title": "Ingress Protection IP67 Rating",
        "clause_text": "All field-installed sensor nodes must comply with minimum IP67 ingress protection standards against dust and continuous water immersion.",
        "plain_language": "Your hardware nodes must be rated IP67 weatherproof. Datasheet confirms IP67 enclosure specifications.",
        "source_page": 19,
        "source_section": "Section 4.1 — Technical Specifications: Environmental Durability",
        "is_mandatory": True,
        "potential_relaxation_rule": None,
        "status": "MET"
    },
    {
        "id": "REQ-006",
        "category": "TECHNICAL",
        "title": "LoRaWAN & MQTT Telemetry Protocol",
        "clause_text": "Sensor nodes must support both LoRaWAN 1.0.3 and secure MQTT protocol over TLS 1.3 for telemetry transmission.",
        "plain_language": "Your hardware must support LoRaWAN and secure MQTT. Needs human confirmation on firmware version.",
        "source_page": 22,
        "source_section": "Section 4.3 — Communication & Networking Protocols",
        "is_mandatory": True,
        "potential_relaxation_rule": None,
        "status": "VERIFY"
    },
    {
        "id": "REQ-007",
        "category": "CERTIFICATION",
        "title": "ISO 9001:2015 Quality Management System",
        "clause_text": "Bidder must possess a valid ISO 9001:2015 certification for design, development, and manufacturing of electronic telemetry equipment as on the date of bid submission.",
        "plain_language": "You must hold an active ISO 9001:2015 certificate. No ISO certificate is currently present in your document vault.",
        "source_page": 25,
        "source_section": "Section 5.1 — Quality & Manufacturing Certifications",
        "is_mandatory": True,
        "potential_relaxation_rule": None,
        "status": "MISSING"
    },
    {
        "id": "REQ-008",
        "category": "DOCUMENTS",
        "title": "Product Technical Datasheet & Test Reports",
        "clause_text": "Detailed technical datasheet along with laboratory test certificate confirming compliance with power consumption and RF range must be submitted.",
        "plain_language": "Upload the detailed product datasheet with RF test results. SmartSense datasheet is uploaded and available.",
        "source_page": 29,
        "source_section": "Section 6.2 — Submission of Technical Collateral",
        "is_mandatory": True,
        "potential_relaxation_rule": None,
        "status": "MET"
    }
]

SAMPLE_EVIDENCE = [
    {
        "requirement_id": "REQ-001",
        "document_name": "GST_Registration_Certificate.pdf",
        "page_number": 1,
        "evidence_text": "Government of India GSTIN: 27AABCS1429B1Z4, Legal Name: SmartSense Technologies Pvt Ltd. Registration Status: Active.",
        "confidence": "HIGH",
        "status": "MET",
        "notes": "Verified active registration certificate on file."
    },
    {
        "requirement_id": "REQ-002",
        "document_name": "DPIIT_Startup_Recognition.pdf",
        "page_number": 1,
        "evidence_text": "Department for Promotion of Industry and Internal Trade, Certificate No: DIPP98214. Entity recognized as Startup under Startup India initiative.",
        "confidence": "HIGH",
        "status": "MET",
        "notes": "Valid certificate for EMD exemption claim."
    },
    {
        "requirement_id": "REQ-003",
        "document_name": "Pune_Smart_City_Project_Report.pdf",
        "page_number": 4,
        "evidence_text": "Project Completion Sign-off: Deployment of 150 wireless telemetry nodes for water network monitoring across Pune Sector 4. Completed November 2024.",
        "confidence": "MEDIUM",
        "status": "PARTIAL",
        "notes": "Tender mandates 3 projects; 1 verified project found in Document Vault. 2 additional client completion certificates needed."
    },
    {
        "requirement_id": "REQ-004",
        "document_name": "MSME_Udyam_Registration.pdf",
        "page_number": 2,
        "evidence_text": "Turnover declared: FY 2024-25 ₹ 42.50 Lakhs. Micro Enterprise categorization.",
        "confidence": "HIGH",
        "status": "PARTIAL",
        "notes": "Turnover is below ₹50 Lakhs; potential startup relaxation rule applies."
    },
    {
        "requirement_id": "REQ-005",
        "document_name": "SmartSense_Product_Datasheet.pdf",
        "page_number": 3,
        "evidence_text": "Enclosure Rating: IP67 dustproof and waterproof per IEC 60529 standard. Polycarbonate UV-stabilized housing.",
        "confidence": "HIGH",
        "status": "MET",
        "notes": "Datasheet confirms compliance with environmental durability standard."
    },
    {
        "requirement_id": "REQ-006",
        "document_name": "SmartSense_Product_Datasheet.pdf",
        "page_number": 5,
        "evidence_text": "Networking Protocols: LoRaWAN 1.0.3 Class A/C, MQTT/TLS 1.2 support with optional 1.3 firmware patch.",
        "confidence": "NEEDS_VERIFICATION",
        "status": "VERIFY",
        "notes": "Verify TLS 1.3 firmware patch availability with engineering team."
    },
    {
        "requirement_id": "REQ-007",
        "document_name": None,
        "page_number": 0,
        "evidence_text": "No ISO 9001:2015 certificate found in startup document vault.",
        "confidence": "HIGH",
        "status": "MISSING",
        "notes": "Mandatory blocker. Action item generated to acquire or upload certificate."
    },
    {
        "requirement_id": "REQ-008",
        "document_name": "SmartSense_Product_Datasheet.pdf",
        "page_number": 1,
        "evidence_text": "Technical Datasheet: SmartSense UrbanEdge Node rev 2.4. Operating voltage: 3.3V, RF output: +20dBm.",
        "confidence": "HIGH",
        "status": "MET",
        "notes": "Product datasheet ready for technical envelope submission."
    }
]

SAMPLE_ACTIONS = [
    {
        "id": "ACT-001",
        "requirement_id": "REQ-007",
        "title": "Upload valid ISO 9001:2015 Certificate",
        "priority": "CRITICAL",
        "reason": "Tender Clause 5.1 mandates ISO 9001:2015 quality certificate. Missing evidence will cause technical disqualification.",
        "recommended_action": "Upload an active ISO 9001:2015 certification for your manufacturing/development facility into Document Vault.",
        "status": "NOT_STARTED"
    },
    {
        "id": "ACT-002",
        "requirement_id": "REQ-003",
        "title": "Add Evidence for 2 Additional Similar Projects",
        "priority": "HIGH",
        "reason": "Tender Clause 3.1 requires 3 completed telemetry projects. Only 1 project report is currently in Document Vault.",
        "recommended_action": "Upload project completion sign-offs or client purchase orders for at least 2 additional deployments.",
        "status": "IN_PROGRESS"
    },
    {
        "id": "ACT-003",
        "requirement_id": "REQ-006",
        "title": "Verify LoRaWAN & MQTT TLS 1.3 Firmware Compliance",
        "priority": "MEDIUM",
        "reason": "Datasheet mentions TLS 1.2 default with optional 1.3 patch. Tender Clause 4.3 specifically prescribes TLS 1.3.",
        "recommended_action": "Confirm with engineering team and obtain test certificate validating TLS 1.3 firmware compliance.",
        "status": "NEEDS_VERIFICATION"
    },
    {
        "id": "ACT-004",
        "requirement_id": "REQ-004",
        "title": "Draft Startup Turnover Relaxation Exemption Request",
        "priority": "MEDIUM",
        "reason": "Turnover is ₹42.5L vs ₹50L required. Startup exemption policy allows waiver if technical capability is established.",
        "recommended_action": "Prepare formal representation letter invoking DoE Startup Exemption guidelines with DPIIT certificate attached.",
        "status": "NOT_STARTED"
    },
    {
        "id": "ACT-005",
        "requirement_id": "REQ-002",
        "title": "Attach DPIIT Certificate in EMD Envelope",
        "priority": "LOW",
        "reason": "Tender Clause 2.3 allows full waiver of ₹50,000 EMD for recognized startups.",
        "recommended_action": "Ensure DIPP98214 recognition certificate is bundled into the bid fee exemption folder.",
        "status": "COMPLETED"
    }
]

SAMPLE_CHANGES = [
    {
        "field": "Submission Deadline",
        "old_value": "20 Oct 2026, 03:00 PM",
        "new_value": "28 Oct 2026, 03:00 PM",
        "change_type": "CHANGED",
        "impact": "HIGH",
        "description": "Bid submission deadline extended by 8 calendar days via Corrigendum No. 1."
    },
    {
        "field": "Mandatory Document Checklist",
        "old_value": "5 Mandatory Documents",
        "new_value": "6 Mandatory Documents",
        "change_type": "ADDED",
        "impact": "MEDIUM",
        "description": "Added requirement for Annexure-IV: Non-Blacklisting Sworn Affidavit on ₹100 stamp paper."
    },
    {
        "field": "Technical Specifications",
        "old_value": "IP67 Enclosure Rating",
        "new_value": "IP67 Enclosure Rating",
        "change_type": "UNCHANGED",
        "impact": "LOW",
        "description": "No modifications to environmental ingress protection or telemetry protocol specifications."
    },
    {
        "field": "Eligibility Criteria",
        "old_value": "3 Years Experience & ₹50L Turnover",
        "new_value": "3 Years Experience & ₹50L Turnover",
        "change_type": "UNCHANGED",
        "impact": "LOW",
        "description": "Core eligibility criteria remain unchanged from primary tender notice."
    }
]

# --- Extended End-to-End Guided Procurement Journey Mock Datasets ---

SAMPLE_ROADMAP_STEPS = [
    {
        "id": "step-1",
        "step_number": 1,
        "title": "DPIIT Startup India Recognition",
        "short_title": "Startup Registration",
        "category": "Legal & Regulatory",
        "description": "Register on the Startup India portal to obtain official DPIIT recognition, unlocking statutory exemptions under General Financial Rules (GFR 2017) Rule 173(i) for Prior Experience and Turnover.",
        "required_action": "Complete registration on Startup India portal and enter your official DPIIT Certificate Number.",
        "official_portal_name": "Startup India Portal (DPIIT)",
        "official_portal_url": "https://www.startupindia.gov.in/",
        "internal_route": "/profile",
        "status": "COMPLETED",
        "progress_pct": 100,
        "evidence_reference": "DIPP98214",
        "notes": "Verified active DPIIT status. Exemption benefits unlocked."
    },
    {
        "id": "step-2",
        "step_number": 2,
        "title": "MSME Udyam, GST & Quality Certifications",
        "short_title": "Certifications & Registrations",
        "category": "Compliance",
        "description": "Obtain MSME/Udyam Registration (for mandatory EMD waiver), GSTIN for public invoicing, and ISO 9001:2015 quality assurance certificate.",
        "required_action": "Enter MSME Udyam registration number and upload ISO 9001 certificate in Document Vault.",
        "official_portal_name": "Udyam Registration Portal",
        "official_portal_url": "https://udyamregistration.gov.in/",
        "internal_route": "/documents",
        "status": "COMPLETED",
        "progress_pct": 100,
        "evidence_reference": "UDYAM-MH-02-0098412",
        "notes": "Udyam and GST certificates verified. EMD exemptions active."
    },
    {
        "id": "step-3",
        "step_number": 3,
        "title": "Government e-Marketplace (GeM) Seller Onboarding",
        "short_title": "Procurement Portal",
        "category": "Marketplace",
        "description": "Register as an authorized OEM/Seller on Government e-Marketplace (GeM) and link your DPIIT Startup profile to enable direct public bidding.",
        "required_action": "Create Primary Seller Account on GeM, complete Aadhaar/PAN authentication, and record GeM Seller ID.",
        "official_portal_name": "GeM Portal (gem.gov.in)",
        "official_portal_url": "https://gem.gov.in/",
        "internal_route": "/profile",
        "status": "COMPLETED",
        "progress_pct": 100,
        "evidence_reference": "GEM-OEM-98214",
        "notes": "GeM seller account linked and verified."
    },
    {
        "id": "step-4",
        "step_number": 4,
        "title": "Discover & Filter Matching Opportunities",
        "short_title": "Tender Discovery",
        "category": "Intelligence",
        "description": "Browse 10+ public tenders across government departments. Algorithmic matching scores evaluate capability fit before you spend time bidding.",
        "required_action": "Select target tender for in-depth AI clause decoding and requirement breakdown.",
        "official_portal_name": "GeM Bids / CPPP Central Portal",
        "official_portal_url": "https://gem.gov.in/all-bids",
        "internal_route": "/tenders",
        "status": "COMPLETED",
        "progress_pct": 100,
        "evidence_reference": "GEM/2026/B/89210",
        "notes": "Selected active tender: Supply & Installation of IoT Smart Monitoring Nodes."
    },
    {
        "id": "step-5",
        "step_number": 5,
        "title": "Eligibility Gap Explainer & Startup Relaxations",
        "short_title": "Tender Eligibility Check",
        "category": "Analysis",
        "description": "Deterministic rule evaluation comparing startup profile capabilities against mandatory qualifications. Highlights GFR 2017 Rule 173(i) startup relaxations.",
        "required_action": "Review 4-column Eligibility Matrix and verify turnover and experience exemptions.",
        "official_portal_name": "ProcureEase Rules Engine",
        "official_portal_url": "",
        "internal_route": "/eligibility",
        "status": "COMPLETED",
        "progress_pct": 100,
        "evidence_reference": "82% Strong Fit (Rule 173(i) Applied)",
        "notes": "All eligibility criteria audited with startup relaxation clauses."
    },
    {
        "id": "step-6",
        "step_number": 6,
        "title": "Requirement-to-Evidence Mapping & Action Plan",
        "short_title": "Document Checklist",
        "category": "Preparation",
        "description": "Link tender clauses directly to page citations in your Document Vault. Resolve critical gaps using the prioritized Dynamic Action Plan.",
        "required_action": "Upload missing proofs (e.g. ISO 9001 certificate) and mark action items completed to reach 98% readiness.",
        "official_portal_name": "ProcureEase Vault",
        "official_portal_url": "",
        "internal_route": "/checklist",
        "status": "IN_PROGRESS",
        "progress_pct": 60,
        "evidence_reference": "1 Blocker (ACT-001 ISO 9001 Pending)",
        "notes": "4 of 5 action plan items completed. ISO 9001 required to unlock final submission."
    },
    {
        "id": "step-7",
        "step_number": 7,
        "title": "Pre-Bid Audit & Official GeM Submission",
        "short_title": "Official Portal Submission",
        "category": "Submission",
        "description": "Pass the 5-Category Pre-Bid Audit. Once 'Ready for Submission' gate unlocks, navigate to official GeM portal to submit technical and financial bids, then record generated Bid ID.",
        "required_action": "Submit bid on GeM, then enter official Bid ID and submission date in ProcureEase.",
        "official_portal_name": "GeM Official Bid Submission",
        "official_portal_url": "https://gem.gov.in/",
        "internal_route": "/readiness",
        "status": "LOCKED",
        "progress_pct": 0,
        "evidence_reference": "",
        "notes": "Unlocks automatically when Pre-Bid Audit clears critical blockers."
    },
    {
        "id": "step-8",
        "step_number": 8,
        "title": "Track Bid Lifecycle & Evaluation Stages",
        "short_title": "Track Application Status",
        "category": "Monitoring",
        "description": "Track post-submission milestones: Technical Evaluation, Financial Bid Opening, Representation Period, and Final Result Declaration.",
        "required_action": "Record tender scrutiny updates and monitor bid opening dates.",
        "official_portal_name": "GeM Bid Status Portal",
        "official_portal_url": "https://gem.gov.in/",
        "internal_route": "/applications",
        "status": "LOCKED",
        "progress_pct": 0,
        "evidence_reference": "",
        "notes": "Tracks application states: Draft, Ready, Submitted, Under Evaluation, Won."
    },
    {
        "id": "step-9",
        "step_number": 9,
        "title": "Working Capital, Bank Guarantees & Invoice Discounting",
        "short_title": "Funding / Financial Support",
        "category": "Financial Support",
        "description": "Access government and institutional financial schemes: SIDBI loan assistance, CGTMSE collateral-free credit, and TReDS invoice discounting for procurement orders.",
        "required_action": "Explore matching financial schemes to finance tender execution and working capital.",
        "official_portal_name": "SIDBI & MSME Financial Schemes",
        "official_portal_url": "https://www.sidbi.in/",
        "internal_route": "/finance",
        "status": "LOCKED",
        "progress_pct": 0,
        "evidence_reference": "",
        "notes": "Pre-approved loan & bill discounting opportunities against government contracts."
    },
    {
        "id": "step-10",
        "step_number": 10,
        "title": "Official Tender Result & L1 Award Determination",
        "short_title": "Tender Result",
        "category": "Outcome",
        "description": "Record final procurement outcome: Awarded as L1 bidder (Won), or Not Won with debrief analytics to improve future proposals.",
        "required_action": "Enter GeM Contract Award notice or download evaluation summary.",
        "official_portal_name": "GeM Award Portal",
        "official_portal_url": "https://gem.gov.in/",
        "internal_route": "/applications",
        "status": "LOCKED",
        "progress_pct": 0,
        "evidence_reference": "",
        "notes": "Logs Won/Not Won status."
    },
    {
        "id": "step-11",
        "step_number": 11,
        "title": "Contract Signing, PO Issuance & Milestone Execution",
        "short_title": "Contract / Project",
        "category": "Delivery",
        "description": "For Won bids: Track Contract Signing, Purchase Order issuance, deployment milestones, and delivery inspection reports.",
        "required_action": "Log milestone progress from kickoff to testing and final integration.",
        "official_portal_name": "State PWD Project Monitoring Cell",
        "official_portal_url": "",
        "internal_route": "/applications",
        "status": "LOCKED",
        "progress_pct": 0,
        "evidence_reference": "",
        "notes": "Contract Signed -> Project Started -> In Progress -> Completed."
    },
    {
        "id": "step-12",
        "step_number": 12,
        "title": "Procurement Project Successfully Completed",
        "short_title": "Completed",
        "category": "Closure",
        "description": "Full tender-to-project journey completed. Work completion certificate received and archived for future tender qualification scores.",
        "required_action": "Archive completion certificate to increase future procurement qualification rating.",
        "official_portal_name": "ProcureEase Vault Archive",
        "official_portal_url": "",
        "internal_route": "/documents",
        "status": "LOCKED",
        "progress_pct": 0,
        "evidence_reference": "",
        "notes": "Full procurement cycle finalized."
    }
]

SAMPLE_TENDERS_LIST = [
    {
        "id": "GEM/2026/B/89210",
        "tender_id": "GEM/2026/B/89210",
        "title": "Supply, Installation & Maintenance of IoT Smart Monitoring Nodes",
        "organization": "National Smart Infrastructure Mission / State PWD",
        "sector": "IoT & Smart Infrastructure",
        "estimated_budget": 14500000.0,
        "emd_amount": 50000.0,
        "emd_exemption_allowed": True,
        "deadline": "28 Oct 2026",
        "total_pages": 48,
        "active_version": 2,
        "match_score": 82,
        "match_tier": "Strong Match",
        "key_technologies": ["IoT Sensors", "LoRaWAN", "Edge Gateway", "Telemetry"],
        "is_active_target": True
    },
    {
        "id": "IR/2026/TR/4491",
        "tender_id": "IR/2026/TR/4491",
        "title": "Track Bed Vibration & Temperature IoT Telemetry Sensor Grid",
        "organization": "Ministry of Railways / Research Designs & Standards Organisation",
        "sector": "RailTech & Transport",
        "estimated_budget": 8500000.0,
        "emd_amount": 35000.0,
        "emd_exemption_allowed": True,
        "deadline": "05 Nov 2026",
        "total_pages": 36,
        "active_version": 1,
        "match_score": 88,
        "match_tier": "Strong Match",
        "key_technologies": ["Vibration Sensors", "Industrial IoT", "RS485", "Telemetry"],
        "is_active_target": False
    },
    {
        "id": "AIIMS/TECH/2026/301",
        "tender_id": "AIIMS/TECH/2026/301",
        "title": "Supply of Smart Cold-Chain Vaccine Temperature Telemetry Loggers",
        "organization": "All India Institute of Medical Sciences (AIIMS) New Delhi",
        "sector": "HealthTech & Medical Devices",
        "estimated_budget": 6500000.0,
        "emd_amount": 25000.0,
        "emd_exemption_allowed": True,
        "deadline": "12 Nov 2026",
        "total_pages": 40,
        "active_version": 1,
        "match_score": 79,
        "match_tier": "Moderate Match",
        "key_technologies": ["BLE Loggers", "Cloud Telemetry", "Temperature Sensors"],
        "is_active_target": False
    },
    {
        "id": "SMARTCITY/PUNE/2026/08",
        "tender_id": "SMARTCITY/PUNE/2026/08",
        "title": "Automated Municipal Water Sluice Monitoring & Pressure Telemetry",
        "organization": "Pune Smart City Development Corporation Ltd (PSCDCL)",
        "sector": "Smart Utilities & Water",
        "estimated_budget": 9500000.0,
        "emd_amount": 40000.0,
        "emd_exemption_allowed": True,
        "deadline": "18 Nov 2026",
        "total_pages": 52,
        "active_version": 1,
        "match_score": 85,
        "match_tier": "Strong Match",
        "key_technologies": ["Pressure Transmitters", "LoRaWAN", "SCADA Integration"],
        "is_active_target": False
    },
    {
        "id": "AAI/ENV/2026/112",
        "tender_id": "AAI/ENV/2026/112",
        "title": "Continuous Ambient Air Quality & Particulate Sensing Network",
        "organization": "Airports Authority of India (Western Region)",
        "sector": "CleanTech & Environment",
        "estimated_budget": 6000000.0,
        "emd_amount": 20000.0,
        "emd_exemption_allowed": True,
        "deadline": "24 Nov 2026",
        "total_pages": 34,
        "active_version": 1,
        "match_score": 92,
        "match_tier": "Strong Match",
        "key_technologies": ["PM2.5 / PM10 Sensors", "4G LTE Gateway", "Cloud API"],
        "is_active_target": False
    },
    {
        "id": "AGRI/SOIL/2026/554",
        "tender_id": "AGRI/SOIL/2026/554",
        "title": "Solar Powered Wireless Soil Moisture & NPK Agronomic Sensor Hubs",
        "organization": "National Agricultural Cooperative Marketing Federation (NAFED)",
        "sector": "AgriTech & Rural Infra",
        "estimated_budget": 4500000.0,
        "emd_amount": 15000.0,
        "emd_exemption_allowed": True,
        "deadline": "30 Nov 2026",
        "total_pages": 30,
        "active_version": 1,
        "match_score": 76,
        "match_tier": "Moderate Match",
        "key_technologies": ["Solar Harvesters", "NPK Sensors", "Mesh Network"],
        "is_active_target": False
    },
    {
        "id": "MUNICIPAL/MUM/2026/410",
        "tender_id": "MUNICIPAL/MUM/2026/410",
        "title": "Smart Ultrasonic Solid Waste Bin Level Monitoring Nodes",
        "organization": "Brihanmumbai Municipal Corporation (Solid Waste Management)",
        "sector": "CleanTech & Waste",
        "estimated_budget": 5500000.0,
        "emd_amount": 22000.0,
        "emd_exemption_allowed": True,
        "deadline": "02 Dec 2026",
        "total_pages": 28,
        "active_version": 1,
        "match_score": 89,
        "match_tier": "Strong Match",
        "key_technologies": ["Ultrasonic Sensors", "NB-IoT", "Battery Optimization"],
        "is_active_target": False
    },
    {
        "id": "POWERGRID/SUB/2026/78",
        "tender_id": "POWERGRID/SUB/2026/78",
        "title": "Substation Transformer Thermal & Bushing Remote Telemetry",
        "organization": "Power Grid Corporation of India Limited (PGCIL)",
        "sector": "Energy & Power",
        "estimated_budget": 16500000.0,
        "emd_amount": 60000.0,
        "emd_exemption_allowed": True,
        "deadline": "08 Dec 2026",
        "total_pages": 58,
        "active_version": 1,
        "match_score": 81,
        "match_tier": "Strong Match",
        "key_technologies": ["Fiber Optic Thermal", "Modbus TCP", "Substation Gateway"],
        "is_active_target": False
    },
    {
        "id": "FOREST/UK/2026/902",
        "tender_id": "FOREST/UK/2026/902",
        "title": "Early Forest Fire Thermal Infrared Detection Wireless Towers",
        "organization": "Uttarakhand Forest Department (Disaster Management Division)",
        "sector": "Disaster & Ecology",
        "estimated_budget": 7000000.0,
        "emd_amount": 28000.0,
        "emd_exemption_allowed": True,
        "deadline": "15 Dec 2026",
        "total_pages": 38,
        "active_version": 1,
        "match_score": 72,
        "match_tier": "Potential Match",
        "key_technologies": ["Thermal IR", "Solar Battery", "Satellite Telemetry"],
        "is_active_target": False
    },
    {
        "id": "PORT/JNPT/2026/184",
        "tender_id": "PORT/JNPT/2026/184",
        "title": "Container Freight Yard RFID & GPS Real-Time Equipment Telemetry",
        "organization": "Jawaharlal Nehru Port Authority (JNPA Navi Mumbai)",
        "sector": "Logistics & Ports",
        "estimated_budget": 13500000.0,
        "emd_amount": 50000.0,
        "emd_exemption_allowed": True,
        "deadline": "20 Dec 2026",
        "total_pages": 44,
        "active_version": 1,
        "match_score": 84,
        "match_tier": "Strong Match",
        "key_technologies": ["UHF RFID", "GPS Telemetry", "Industrial Enclosures"],
        "is_active_target": False
    },
    {
        "id": "SECI/SOLAR/2026/339",
        "tender_id": "SECI/SOLAR/2026/339",
        "title": "Rooftop Solar Plant String Inverter Generation Monitoring Hubs",
        "organization": "Solar Energy Corporation of India (SECI)",
        "sector": "Renewable Energy",
        "estimated_budget": 8800000.0,
        "emd_amount": 32000.0,
        "emd_exemption_allowed": True,
        "deadline": "28 Dec 2026",
        "total_pages": 42,
        "active_version": 1,
        "match_score": 80,
        "match_tier": "Strong Match",
        "key_technologies": ["Inverter Telemetry", "RS485", "Cloud Analytics"],
        "is_active_target": False
    },
    {
        "id": "PWD/MAH/2026/721",
        "tender_id": "PWD/MAH/2026/721",
        "title": "Centralized Smart LED Streetlight Feeder Pillar Telemetry & CCMS",
        "organization": "Public Works Department, Maharashtra (Electrical Division)",
        "sector": "Smart Infrastructure",
        "estimated_budget": 11500000.0,
        "emd_amount": 45000.0,
        "emd_exemption_allowed": True,
        "deadline": "05 Jan 2027",
        "total_pages": 46,
        "active_version": 1,
        "match_score": 87,
        "match_tier": "Strong Match",
        "key_technologies": ["Astronomical Timers", "Smart Energy Meters", "GSM Gateway"],
        "is_active_target": False
    }
]

SAMPLE_FINANCIAL_SCHEMES = [
    {
        "id": "SCH-001",
        "title": "Startup India Seed Fund Scheme (SISFS)",
        "agency": "Department for Promotion of Industry and Internal Trade (DPIIT)",
        "type": "Grant & Convertible Debt",
        "max_support": "₹ 50 Lakhs",
        "eligibility_summary": "DPIIT-recognized startups incorporated within 2 years with proof-of-concept ready for prototype deployment.",
        "benefits": "Up to ₹20 Lakhs grant for validation; up to ₹50 Lakhs debt/convertible debenture for market launch.",
        "application_url": "https://seedfund.startupindia.gov.in/",
        "match_status": "HIGH_ELIGIBILITY"
    },
    {
        "id": "SCH-002",
        "title": "CGTMSE Collateral-Free Credit Guarantee",
        "agency": "Credit Guarantee Fund Trust for Micro and Small Enterprises (SIDBI & Ministry of MSME)",
        "type": "Credit Guarantee Facility",
        "max_support": "₹ 5.0 Crores",
        "eligibility_summary": "Active MSME/Udyam registered manufacturing and service enterprises bidding for government work orders.",
        "benefits": "Collateral-free bank borrowing with up to 85% sovereign guarantee coverage for public procurement execution.",
        "application_url": "https://www.cgtmse.in/",
        "match_status": "ELIGIBLE"
    },
    {
        "id": "SCH-003",
        "title": "SIDBI Working Capital for Public Procurement Contractors",
        "agency": "Small Industries Development Bank of India (SIDBI)",
        "type": "Working Capital Facility",
        "max_support": "₹ 1.5 Crores",
        "eligibility_summary": "Recognized startups and MSMEs with confirmed purchase orders or L1 award notices from GeM/CPPP.",
        "benefits": "Concessional interest rate (starting 8.25% p.a.) tailored for component purchasing and upfront deployment costs.",
        "application_url": "https://www.sidbi.in/",
        "match_status": "RECOMMENDED_FOR_TENDER"
    },
    {
        "id": "SCH-004",
        "title": "Pradhan Mantri MUDRA Yojana (Tarun Category)",
        "agency": "National Credit Guarantee Trustee Company / Public Sector Banks",
        "type": "Term Loan / Working Capital",
        "max_support": "₹ 10 Lakhs",
        "eligibility_summary": "Early stage micro enterprises and tech startups requiring immediate hardware testbench and tooling capital.",
        "benefits": "Zero processing fee, no collateral required, fast-track disbursement via MUDRA Card.",
        "application_url": "https://www.mudra.org.in/",
        "match_status": "ELIGIBLE"
    },
    {
        "id": "SCH-005",
        "title": "TReDS Invoice Discounting for Government Vendor Bills",
        "agency": "Reserve Bank of India (RBI) authorized exchanges (RXIL / M1xchange / Invoicemart)",
        "type": "Bill Discounting Platform",
        "max_support": "Up to 90% of Raised Invoices",
        "eligibility_summary": "MSME suppliers holding accepted supply inspection notes from Central/State Government buyers.",
        "benefits": "Auction invoice receivables to participating banks without recourse, receiving cash in 48-72 hours instead of 60-day delay.",
        "application_url": "https://www.rxil.in/",
        "match_status": "POST_AWARD_RECOMMENDED"
    },
    {
        "id": "SCH-006",
        "title": "Public Sector Bank Bid Bond & EMD Guarantee Facility",
        "agency": "Partner Public Sector Banks (SBI / PNB / Bank of Baroda)",
        "type": "Bank Guarantee (BG) Support",
        "max_support": "₹ 25 Lakhs",
        "eligibility_summary": "DPIIT startups requiring 100% margin waiver on Performance Bank Guarantees (PBG) for awarded tenders.",
        "benefits": "Reduced cash margin (10-25% instead of 100% fixed deposit) against confirmed GeM contract.",
        "application_url": "https://sbi.co.in/web/business/sme",
        "match_status": "ELIGIBLE"
    }
]

SAMPLE_APPLICATIONS = [
    {
        "tender_id": "GEM/2026/B/89210",
        "tender_title": "Supply, Installation & Maintenance of IoT Smart Monitoring Nodes",
        "bid_id": "GEM/BID/2026/89210-A",
        "submission_date": "24 Oct 2026",
        "portal_name": "Government e-Marketplace (GeM)",
        "status": "SUBMITTED", # SUBMITTED, UNDER_EVALUATION, RESULT_DECLARED, WON, NOT_WON
        "evaluated_date": "02 Nov 2026",
        "award_amount": "₹ 1.38 Cr",
        "contract_status": "PROJECT_STARTED", # CONTRACT_SIGNED, PROJECT_STARTED, IN_PROGRESS, COMPLETED
        "project_progress_pct": 35,
        "notes": "Technical envelope accepted with zero deficiencies. GeM Contract No: GEMC-5116877209."
    }
]
