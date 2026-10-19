import type { 
  BackendHealthResponse, 
  StartupProfile, 
  ProfileCompletion, 
  StartupDocument, 
  TenderMetadata, 
  ExtractedRequirement, 
  ExplainableMatchResult, 
  EligibilityGapItem, 
  EvidenceMappingItem, 
  ActionPlanItem, 
  ReadinessScoreResult, 
  PreBidAuditResult, 
  TenderChangesResult,
  RoadmapResponse,
  RoadmapStepItem,
  DiscoveryTendersResponse,
  FinancialSchemesResponse,
  ApplicationRecordItem,
  ApplicationsResponse,
  User,
  AuthResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const storedUserId = localStorage.getItem('procureease_user_id');
  const headers = new Headers(options?.headers || {});
  if (storedUserId && !headers.has('X-User-Id')) {
    headers.set('X-User-Id', storedUserId);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errData = await response.json();
      if (errData && errData.error) errorMsg = errData.error;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  // Authentication
  async register(data: { name: string; email: string; password: string; company_name: string }): Promise<AuthResponse> {
    return fetchJson(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    return fetchJson(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE_URL}/auth/logout`, {
      method: 'POST'
    });
  },

  async getMe(): Promise<{ authenticated: boolean; user: User | null; startup: StartupProfile | null }> {
    return fetchJson(`${API_BASE_URL}/auth/me`);
  },

  async loginDemo(): Promise<AuthResponse> {
    return fetchJson(`${API_BASE_URL}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
  },

  // System Health
  async getHealth(): Promise<BackendHealthResponse> {
    return fetchJson<BackendHealthResponse>(`${API_BASE_URL}/health`);
  },

  // Startup Profile
  async getProfile(): Promise<{ exists: boolean; profile: StartupProfile | null; completion: ProfileCompletion }> {
    return fetchJson(`${API_BASE_URL}/startup/profile`);
  },

  async saveProfile(profileData: Partial<StartupProfile>): Promise<{ success: boolean; message: string; profile: StartupProfile; completion: ProfileCompletion }> {
    return fetchJson(`${API_BASE_URL}/startup/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
  },

  // Document Vault
  async getDocuments(): Promise<{ documents: StartupDocument[]; total_count: number; category_summary: Record<string, number>; valid_categories: string[] }> {
    return fetchJson(`${API_BASE_URL}/documents`);
  },

  async uploadDocument(formData: FormData): Promise<{ success: boolean; message: string; document: StartupDocument }> {
    return fetchJson(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData
    });
  },

  async deleteDocument(documentId: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE'
    });
  },

  // Tenders
  async getTenders(): Promise<{ tenders: TenderMetadata[]; total_count: number }> {
    return fetchJson(`${API_BASE_URL}/tenders`);
  },

  async uploadTender(formData: FormData): Promise<{ success: boolean; message: string; tender: TenderMetadata }> {
    return fetchJson(`${API_BASE_URL}/tenders/upload`, {
      method: 'POST',
      body: formData
    });
  },

  async loadSampleTender(): Promise<{ success: boolean; message: string; tender: TenderMetadata }> {
    return fetchJson(`${API_BASE_URL}/tenders/sample`, {
      method: 'POST'
    });
  },

  async deleteTender(tenderId: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}`, {
      method: 'DELETE'
    });
  },

  // Analysis Pipeline
  async getRequirements(tenderId: string): Promise<{ requirements: ExtractedRequirement[]; total_count: number; source: string }> {
    return fetchJson(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/requirements`);
  },

  async decodeTender(tenderId: string): Promise<{ success: boolean; mode: string; total_extracted: number; requirements: ExtractedRequirement[] }> {
    return fetchJson(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/decode`, {
      method: 'POST'
    });
  },

  async getMatch(tenderId: string): Promise<ExplainableMatchResult> {
    return fetchJson(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/match`);
  },

  async getEligibility(tenderId: string): Promise<{ eligibility_matrix: EligibilityGapItem[]; total_items: number; disclaimer: string }> {
    return fetchJson(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/eligibility`);
  },

  async getEvidence(tenderId: string): Promise<{ evidence_mappings: EvidenceMappingItem[]; total_count: number }> {
    return fetchJson(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/evidence`);
  },

  async saveEvidence(tenderId: string, mapping: Partial<EvidenceMappingItem>): Promise<{ success: boolean; message: string; mapping: EvidenceMappingItem }> {
    return fetchJson(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapping)
    });
  },

  async getActions(tenderId: string): Promise<{ actions: ActionPlanItem[]; total_count: number }> {
    return fetchJson(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/actions`);
  },

  async updateActionStatus(tenderId: string, actionId: string, status: string): Promise<{ success: boolean; message: string; action_id: string; new_status: string; updated_readiness: ReadinessScoreResult }> {
    return fetchJson(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/actions/${encodeURIComponent(actionId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  },

  async getReadiness(tenderId: string): Promise<ReadinessScoreResult> {
    return fetchJson(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/readiness`);
  },

  async getAudit(tenderId: string): Promise<PreBidAuditResult> {
    return fetchJson(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/audit`);
  },

  async getChanges(tenderId: string): Promise<TenderChangesResult> {
    return fetchJson(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}/changes`);
  },

  // 1-Click Demo Management
  async loadDemoData(): Promise<{ success: boolean; message: string; startup: StartupProfile; tender: TenderMetadata }> {
    return fetchJson(`${API_BASE_URL}/demo/load`, {
      method: 'POST'
    });
  },

  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE_URL}/demo/reset`, {
      method: 'POST'
    });
  },

  // Guided Procurement Journey APIs
  async getRoadmap(): Promise<RoadmapResponse> {
    return fetchJson(`${API_BASE_URL}/journey/roadmap`);
  },

  async updateRoadmapStep(stepId: string, data: Partial<RoadmapStepItem>): Promise<{ success: boolean; message: string; step: RoadmapStepItem }> {
    return fetchJson(`${API_BASE_URL}/journey/roadmap/${encodeURIComponent(stepId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async resetRoadmap(): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE_URL}/journey/roadmap/reset`, {
      method: 'POST'
    });
  },

  async getDiscoveryTenders(params?: { sector?: string; search?: string; min_score?: number }): Promise<DiscoveryTendersResponse> {
    const searchParams = new URLSearchParams();
    if (params?.sector) searchParams.set('sector', params.sector);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.min_score !== undefined) searchParams.set('min_score', params.min_score.toString());
    const query = searchParams.toString();
    return fetchJson(`${API_BASE_URL}/journey/tenders/discovery${query ? `?${query}` : ''}`);
  },

  async getApplications(): Promise<ApplicationsResponse> {
    return fetchJson(`${API_BASE_URL}/journey/applications`);
  },

  async createApplication(appData: Partial<ApplicationRecordItem>): Promise<{ success: boolean; message: string; application: ApplicationRecordItem }> {
    return fetchJson(`${API_BASE_URL}/journey/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });
  },

  async updateApplication(appId: string, appData: Partial<ApplicationRecordItem>): Promise<{ success: boolean; message: string; application: ApplicationRecordItem }> {
    return fetchJson(`${API_BASE_URL}/journey/applications/${encodeURIComponent(appId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });
  },

  async getFinanceSchemes(): Promise<FinancialSchemesResponse> {
    return fetchJson(`${API_BASE_URL}/journey/finance/schemes`);
  }
};

