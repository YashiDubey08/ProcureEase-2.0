import React, { useState, useEffect } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Filter,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { api } from '../services/api';
import type { EligibilityGapItem, TenderMetadata } from '../types';

export const EligibilityPage: React.FC = () => {
  const [eligibilityItems, setEligibilityItems] = useState<EligibilityGapItem[]>([]);
  const [tenders, setTenders] = useState<TenderMetadata[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load tenders first
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const tRes = await api.getTenders();
      setTenders(tRes.tenders || []);

      if (tRes.tenders && tRes.tenders.length > 0) {
        const activeId = tRes.tenders[0].id || tRes.tenders[0].tender_id;
        setSelectedTenderId(activeId);
        await fetchEligibility(activeId);
      } else {
        setEligibilityItems([]);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Failed to load eligibility:', err);
      setErrorMsg(err.message || 'Unable to connect to eligibility engine.');
      setLoading(false);
    }
  };

  const fetchEligibility = async (tenderId: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getEligibility(tenderId);
      setEligibilityItems(res.eligibility_matrix || []);
      setDisclaimer(res.disclaimer || 'ProcureEase provides decision-support guidance. Final eligibility must be verified against tender documents.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch eligibility matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTenderChange = (id: string) => {
    setSelectedTenderId(id);
    fetchEligibility(id);
  };

  const handleSeedDemo = async () => {
    try {
      setLoading(true);
      await api.loadDemoData();
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load demo data.');
      setLoading(false);
    }
  };

  // Filter items
  const filteredItems = eligibilityItems.filter(item => {
    if (statusFilter === 'ALL') return true;
    return item.status.toUpperCase() === statusFilter.toUpperCase();
  });

  const metCount = eligibilityItems.filter(i => i.status === 'MET').length;
  const partialCount = eligibilityItems.filter(i => i.status === 'PARTIAL').length;
  const missingCount = eligibilityItems.filter(i => i.status === 'MISSING').length;
  const verifyCount = eligibilityItems.filter(i => i.status === 'VERIFY').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eligibility & Relaxation Explainer"
        description="Deterministic rule evaluation comparing startup profile capabilities against mandatory tender qualifications."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Eligibility' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => selectedTenderId && fetchEligibility(selectedTenderId)}
              loading={loading}
            >
              Recalculate
            </Button>
            <Link to="/checklist">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                View Action Plan
              </Button>
            </Link>
          </div>
        }
      />

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 text-xs font-bold">DISMISS</button>
        </div>
      )}

      {/* Tender Switcher Bar */}
      {tenders.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Evaluating Tender:</span>
            <select
              value={selectedTenderId}
              onChange={(e) => handleTenderChange(e.target.value)}
              aria-label="Select tender to evaluate"
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-sm"
            >
              {tenders.map(t => (
                <option key={t.id} value={t.id || t.tender_id}>
                  {t.tender_id} — {t.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Deterministic Engine Active
          </div>
        </div>
      )}

      {/* Startup Relaxation Alert Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 text-slate-800 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900 uppercase tracking-wide">
                DPIIT & MSME Privilege
              </span>
              <span className="text-xs font-bold text-emerald-800">Relaxation Applicable</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Government Startup Relaxations Identified: Prior Turnover & EMD Exemption
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Under <strong>Rule 173(i) of the General Financial Rules (GFR 2017)</strong> and Ministry of MSME guidelines, your startup is legally exempt from the ₹1.5 Cr annual turnover and EMD payment, provided you attach your valid DPIIT Recognition Certificate (DIPP98214) with an exemption declaration.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter(statusFilter === 'MET' ? 'ALL' : 'MET')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'MET' ? 'ring-2 ring-emerald-500 bg-emerald-50/60' : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Satisfied</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{metCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Compliant with proof</div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'PARTIAL' ? 'ALL' : 'PARTIAL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'PARTIAL' ? 'ring-2 ring-amber-500 bg-amber-50/60' : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Partial / Relaxed</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{partialCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Relaxation applicable</div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'MISSING' ? 'ALL' : 'MISSING')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'MISSING' ? 'ring-2 ring-rose-500 bg-rose-50/60' : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Critical Gaps</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{missingCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Submission blocker</div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'VERIFY' ? 'ALL' : 'VERIFY')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'VERIFY' ? 'ring-2 ring-blue-500 bg-blue-50/60' : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Verify Needed</span>
            <Info className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{verifyCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Confirm proof file</div>
        </div>
      </div>

      {/* Main Eligibility Matrix Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <CardTitle>4-Column Eligibility Gap Matrix</CardTitle>
            <CardDescription>
              Requirement $\to$ Startup Status $\to$ Evidence / Policy Advisory $\to$ Prescribed Action
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter matrix by status"
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Items ({eligibilityItems.length})</option>
              <option value="MET">Satisfied ({metCount})</option>
              <option value="PARTIAL">Partial / Relaxed ({partialCount})</option>
              <option value="MISSING">Missing Gaps ({missingCount})</option>
              <option value="VERIFY">Needs Verification ({verifyCount})</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Evaluating eligibility criteria...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 text-sm">No eligibility records found matching filter.</p>
              <Button size="sm" variant="outline" className="mt-4" onClick={handleSeedDemo}>
                Load Demo Eligibility Data
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5 w-1/4">1. Tender Requirement</th>
                    <th className="py-3 px-5 w-1/6">2. Startup Status</th>
                    <th className="py-3 px-5 w-1/3">3. Evidence / Relaxation Advisory</th>
                    <th className="py-3 px-5 w-1/4">4. Prescribed Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      {/* Col 1: Tender Requirement */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              p.{item.source_page} ({item.source_section})
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 text-sm">
                            {item.title}
                          </div>
                          <div className="text-slate-500 text-[11px] leading-relaxed">
                            {item.plain_language}
                          </div>
                        </div>
                      </td>

                      {/* Col 2: Startup Status */}
                      <td className="py-4 px-5 align-top">
                        <StatusBadge status={item.status} size="sm" />
                      </td>

                      {/* Col 3: Evidence / Relaxation Advisory */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-2">
                          {item.relaxation_advisory ? (
                            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                              <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-800 mb-0.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                Startup Exemption / Policy Rule
                              </div>
                              <p className="text-[11px] leading-relaxed">
                                {item.relaxation_advisory}
                              </p>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                              <span className="font-semibold text-slate-900 block mb-0.5">Original Tender Clause:</span>
                              <p className="font-mono text-[11px] text-slate-600">
                                "{item.clause_text}"
                              </p>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Col 4: Action Needed */}
                      <td className="py-4 px-5 align-top">
                        <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200 text-blue-950">
                          <span className="font-bold text-[11px] text-blue-800 block mb-0.5 flex items-center gap-1">
                            <ArrowRight className="w-3 h-3 text-blue-600" /> Action Required:
                          </span>
                          <p className="text-[11px] font-medium leading-relaxed">
                            {item.action_needed || 'No action needed. Compliance verified.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal Disclaimer Footer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center gap-3">
        <Info className="w-5 h-5 text-slate-400 shrink-0" />
        <p className="leading-relaxed">
          <strong>Official Compliance Notice:</strong> {disclaimer}
        </p>
      </div>
    </div>
  );
};
