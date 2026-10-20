import type { 
  BackendHealthResponse, 
  StartupProfile, 
  ProfileCompletion, 
  StartupDocument, 
  ChecklistDocumentItem,
  TenderMetadata, 
  ExplainableMatchResult, 
  ActionPlanItem, 
  ReadinessScoreResult, 
  RoadmapResponse,
  RoadmapStepItem,
  ApplicationsResponse,
  User,
  AuthResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers || {});

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
      else if (errData && errData.message) errorMsg = errData.message;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  // Authentication & Account Security
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

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; dev_reset_token?: string }> {
    return fetchJson(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(token: string, new_password: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password })
    });
  },

  async verifyEmail(token?: string): Promise<{ success: boolean; message: string; email_verified: boolean }> {
    return fetchJson(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token || '' })
    });
  },

  async resendVerification(): Promise<{ success: boolean; message: string; dev_verification_token?: string }> {
    return fetchJson(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST'
    });
  },

  async changePassword(current_password: string, new_password: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password, new_password })
    });
  },

  async deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE_URL}/auth/delete-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
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

  // Document Vault & Personalized Checklist
  async getDocuments(): Promise<{ 
    documents: StartupDocument[]; 
    total_count: number; 
    checklist: ChecklistDocumentItem[];
    checklist_total: number;
    prepared_count: number;
    missing_count: number;
    category_summary: Record<string, number>; 
    valid_categories: string[];
  }> {
    return fetchJson(`${API_BASE_URL}/documents`);
  },

  async uploadDocument(formData: FormData): Promise<{ success: boolean; message: string; document: StartupDocument }> {
    return fetchJson(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData
    });
  },

  async updateDocumentStatus(data: { name: string; status: string; step_key?: string; category?: string }): Promise<{ success: boolean; message: string; document: StartupDocument }> {
    return fetchJson(`${API_BASE_URL}/documents/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async deleteDocument(documentId: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE'
    });
  },

  getDocumentDownloadUrl(documentId: string): string {
    return `${API_BASE_URL}/documents/${documentId}/download`;
  },

  // Personalized Roadmap
  async getRoadmap(): Promise<RoadmapResponse> {
    return fetchJson<RoadmapResponse>(`${API_BASE_URL}/journey/roadmap`);
  },

  async updateRoadmapStep(stepId: string, data: { 
    status?: string; 
    reference_number?: string; 
    evidence_reference?: string; 
    submission_date?: string; 
    notes?: string; 
    progress_pct?: number;
  }): Promise<{ success: boolean; message: string; step: RoadmapStepItem }> {
    return fetchJson(`${API_BASE_URL}/journey/roadmap/${stepId}`, {
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

  // Legacy compatibility APIs
  async getTenders(): Promise<{ tenders: TenderMetadata[]; total_count: number }> {
    return fetchJson(`${API_BASE_URL}/tenders`);
  },

  async getDiscoveryTenders(params?: { sector?: string; search?: string }): Promise<any> {
    const q = new URLSearchParams();
    if (params?.sector) q.set('sector', params.sector);
    if (params?.search) q.set('search', params.search);
    return fetchJson(`${API_BASE_URL}/journey/tenders/discovery?${q.toString()}`);
  },

  async getRequirements(tenderId: string): Promise<any> {
    return fetchJson(`${API_BASE_URL}/tenders/${tenderId}/requirements`);
  },

  async getEvidence(tenderId: string): Promise<any> {
    return fetchJson(`${API_BASE_URL}/tenders/${tenderId}/evidence`);
  },

  async getChanges(tenderId: string): Promise<any> {
    return fetchJson(`${API_BASE_URL}/tenders/${tenderId}/changes`);
  },

  async loadSampleTender(): Promise<any> {
    return fetchJson(`${API_BASE_URL}/tenders/sample`, { method: 'POST' });
  },

  async uploadTender(formData: FormData): Promise<any> {
    return fetchJson(`${API_BASE_URL}/tenders/upload`, { method: 'POST', body: formData });
  },

  async getReadiness(tenderId: string): Promise<ReadinessScoreResult> {
    return fetchJson<ReadinessScoreResult>(`${API_BASE_URL}/tenders/${tenderId}/readiness`);
  },

  async getAudit(tenderId: string): Promise<any> {
    return fetchJson(`${API_BASE_URL}/tenders/${tenderId}/audit`);
  },

  async getEligibility(tenderId: string): Promise<any> {
    return fetchJson(`${API_BASE_URL}/tenders/${tenderId}/eligibility`);
  },

  async getFinanceSchemes(): Promise<any> {
    return fetchJson(`${API_BASE_URL}/journey/finance/schemes`);
  },

  async getMatch(tenderId: string): Promise<ExplainableMatchResult> {
    return fetchJson<ExplainableMatchResult>(`${API_BASE_URL}/tenders/${tenderId}/match`);
  },

  async getActions(tenderId: string): Promise<{ actions: ActionPlanItem[]; total_count: number }> {
    return fetchJson(`${API_BASE_URL}/tenders/${tenderId}/actions`);
  },

  async getApplications(): Promise<ApplicationsResponse> {
    return fetchJson<ApplicationsResponse>(`${API_BASE_URL}/journey/applications`);
  },

  async createApplication(data: any): Promise<any> {
    return fetchJson(`${API_BASE_URL}/journey/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async updateApplication(id: string | number, data: any): Promise<any> {
    return fetchJson(`${API_BASE_URL}/journey/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async updateActionStatus(arg1: string | number, arg2: string, arg3?: string): Promise<any> {
    const actionId = arg3 ? arg2 : arg1;
    const finalStatus = arg3 ? arg3 : arg2;
    const tenderId = arg3 ? arg1 : null;
    const url = tenderId 
      ? `${API_BASE_URL}/tenders/${tenderId}/actions/${actionId}/status`
      : `${API_BASE_URL}/actions/${actionId}/status`;
    return fetchJson(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: finalStatus })
    });
  },

  async loadDemoData(): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE_URL}/demo/load`, {
      method: 'POST'
    });
  }
};
