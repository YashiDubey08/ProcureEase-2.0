import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  RotateCcw, 
  Search, 
  RefreshCw, 
  FileText 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { RoadmapResponse, RoadmapStepItem, StepStatus } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';

export const RoadmapPage: React.FC = () => {
  const { user, startup } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  // Form states for the currently expanded step
  const [editStatus, setEditStatus] = useState<StepStatus>('NOT_STARTED');
  const [editRefNum, setEditRefNum] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingStepId, setSavingStepId] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setNotification(null);
      const res = await api.getRoadmap();
      setRoadmap(res);

      // Auto-expand next recommended step if none expanded
      if (!expandedStepId && res.next_recommended_action) {
        setExpandedStepId(res.next_recommended_action.id);
        initStepForm(res.next_recommended_action);
      }
    } catch (err: any) {
      console.error('Failed to load roadmap:', err);
      setNotification({ type: 'error', text: err.message || 'Unable to load roadmap.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const initStepForm = (step: RoadmapStepItem) => {
    setEditStatus(step.status);
    setEditRefNum(step.reference_number || step.evidence_reference || '');
    setEditDate(step.submission_date || '');
    setEditNotes(step.notes || '');
  };

  const handleToggleExpand = (step: RoadmapStepItem) => {
    if (expandedStepId === step.id) {
      setExpandedStepId(null);
    } else {
      setExpandedStepId(step.id);
      initStepForm(step);
    }
  };

  const handleSaveStep = async (step: RoadmapStepItem) => {
    try {
      setSavingStepId(step.id);
      setNotification(null);

      await api.updateRoadmapStep(step.id, {
        status: editStatus,
        reference_number: editRefNum.trim(),
        submission_date: editDate.trim(),
        notes: editNotes.trim()
      });

      setNotification({
        type: 'success',
        text: `Updated "${step.title}".`
      });

      await fetchRoadmap();
    } catch (err: any) {
      console.error('Failed to save step:', err);
      setNotification({ type: 'error', text: err.message || 'Failed to update step progress.' });
    } finally {
      setSavingStepId(null);
    }
  };

  const handleResetRoadmap = async () => {
    if (!window.confirm('Reset all roadmap steps to Not Started?')) {
      return;
    }
    try {
      setLoading(true);
      await api.resetRoadmap();
      setNotification({ type: 'success', text: 'Roadmap progress reset.' });
      await fetchRoadmap();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to reset progress.' });
    } finally {
      setLoading(false);
    }
  };

  const companyName = startup?.name || user?.company_name || 'My Startup';
  const domain = startup?.business_domain || startup?.sector || 'Technology';

  // Filter steps
  const filteredSteps = (roadmap?.steps || []).filter((step) => {
    if (filterStatus === 'PENDING' && step.status === 'COMPLETED') return false;
    if (filterStatus === 'IN_PROGRESS' && step.status !== 'IN_PROGRESS') return false;
    if (filterStatus === 'COMPLETED' && step.status !== 'COMPLETED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = step.title.toLowerCase().includes(q);
      const matchPortal = step.official_portal_name.toLowerCase().includes(q);
      const matchDesc = step.description.toLowerCase().includes(q);
      return matchTitle || matchPortal || matchDesc;
    }
    return true;
  });

  const getStatusBadge = (status: StepStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
            Completed
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded">
            Submitted
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded">
            In Progress
          </span>
        );
      case 'NEEDS_ATTENTION':
        return (
          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded">
            Needs Attention
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Not Started
          </span>
        );
    }
  };

  if (loading && !roadmap) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
          <p className="text-xs text-slate-500">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Workspace Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">
              <span>{companyName}</span>
              <span> • </span>
              <span>{domain}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              My Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Follow each official step and update your progress.
            </p>
          </div>

          <button
            onClick={handleResetRoadmap}
            disabled={loading}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Progress Bar Strip */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
            <span>{roadmap?.completed_count ?? 0} of {roadmap?.total_steps ?? 0} steps completed</span>
            <span className="font-semibold text-slate-900">{roadmap?.overall_progress_pct ?? 0}%</span>
          </div>
          <ProgressBar value={roadmap?.overall_progress_pct ?? 0} color="bg-blue-600" height="h-1.5" />
        </div>
      </div>

      {notification && (
        <div 
          className={`p-3.5 rounded-lg text-xs font-medium flex items-center justify-between ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{notification.text}</span>
          <button 
            onClick={() => setNotification(null)}
            className="text-xs hover:opacity-70 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search steps or portals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs w-full sm:w-auto">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterStatus === st 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All' : st === 'PENDING' ? 'Pending' : st === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Roadmap Steps */}
      {filteredSteps.length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-2">
          <p className="text-xs text-slate-500">No steps match your search filter.</p>
          <button
            onClick={() => { setFilterStatus('ALL'); setSearchQuery(''); }}
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSteps.map((step) => {
            const isExpanded = expandedStepId === step.id;
            const reqDocs = step.required_documents || [];

            return (
              <div 
                key={step.id}
                className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-colors"
              >
                {/* Step Row / Primary Info */}
                <div 
                  onClick={() => handleToggleExpand(step)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Number Circle */}
                    <div 
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        step.status === 'COMPLETED'
                          ? 'bg-emerald-600 text-white'
                          : step.status === 'IN_PROGRESS'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {step.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span>{step.step_number}</span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                          {step.title}
                        </h2>
                      </div>
                      
                      {/* Short explanation */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Required documents summary */}
                      {reqDocs.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                          <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            Requires: {reqDocs.map(d => d.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                    {getStatusBadge(step.status)}

                    <a
                      href={step.official_portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
                      title="Open Official Website"
                    >
                      <span className="hidden sm:inline">Open Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button 
                      className="p-1 rounded text-slate-400 hover:text-slate-600"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-4">
                    {/* Why Necessary & Applicability */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1">
                        <span className="font-semibold text-slate-800 block">Why this step is necessary</span>
                        <p className="text-slate-600 leading-relaxed">
                          {step.why_necessary || 'Statutory requirement for legal compliance and registration.'}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1">
                        <span className="font-semibold text-slate-800 block">Applicability</span>
                        <p className="text-slate-600 leading-relaxed">
                          {step.applicability || 'Applicable to businesses in your domain and structure.'}
                        </p>
                      </div>
                    </div>

                    {/* Required Documents Detail */}
                    {reqDocs.length > 0 && (
                      <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-2">
                        <span className="text-xs font-semibold text-slate-800 block">
                          Required Documents
                        </span>
                        <div className="space-y-1.5 divide-y divide-slate-100 text-xs">
                          {reqDocs.map((doc, idx) => (
                            <div key={idx} className="pt-1.5 first:pt-0 flex items-start justify-between gap-2">
                              <div>
                                <span className="font-medium text-slate-800">{doc.name}</span>
                                {doc.explanation && (
                                  <p className="text-[11px] text-slate-500 mt-0.5">{doc.explanation}</p>
                                )}
                              </div>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                                doc.is_required ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-400'
                              }`}>
                                {doc.is_required ? 'Required' : 'Conditional'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Progress Update Controls */}
                    <div className="p-3.5 rounded-lg bg-white border border-slate-200/80 space-y-3">
                      <span className="text-xs font-semibold text-slate-800 block">
                        Update Progress
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-500 font-medium block mb-1">
                            Status
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as StepStatus)}
                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                          >
                            <option value="NOT_STARTED">Not started</option>
                            <option value="IN_PROGRESS">In progress</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="NEEDS_ATTENTION">Needs attention</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-500 font-medium block mb-1">
                            Reference / Ack Number (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. ACK-12345"
                            value={editRefNum}
                            onChange={(e) => setEditRefNum(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-500 font-medium block mb-1">
                            Submission Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-500 font-medium block mb-1">
                          Founder Notes (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Add any reminders or notes..."
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="text-[11px] text-slate-400">
                          Verified: {step.verification_source} • {step.last_verified_date}
                        </div>
                        <button
                          onClick={() => handleSaveStep(step)}
                          disabled={savingStepId === step.id}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingStepId === step.id ? 'Saving...' : 'Save'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
