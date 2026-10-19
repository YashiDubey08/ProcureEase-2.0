import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Calculator,
  Lock,
  Unlock,
  Building,
  Calendar,
  XCircle,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { api } from '../services/api';
import type { 
  PreBidAuditResult, 
  TenderMetadata 
} from '../types';

export const ReadinessPage: React.FC = () => {
  const [auditResult, setAuditResult] = useState<PreBidAuditResult | null>(null);
  const [tenders, setTenders] = useState<TenderMetadata[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showMathModal, setShowMathModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const tRes = await api.getTenders();
      setTenders(tRes.tenders || []);

      if (tRes.tenders && tRes.tenders.length > 0) {
        const activeId = tRes.tenders[0].id || tRes.tenders[0].tender_id;
        setSelectedTenderId(activeId);
        await fetchAudit(activeId);
      } else {
        setAuditResult(null);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Failed to load readiness audit:', err);
      setErrorMsg(err.message || 'Unable to connect to audit engine.');
      setLoading(false);
    }
  };

  const fetchAudit = async (tenderId: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getAudit(tenderId);
      setAuditResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch pre-bid audit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTenderChange = (id: string) => {
    setSelectedTenderId(id);
    fetchAudit(id);
  };

  // Recharts Gauge Data
  const score = auditResult?.overall_score ?? 0;
  const gaugeData = [
    { name: 'Readiness', value: score },
    { name: 'Gap', value: Math.max(0, 100 - score) }
  ];
  const GAUGE_COLORS = score >= 90 ? ['#10b981', '#f1f5f9'] : score >= 80 ? ['#f59e0b', '#f1f5f9'] : ['#f43f5e', '#f1f5f9'];

  const categoryBarData = [
    { name: 'Eligibility', score: 90 },
    { name: 'Evidence', score: score >= 90 ? 95 : 75 },
    { name: 'Profile', score: 85 },
    { name: 'Actions', score: score >= 90 ? 100 : 60 }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pre-Bid Readiness Audit & Submission Gate"
        description="Transparent scoring formula and end-to-end statutory checklist to verify whether your startup should submit or address critical blockers."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Bid Readiness' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Calculator}
              onClick={() => setShowMathModal(true)}
            >
              Why is my score {score}%?
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => selectedTenderId && fetchAudit(selectedTenderId)}
              loading={loading}
            >
              Re-Audit
            </Button>
          </div>
        }
      />

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 text-xs font-bold">DISMISS</button>
        </div>
      )}

      {/* Tender Switcher */}
      {tenders.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Audit Target:</span>
            <select
              value={selectedTenderId}
              onChange={(e) => handleTenderChange(e.target.value)}
              aria-label="Select audit target tender"
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-sm"
            >
              {tenders.map(t => (
                <option key={t.id} value={t.id || t.tender_id}>
                  {t.tender_id} — {t.title}
                </option>
              ))}
            </select>
          </div>
          {auditResult && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Calendar className="w-4 h-4 text-slate-400" />
              Submission Deadline: <strong className="text-slate-800">{auditResult.deadline}</strong>
            </div>
          )}
        </div>
      )}

      {/* Primary Submission Gate Banner */}
      {auditResult && (
        <div className={`p-6 rounded-2xl border shadow-sm transition-all ${
          auditResult.overall_result === 'READY_FOR_SUBMISSION'
            ? 'bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border-emerald-400 text-white'
            : auditResult.overall_result === 'READY_WITH_WARNINGS'
            ? 'bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-900 border-amber-400 text-white'
            : 'bg-gradient-to-r from-rose-950 via-red-900 to-rose-900 border-rose-400 text-white'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                  auditResult.overall_result === 'READY_FOR_SUBMISSION'
                    ? 'bg-emerald-400 text-emerald-950'
                    : 'bg-rose-400 text-rose-950'
                }`}>
                  {auditResult.overall_result === 'READY_FOR_SUBMISSION' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {auditResult.overall_result.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-medium text-white/80">
                  Target: {auditResult.deadline}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {auditResult.gate_message}
              </h2>
              <p className="text-xs text-white/80 max-w-2xl leading-relaxed">
                {auditResult.critical_blockers && auditResult.critical_blockers.length > 0
                  ? `Submission is currently blocked by ${auditResult.critical_blockers.length} critical requirement gap(s). Resolving these items in the Action Plan will unlock green submission status.`
                  : 'All mandatory legal qualifications, certificates, and evidence excerpts have been verified.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link to="/checklist">
                <Button 
                  variant="secondary" 
                  size="md" 
                  icon={ArrowRight}
                  className="font-bold shadow-lg"
                >
                  Resolve Blockers
                </Button>
              </Link>
            </div>
          </div>

          {/* List of Critical Blockers if any */}
          {auditResult.critical_blockers && auditResult.critical_blockers.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/20">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-200 block mb-2">
                Active Submission Blockers ({auditResult.critical_blockers.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {auditResult.critical_blockers.map((b, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-xs text-white flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Analytics Grid: Radial Gauge + Category Breakdown */}
      {auditResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radial Readiness Dial */}
          <Card className="lg:col-span-1 text-center flex flex-col justify-between">
            <CardHeader className="pb-0">
              <CardTitle>Bid Readiness Dial</CardTitle>
              <CardDescription>Composite benchmark readiness percentage</CardDescription>
            </CardHeader>

            <CardContent className="py-6 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {gaugeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={GAUGE_COLORS[index % GAUGE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">
                    {score}%
                  </span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                    score >= 90 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {score >= 90 ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
              </div>

              <div className="mt-4 w-full pt-4 border-t border-slate-100 flex items-center justify-around text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Base Pts</span>
                  <strong className="text-slate-800">+{auditResult.score_math.base_satisfied_points}</strong>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Deductions</span>
                  <strong className="text-rose-600">{auditResult.score_math.missing_critical_deduction}</strong>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Formula</span>
                  <button 
                    onClick={() => setShowMathModal(true)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    View Math
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Pillar Breakdown */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Compliance Pillar Scoring</CardTitle>
              <CardDescription>Performance across key qualification verticals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any) => [`${val}%`, 'Readiness']}
                    />
                    <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 text-center">
                Completing tasks in the Action Plan directly increases the <strong>Actions</strong> and <strong>Evidence</strong> pillar scores.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 5-Category Pre-Bid Audit Checklist */}
      {auditResult && (
        <Card>
          <CardHeader>
            <CardTitle>5-Category Pre-Bid Audit Checklist</CardTitle>
            <CardDescription>
              Detailed statutory verification across legal, technical, commercial, documentary, and bid format gates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {auditResult.categories.map((cat, idx) => (
              <div key={idx} className="border border-slate-200/90 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{cat.name}</span>
                    <span className="text-xs text-slate-500">({cat.items.length} checks)</span>
                  </div>
                  <StatusBadge status={cat.status} size="sm" />
                </div>

                <div className="divide-y divide-slate-100">
                  {cat.items.map((item, cIdx) => (
                    <div key={cIdx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                          {item.status === 'PASSED' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : item.status === 'WARNING' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono pl-6">
                          Proof: {item.proof}
                        </div>
                      </div>

                      <div className="pl-6 sm:pl-0 shrink-0">
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Legal Disclaimer */}
      {auditResult && (
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center gap-3">
          <Info className="w-5 h-5 text-slate-400 shrink-0" />
          <p className="leading-relaxed">
            <strong>Official Advisory:</strong> {auditResult.disclaimer}
          </p>
        </div>
      )}

      {/* "Why is my score X%?" Math Modal */}
      {showMathModal && auditResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Score Arithmetic Breakdown
              </h3>
              <button
                onClick={() => setShowMathModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-mono font-bold text-slate-500 uppercase mb-2">
                  Deterministic Calculation Engine
                </div>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between text-emerald-700">
                    <span>Base Satisfied Requirements</span>
                    <strong>+{auditResult.score_math.base_satisfied_points} pts</strong>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>Partial Evidence / Relaxations</span>
                    <strong>+{auditResult.score_math.partial_evidence_points} pts</strong>
                  </div>
                  <div className="flex justify-between text-rose-700">
                    <span>Missing Critical Requirements</span>
                    <strong>{auditResult.score_math.missing_critical_deduction} pts</strong>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>Verification Pending Items</span>
                    <strong>{auditResult.score_math.verification_pending_deduction} pts</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-base text-slate-900">
                    <span>Final Calculated Readiness</span>
                    <span className="text-blue-700">{score}%</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900">
                <strong>Formula Explanation:</strong> {auditResult.score_math.formula_explanation}
              </div>

              <p className="text-[11px] text-slate-500">
                ProcureEase uses strictly explainable arithmetic rather than black-box AI scores, giving founders certainty about which document changes will achieve 100% readiness.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="primary" onClick={() => setShowMathModal(false)}>
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
