import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  RefreshCw,
  RotateCcw,
  Zap,
  Lock,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Compass,
  Check
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { 
  TenderMetadata, 
  ReadinessScoreResult, 
  ExplainableMatchResult, 
  ActionPlanItem, 
  ProfileCompletion,
  RoadmapStepItem,
  RoadmapResponse,
  ApplicationRecordItem
} from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTender, setActiveTender] = useState<TenderMetadata | null>(null);
  const [readiness, setReadiness] = useState<ReadinessScoreResult | null>(null);
  const [matchResult, setMatchResult] = useState<ExplainableMatchResult | null>(null);
  const [actions, setActions] = useState<ActionPlanItem[]>([]);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion | null>(null);
  const [companyName, setCompanyName] = useState<string>(user?.company_name || 'My Startup');
  const [docCount, setDocCount] = useState<number>(0);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Guided Journey Roadmap States
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [applications, setApplications] = useState<ApplicationRecordItem[]>([]);
  const [selectedStepForEdit, setSelectedStepForEdit] = useState<RoadmapStepItem | null>(null);
  const [editRefInput, setEditRefInput] = useState<string>('');
  const [editNotesInput, setEditNotesInput] = useState<string>('');
  const [updatingStep, setUpdatingStep] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Load Profile & Roadmap concurrently
      const [profRes, roadRes, appRes, tRes, docRes] = await Promise.all([
        api.getProfile(),
        api.getRoadmap(),
        api.getApplications(),
        api.getTenders(),
        api.getDocuments().catch(() => ({ total_count: 0 }))
      ]);

      if (profRes.profile && profRes.profile.name) {
        setCompanyName(profRes.profile.name);
      } else if (user?.company_name) {
        setCompanyName(user.company_name);
      }
      setProfileCompletion(profRes.completion);
      setRoadmap(roadRes);
      setApplications(appRes.applications || []);
      setDocCount(docRes.total_count || 0);

      const isDemo = user?.is_demo || user?.email === 'demo@procureease.in';
      const hasProgress = isDemo || (roadRes && roadRes.completed_count > 0) || (appRes.applications && appRes.applications.length > 0);

      if (hasProgress && tRes.tenders && tRes.tenders.length > 0) {
        const tender = tRes.tenders[0];
        setActiveTender(tender);
        const tenderId = tender.id || tender.tender_id;

        const [readRes, matchRes, actRes] = await Promise.all([
          api.getReadiness(tenderId),
          api.getMatch(tenderId),
          api.getActions(tenderId)
        ]);

        setReadiness(readRes);
        setMatchResult(matchRes);
        setActions(actRes.actions || []);
      } else {
        setActiveTender(tRes.tenders && tRes.tenders.length > 0 ? tRes.tenders[0] : null);
        setReadiness(null);
        setMatchResult(null);
        setActions([]);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLoadDemo = async () => {
    try {
      setLoading(true);
      const res = await api.loadDemoData();
      setBannerNotice(res.message || '12-Step Guided Procurement Journey loaded successfully.');
      await fetchDashboardData();
    } catch (err: any) {
      console.error('Failed to seed demo data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetJourney = async () => {
    if (!window.confirm('Reset roadmap journey to initial uncompleted state?')) return;
    try {
      setLoading(true);
      await api.resetRoadmap();
      setBannerNotice('Roadmap reset to initial state.');
      await fetchDashboardData();
    } catch (err: any) {
      console.error('Failed to reset roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStepEditor = (step: RoadmapStepItem) => {
    setSelectedStepForEdit(step);
    setEditRefInput(step.evidence_reference || '');
    setEditNotesInput(step.notes || '');
  };

  const handleSaveStepCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStepForEdit) return;

    try {
      setUpdatingStep(true);
      const res = await api.updateRoadmapStep(selectedStepForEdit.id, {
        status: 'COMPLETED',
        evidence_reference: editRefInput.trim(),
        notes: editNotesInput.trim()
      });
      setBannerNotice(`Step ${res.step.step_number} marked as COMPLETED! Next step unlocked.`);
      setSelectedStepForEdit(null);
      await fetchDashboardData();
    } catch (err: any) {
      console.error('Failed to update step:', err);
    } finally {
      setUpdatingStep(false);
    }
  };

  // Readiness dial calculation
  const isDemo = user?.is_demo || user?.email === 'demo@procureease.in';
  const hasReadinessCalculated = (isDemo || (roadmap && roadmap.completed_count > 0)) && readiness !== null;
  const currentScore = readiness?.overall_score ?? 0;
  const isSubmissionReady = readiness?.final_status === 'READY_FOR_SUBMISSION';
  const readinessData = [
    { name: 'Satisfied', value: currentScore, color: isSubmissionReady ? '#10b981' : currentScore >= 80 ? '#f59e0b' : '#2563eb' },
    { name: 'Gaps', value: Math.max(0, 100 - currentScore), color: '#f1f5f9' },
  ];

  const currentStep = roadmap?.current_step;
  const activeApp = applications.length > 0 ? applications[0] : null;

  return (
    <div className="space-y-8 pb-12">
      {/* 1-Click Interactive Demo Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-xl text-blue-300">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Guided Procurement Roadmap Mode</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-white">
              {companyName} • {roadmap ? `${roadmap.completed_count} of ${roadmap.total_steps} Steps Complete` : '12-Step Journey'}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={Sparkles}
            onClick={handleLoadDemo}
            loading={loading}
          >
            Load 1-Click Complete Demo
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetJourney}
            className="text-white border-white/20 hover:bg-white/10"
          >
            Reset Journey
          </Button>
        </div>
      </div>

      {bannerNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>{bannerNotice}</span>
          <button onClick={() => setBannerNotice(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Tender-to-Action Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Good morning, {companyName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your procurement journey is{' '}
            <strong className="text-blue-700 font-bold">
              {roadmap ? `${roadmap.overall_progress_pct}%` : '42%'} complete
            </strong>
            . Complete each step to become procurement-ready.
          </p>
        </div>
      </div>

      {/* 7-Card Procurement KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. CURRENT STEP */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Current Step
          </span>
          <p className="text-xs font-black text-blue-900 truncate">
            {currentStep ? `0${currentStep.step_number} • ${currentStep.short_title}` : '01 • Registration'}
          </p>
          <span className="text-[10px] text-blue-600 font-semibold block">
            {currentStep?.category || 'Pre-Bid'}
          </span>
        </div>

        {/* 2. NEXT ACTION */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Next Action
          </span>
          <p className="text-xs font-black text-slate-900 truncate">
            {actions.find(a => a.status !== 'COMPLETED')?.title || (hasReadinessCalculated ? 'Verify Compliance' : 'Complete Profile Setup')}
          </p>
          <span className="text-[10px] text-amber-600 font-semibold block">
            {hasReadinessCalculated ? 'Critical Blocker' : 'Initial Milestone'}
          </span>
        </div>

        {/* 3. BID READINESS */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Bid Readiness
          </span>
          <p className={`text-xs font-black ${hasReadinessCalculated ? 'text-emerald-700' : 'text-slate-500'}`}>
            {hasReadinessCalculated ? `${currentScore}% Ready` : 'Not calculated yet'}
          </p>
          <span className="text-[10px] text-slate-500 font-semibold block">
            {hasReadinessCalculated ? (isSubmissionReady ? 'Submission Ready' : 'Attention Req.') : 'Audit tender to score'}
          </span>
        </div>

        {/* 4. UPCOMING DEADLINE */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Upcoming Deadline
          </span>
          <p className="text-xs font-black text-slate-900 truncate">
            {hasReadinessCalculated ? (activeTender?.deadline || '28 Oct 2026') : 'None Active'}
          </p>
          <span className="text-[10px] text-rose-600 font-semibold block">
            {hasReadinessCalculated ? '14 Days Left' : 'Discover Tenders'}
          </span>
        </div>

        {/* 5. ACTIVE TENDERS */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Tenders
          </span>
          <p className="text-xs font-black text-slate-900">
            {applications.length > 0 ? `${applications.length} Active Target` : '0 Active Targets'}
          </p>
          <span className="text-[10px] text-blue-600 font-semibold block">
            12 In Discovery
          </span>
        </div>

        {/* 6. PENDING DOCUMENTS */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Uploaded Docs
          </span>
          <p className={`text-xs font-black ${docCount > 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
            {docCount > 0 ? `${docCount} Uploaded` : '0 Uploaded'}
          </p>
          <span className="text-[10px] text-slate-500 font-semibold block truncate">
            {docCount > 0 ? 'Document Vault' : 'No documents yet'}
          </span>
        </div>

        {/* 7. APPLICATION STATUS */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            App Status
          </span>
          <p className="text-xs font-black text-slate-900 truncate">
            {activeApp ? activeApp.status.replace(/_/g, ' ') : '0 Applications'}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            {activeApp?.bid_id || 'No bids submitted'}
          </span>
        </div>
      </div>

      {/* Main Guided Journey Progress Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                End-to-End Guided Journey
              </span>
              <span className="text-xs text-slate-500 font-medium">
                AI understands. Rules decide.
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Your Procurement Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Complete each step to become procurement-ready. Step-by-step guidance from startup incorporation, government certifications, and GeM onboarding to tender eligibility, bid submission, and contract execution.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            {profileCompletion && (
              <div className="text-right border-r border-slate-200 pr-5 hidden sm:block">
                <div className="text-2xl font-black text-emerald-600">
                  {profileCompletion.percentage}%
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Profile Ready
                </div>
              </div>
            )}
            <div className="text-right">
              <div className="text-2xl font-black text-blue-700">
                {roadmap ? `${roadmap.overall_progress_pct}%` : '50%'}
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Progress
              </div>
            </div>
          </div>
        </div>

        {/* Journey Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Stage: {currentStep ? `Step ${currentStep.step_number} — ${currentStep.short_title}` : 'Step 6 — Document Checklist'}</span>
            <span className="text-blue-700 font-bold font-mono">
              {roadmap ? `${roadmap.completed_count} / ${roadmap.total_steps} Completed` : '5 / 12 Completed'}
            </span>
          </div>
          <ProgressBar
            value={roadmap ? roadmap.overall_progress_pct : 42}
            variant="primary"
            showPercentage={false}
          />
        </div>
      </div>

      {/* Next Action Spotlight Card */}
      {currentStep && (
        <Card className="border-blue-300 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                    CURRENT STEP • STEP {currentStep.step_number}
                  </span>
                  <span className="text-xs font-bold text-blue-900">
                    {currentStep.category}
                  </span>
                  <StatusBadge status={currentStep.status} size="sm" />
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {currentStep.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  {currentStep.description}
                </p>

                <div className="p-3 rounded-xl bg-white/80 border border-blue-200/60 text-xs text-blue-950 font-medium flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Required Action:</strong> {currentStep.required_action}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Current Step */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                {currentStep.official_portal_url && (
                  <a
                    href={currentStep.official_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full justify-between" icon={ExternalLink}>
                      Open {currentStep.official_portal_name || 'Official Portal'}
                    </Button>
                  </a>
                )}

                {currentStep.internal_route && (
                  <Link to={currentStep.internal_route}>
                    <Button variant="primary" size="sm" className="w-full justify-between" icon={ChevronRight}>
                      Continue in Workspace
                    </Button>
                  </Link>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-between font-semibold border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/60"
                  icon={CheckCircle2}
                  onClick={() => handleOpenStepEditor(currentStep)}
                >
                  Record Evidence & Complete
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 12-Step Visual Roadmap Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">12-Step Procurement Journey Matrix</h3>
            <p className="text-xs text-slate-500">Each completed milestone automatically unlocks the subsequent gate.</p>
          </div>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboardData}>
            Refresh Status
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {roadmap?.steps.map((step) => {
            const isCompleted = step.status === 'COMPLETED';
            const isInProgress = step.status === 'IN_PROGRESS';
            const isLocked = step.status === 'LOCKED';

            return (
              <div
                key={step.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200/90 hover:border-emerald-300 shadow-xs'
                    : isInProgress
                    ? 'bg-blue-50/50 border-blue-300 shadow-sm ring-1 ring-blue-300'
                    : 'bg-slate-50/70 border-slate-200 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' :
                      isInProgress ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      Step {step.step_number < 10 ? `0${step.step_number}` : step.step_number}
                    </span>

                    <div className="flex items-center gap-1">
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Done
                        </span>
                      ) : isInProgress ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                          In Progress
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {step.title}
                  </h4>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {step.description}
                  </p>

                  {step.evidence_reference && (
                    <div className="p-2 rounded-lg bg-white border border-slate-200/70 text-[11px] text-slate-700 font-mono truncate">
                      <strong>Ref:</strong> {step.evidence_reference}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  {step.official_portal_url ? (
                    <a
                      href={step.official_portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-slate-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Internal</span>
                  )}

                  <div className="flex items-center gap-1">
                    {step.internal_route && !isLocked && (
                      <Link to={step.internal_route}>
                        <Button variant="ghost" size="sm" className="text-xs px-2 py-1">
                          Open →
                        </Button>
                      </Link>
                    )}

                    {!isLocked && (
                      <button
                        onClick={() => handleOpenStepEditor(step)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                          isCompleted
                            ? 'text-emerald-700 bg-white border-emerald-200 hover:bg-emerald-50'
                            : 'text-blue-700 bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isCompleted ? 'Edit' : 'Complete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Supporting Intelligence Grid: Active Tender, Bid Readiness, Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Active Tender Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge status="ACTIVE" size="sm" />
                <span className="text-xs font-mono text-slate-500">
                  {activeTender ? activeTender.tender_id : 'GEM/2026/B/89210'}
                </span>
              </div>
              <CardTitle className="mt-2 text-xl">
                {activeTender ? activeTender.title : 'Supply & Implementation of IoT Smart Monitoring Nodes'}
              </CardTitle>
              <CardDescription>
                {activeTender ? activeTender.organization : 'National Smart Infrastructure Mission / State PWD Procurement Division'}
              </CardDescription>
            </div>
            <Link to="/tenders">
              <Button variant="outline" size="sm" icon={Compass}>
                Explore 12+ Tenders
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Estimated Value</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  ₹ {activeTender ? `${activeTender.estimated_budget} Lakhs` : '1.45 Cr'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">EMD Waiver</span>
                <p className="font-bold text-emerald-700 text-sm mt-0.5">
                  Exempted (DPIIT)
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Explainable Fit</span>
                <p className="font-bold text-blue-700 text-sm mt-0.5">
                  {matchResult ? `${matchResult.score}% Strong Match` : '82% Match'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Submission Gate</span>
                <p className="font-bold text-amber-700 text-sm mt-0.5">
                  {isSubmissionReady ? 'Ready' : 'Remedies Required'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">
              <Link to="/tenders" className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">
                Tender Decoder & Requirements →
              </Link>
              <Link to="/eligibility" className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">
                Eligibility Matrix (Rule 173(i)) →
              </Link>
              <Link to="/checklist" className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">
                Action Plan ({actions.filter(a => a.status !== 'COMPLETED').length} Pending) →
              </Link>
              <Link to="/readiness" className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">
                Pre-Bid Audit Gate →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Bid Readiness Dial & Application Tracker */}
        <div className="space-y-6">
          {/* Readiness Dial */}
          <Card className="text-center">
            <CardHeader className="pb-1">
              <CardTitle className="text-base">Bid Readiness Audit</CardTitle>
              <CardDescription className="text-xs">Deterministic compliance score</CardDescription>
            </CardHeader>
            <CardContent className="py-4 flex flex-col items-center justify-center">
              {hasReadinessCalculated ? (
                <>
                  <div className="w-36 h-36 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={readinessData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={60}
                          startAngle={90}
                          endAngle={-270}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {readinessData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-900">{currentScore}%</span>
                      <span className={`text-[10px] font-bold uppercase ${
                        isSubmissionReady ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {isSubmissionReady ? 'Ready' : 'In Progress'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full pt-3 mt-2 border-t border-slate-100 flex justify-between text-xs font-semibold">
                    <Link to="/readiness" className="text-blue-600 hover:underline">
                      Why is my score {currentScore}%?
                    </Link>
                    <Link to="/applications" className="text-emerald-700 hover:underline">
                      Track Submissions →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-4 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-dashed border-slate-200">
                    <span className="text-sm font-black uppercase text-slate-400">N/A</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-1">Not calculated yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mb-3">
                    Compliance score will be calculated once you analyze an active tender.
                  </p>
                  <Link to="/tenders">
                    <Button variant="outline" size="sm" icon={Compass} className="text-xs">
                      Discover Tenders →
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Application Snapshot */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Active Bid Application
              </CardTitle>
              <CardDescription className="text-xs">Post-submission tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {activeApp ? (
                <>
                  <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                    <span className="text-slate-500">Bid ID:</span>
                    <span className="font-mono font-bold text-slate-800">{activeApp.bid_id}</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                    <span className="text-slate-500">Status:</span>
                    <StatusBadge status={activeApp.status} size="sm" />
                  </div>
                  {activeApp.status === 'WON' && (
                    <div className="flex justify-between p-2.5 rounded-lg bg-emerald-50 text-emerald-900 font-bold">
                      <span>Award Amount:</span>
                      <span>{activeApp.award_amount || '₹ 1.38 Cr'}</span>
                    </div>
                  )}
                  <Link to="/applications" className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Full Application & Contract →
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-4 text-slate-400">
                  <p>No active submission recorded.</p>
                  <Link to="/applications" className="text-blue-600 text-xs font-bold hover:underline block mt-1">
                    Record Bid ID →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Step Evidence & Completion Modal */}
      {selectedStepForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase">
                  Step {selectedStepForEdit.step_number} • {selectedStepForEdit.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedStepForEdit.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStepForEdit(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStepCompletion} className="mt-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-blue-900 leading-relaxed space-y-2">
                <p>
                  <strong>Required Step Action:</strong> {selectedStepForEdit.required_action}
                </p>
                {selectedStepForEdit.step_number === 1 && (
                  <p className="text-[11px] text-blue-800">
                    Complete the required startup registration through the official portal, then return to ProcureEase and upload your proof.
                  </p>
                )}
                {selectedStepForEdit.step_number === 2 && (
                  <div className="pt-1 border-t border-blue-200/60 space-y-1 text-[11px] text-blue-900 font-semibold">
                    <span>Common Registration & Certification Checklist:</span>
                    <ul className="list-disc pl-4 text-slate-700 font-normal space-y-0.5">
                      <li>GST Registration (Active GSTIN)</li>
                      <li>PAN (Permanent Account Number)</li>
                      <li>Udyam / MSME Registration</li>
                      <li>DPIIT Startup Recognition (if applicable)</li>
                      <li>ISO 9001:2015 Quality Certification</li>
                    </ul>
                  </div>
                )}
                {selectedStepForEdit.step_number === 3 && (
                  <p className="text-[11px] text-blue-800">
                    Access the official procurement portal (GeM). Complete primary seller onboarding, bank verification, and return to record your GeM Seller ID.
                  </p>
                )}
              </div>

              {/* Action Buttons for External Portal & Document Vault */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {selectedStepForEdit.official_portal_url && (
                  <a
                    href={selectedStepForEdit.official_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                  >
                    Open Official Website <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <Link
                  to="/documents"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Upload Proof to Vault
                </Link>
                {selectedStepForEdit.step_number === 4 && (
                  <Link
                    to="/tenders"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  >
                    Discover 12+ RFPs →
                  </Link>
                )}
                {selectedStepForEdit.step_number === 5 && (
                  <Link
                    to="/eligibility"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  >
                    View Gap Matrix →
                  </Link>
                )}
                {selectedStepForEdit.step_number === 7 && (
                  <Link
                    to="/readiness"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    View Audit Score (78%) →
                  </Link>
                )}
                {selectedStepForEdit.step_number >= 8 && selectedStepForEdit.step_number <= 9 && (
                  <Link
                    to="/applications"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    Manage Applications →
                  </Link>
                )}
                {selectedStepForEdit.step_number === 10 && (
                  <Link
                    to="/finance"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100"
                  >
                    Explore Funding Schemes →
                  </Link>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Evidence / Reference Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. DIPP98214, UDYAM-MH-02, GEM-OEM-123, or Bid ID"
                  value={editRefInput}
                  onChange={(e) => setEditRefInput(e.target.value)}
                  className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Enter the certificate number, registration ID, or proof document name.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes & Verification Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Registered on portal and uploaded proof to Document Vault."
                  value={editNotesInput}
                  onChange={(e) => setEditNotesInput(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStepForEdit(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={updatingStep}
                  icon={CheckCircle2}
                >
                  Mark Completed & Unlock Next Step
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
