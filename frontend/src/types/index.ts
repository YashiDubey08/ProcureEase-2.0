// ProcureEase 2.0 Core Type Definitions

export type RequirementCategory = 
  | 'ELIGIBILITY'
  | 'EXPERIENCE'
  | 'FINANCIAL'
  | 'TECHNICAL'
  | 'CERTIFICATION'
  | 'DOCUMENTS'
  | 'SUBMISSION';

export type RequirementStatus = 'MET' | 'PARTIAL' | 'MISSING' | 'VERIFY';
export type ActionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERIFICATION';
export type ActionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'NEEDS_VERIFICATION';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'NEEDS_VERIFICATION';

export interface StartupProfile {
  id: string;
  name: string;
  founder_name: string;
  email: string;
  phone: string;
  sector: string;
  business_domain?: string;
  state_location?: string;
  business_structure?: string;
  has_employees?: boolean;
  has_physical_premises?: boolean;
  is_interstate_or_ecommerce?: boolean;
  creates_ip?: boolean;
  product_description: string;
  company_stage: string;
  dpiit_status: boolean;
  dpiit_number: string;
  msme_status: boolean;
  msme_number: string;
  gst_status: string;
  gstin: string;
  years_experience: number;
  team_size: number;
  annual_turnover_lakhs: number;
  capabilities: string[];
  products_services: string[];
  past_projects: string[];
  certifications: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ProfileCompletionField {
  name: string;
  category: string;
  status: 'Completed' | 'Partial' | 'Missing';
  required: boolean;
}

export interface ProfileCompletion {
  percentage: number;
  completed_count: number;
  partial_count?: number;
  missing_count: number;
  breakdown: ProfileCompletionField[];
}

export interface StartupDocument {
  id: string;
  startup_id?: string;
  user_id?: string;
  step_key?: string;
  filename: string;
  original_filename: string;
  category: string;
  file_size_bytes: number;
  page_count: number;
  status: string;
  preparation_status?: 'NOT_PREPARED' | 'DRAFT' | 'PREPARED_LOCAL' | 'UPLOADED';
  is_required?: boolean;
  mime_type?: string;
  upload_date?: string;
}

export interface ChecklistDocumentItem {
  id: string;
  name: string;
  category: string;
  step_key: string;
  step_title: string;
  step_number: number;
  is_required: boolean;
  explanation: string;
  preparation_status: 'NOT_PREPARED' | 'DRAFT' | 'PREPARED_LOCAL' | 'UPLOADED';
  uploaded_file?: StartupDocument | null;
}

export interface TenderMetadata {
  id: string;
  title: string;
  organization: string;
  tender_id: string;
  deadline: string;
  emd_amount: number;
  emd_exemption_allowed: boolean;
  estimated_budget: number;
  active_version: number;
  total_pages: number;
  created_at?: string;
}

export interface ExtractedRequirement {
  id: string;
  tender_id?: string;
  category: RequirementCategory | string;
  title: string;
  clause_text: string;
  plain_language: string;
  source_page: number;
  source_section: string;
  is_mandatory: boolean;
  potential_relaxation_rule?: string | null;
  status: RequirementStatus;
  created_at?: string;
}

export interface MatchReasonItem {
  category: string;
  title: string;
  reason: string;
}

export interface ExplainableMatchResult {
  score: number;
  tier: string;
  matched: MatchReasonItem[];
  partial: MatchReasonItem[];
  missing: MatchReasonItem[];
  needs_verification: MatchReasonItem[];
  summary: string;
}

export interface EligibilityGapItem {
  requirement_id: string;
  category: string;
  title: string;
  clause_text: string;
  plain_language: string;
  source_page: number;
  source_section: string;
  status: RequirementStatus;
  relaxation_advisory?: string | null;
  action_needed?: string | null;
}

export interface EvidenceMappingItem {
  id?: string;
  requirement_id: string;
  document_name?: string | null;
  page_number?: number;
  evidence_text: string;
  confidence: ConfidenceLevel;
  status: RequirementStatus;
  notes?: string;
}

export interface ActionPlanItem {
  id: string;
  requirement_id?: string;
  title: string;
  priority: ActionPriority;
  reason: string;
  recommended_action: string;
  status: ActionStatus;
  updated_at?: string;
}

export interface ScoreMath {
  base_points: number;
  base_satisfied_points: number;
  partial_evidence_points: number;
  missing_critical_deduction: number;
  verification_pending_deduction: number;
  formula_explanation: string;
}

export interface ReadinessScoreResult {
  overall_score: number;
  final_status: 'NOT_READY_FOR_SUBMISSION' | 'READY_WITH_WARNINGS' | 'READY_FOR_SUBMISSION';
  gate_message: string;
  satisfied_count: number;
  partial_count: number;
  missing_count: number;
  verification_count: number;
  critical_blockers_count: number;
  blockers: string[];
  category_scores: {
    eligibility: number;
    evidence: number;
    profile: number;
    actions: number;
  };
  score_math: ScoreMath;
}

export interface AuditCheckItem {
  label: string;
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'NEEDS_VERIFICATION';
  proof: string;
}

export interface AuditCategory {
  name: string;
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'NEEDS_VERIFICATION';
  items: AuditCheckItem[];
}

export interface PreBidAuditResult {
  overall_result: 'NOT_READY_FOR_SUBMISSION' | 'READY_WITH_WARNINGS' | 'READY_FOR_SUBMISSION';
  overall_score: number;
  gate_message: string;
  deadline: string;
  categories: AuditCategory[];
  critical_blockers: string[];
  score_math: ScoreMath;
  disclaimer: string;
}

export interface TenderChangeItem {
  field: string;
  old_value: string;
  new_value: string;
  change_type: 'ADDED' | 'REMOVED' | 'CHANGED' | 'UNCHANGED';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface TenderChangesResult {
  tender_id: string;
  active_version: number;
  previous_version: number;
  summary: string;
  changes: TenderChangeItem[];
  total_changes: number;
}

export interface BackendHealthResponse {
  status: string;
  project: string;
  tagline: string;
  concept: string;
  philosophy: string;
  database: {
    type: string;
    connected: boolean;
    path: string;
  };
  pdf_engine: {
    name: string;
    version: string;
  };
  ai_engine: {
    mode: string;
  };
}

// Guided Procurement Journey Types

export type StepStatus = 
  | 'NOT_STARTED' 
  | 'IN_PROGRESS' 
  | 'SUBMITTED' 
  | 'COMPLETED' 
  | 'NEEDS_ATTENTION' 
  | 'LOCKED';

export interface RequiredDocumentDef {
  name: string;
  category: string;
  is_required: boolean;
  explanation: string;
}

export interface RoadmapStepItem {
  id: string;
  step_key: string;
  step_number: number;
  title: string;
  short_title: string;
  category: string;
  description: string;
  why_necessary?: string;
  applicability?: string;
  required_action: string;
  required_documents?: RequiredDocumentDef[];
  official_portal_name: string;
  official_portal_url: string;
  verification_source?: string;
  last_verified_date?: string;
  estimated_duration?: string;
  prerequisites?: string[];
  internal_route: string;
  status: StepStatus;
  progress_pct: number;
  evidence_reference?: string;
  reference_number?: string;
  submission_date?: string;
  notes?: string;
  completed_at?: string | null;
}

export interface RoadmapResponse {
  steps: RoadmapStepItem[];
  total_steps: number;
  completed_count: number;
  in_progress_count: number;
  submitted_count?: number;
  needs_attention_count?: number;
  not_started_count?: number;
  overall_progress_pct: number;
  current_step: RoadmapStepItem | null;
  next_recommended_action?: RoadmapStepItem | null;
  pending_steps?: RoadmapStepItem[];
}

export interface DiscoveryTender {
  id: string;
  tender_id: string;
  title: string;
  organization: string;
  sector: string;
  estimated_budget: number;
  emd_amount: number;
  emd_exemption_allowed: boolean;
  deadline: string;
  total_pages: number;
  active_version: number;
  match_score: number;
  match_tier: string;
  key_technologies: string[];
  is_active_target?: boolean;
}

export interface DiscoveryTendersResponse {
  tenders: DiscoveryTender[];
  total_count: number;
  all_sectors: string[];
}

export interface FinancialScheme {
  id: string;
  title: string;
  agency: string;
  type: string;
  max_support: string;
  eligibility_summary: string;
  benefits: string;
  application_url: string;
  match_status: string;
}

export interface FinancialSchemesResponse {
  schemes: FinancialScheme[];
  total_count: number;
  disclaimer: string;
}

export type ApplicationStatus = 
  | 'DRAFT'
  | 'READY'
  | 'SUBMITTED'
  | 'UNDER_EVALUATION'
  | 'RESULT_DECLARED'
  | 'WON'
  | 'NOT_WON';

export type ContractStatus = 
  | 'PENDING'
  | 'CONTRACT_SIGNED'
  | 'PROJECT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface ApplicationRecordItem {
  id: string;
  tender_id: string;
  tender_title: string;
  bid_id: string;
  submission_date: string;
  portal_name: string;
  status: ApplicationStatus;
  evaluated_date?: string;
  award_amount?: string;
  contract_status: ContractStatus;
  project_progress_pct: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationsResponse {
  applications: ApplicationRecordItem[];
  total_count: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  company_name: string;
  is_demo?: boolean;
  email_verified?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user: User | null;
  startup?: StartupProfile | null;
  authenticated?: boolean;
  token?: string;
}
