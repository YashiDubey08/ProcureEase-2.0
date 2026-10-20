import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { RoadmapResponse, RoadmapStepItem } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';

export const OverviewPage: React.FC = () => {
  const { user, startup } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const roadRes = await api.getRoadmap();
      setRoadmap(roadRes);
    } catch (err: any) {
      console.error('Failed to load overview:', err);
      setErrorMsg(err.message || 'Unable to load roadmap progress.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const companyName = startup?.name || user?.company_name || 'My Startup';
  const domain = startup?.business_domain || startup?.sector || 'Technology';
  const structure = startup?.business_structure || 'Private Limited Company';

  const nextStep: RoadmapStepItem | null = roadmap?.next_recommended_action || roadmap?.current_step || null;
  const pendingSteps = (roadmap?.steps || []).filter(s => s.status !== 'COMPLETED');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
          <p className="text-xs text-slate-500">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header & Progress */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{domain}</span>
              <span>•</span>
              <span>{structure}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {companyName}
            </h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-slate-500 block">Progress</span>
            <span className="text-2xl font-bold text-slate-900">
              {roadmap?.overall_progress_pct ?? 0}%
            </span>
            <span className="text-xs text-slate-400 block">
              {roadmap?.completed_count ?? 0} of {roadmap?.total_steps ?? 0} steps completed
            </span>
          </div>
        </div>

        <div className="pt-1">
          <ProgressBar 
            value={roadmap?.overall_progress_pct ?? 0} 
            color="bg-blue-600" 
            height="h-1.5" 
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button 
            onClick={fetchOverviewData}
            className="font-medium underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Next Recommended Step */}
      {nextStep ? (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
              Next Recommended Step
            </span>
            {nextStep.estimated_duration && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {nextStep.estimated_duration}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {nextStep.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              {nextStep.description}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Official portal: <strong className="font-medium text-slate-700">{nextStep.official_portal_name}</strong>
            </span>
            <div className="flex items-center gap-2">
              <a
                href={nextStep.official_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              >
                <span>Open Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Link
                to="/roadmap"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
              >
                <span>Update in Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h2 className="text-base font-semibold text-slate-900">All Steps Completed</h2>
          <p className="text-xs text-slate-500">
            You have marked all regulatory roadmap steps as completed.
          </p>
        </div>
      )}

      {/* Pending Items */}
      {pendingSteps.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Pending Milestones ({pendingSteps.length})
            </h3>
            <Link
              to="/roadmap"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>View full roadmap</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingSteps.slice(0, 5).map((step) => (
              <div 
                key={step.id} 
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-medium flex items-center justify-center shrink-0 text-[11px]">
                    {step.step_number}
                  </span>
                  <span className="font-medium text-slate-800 truncate">
                    {step.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-slate-400">
                  {step.estimated_duration && (
                    <span className="hidden sm:inline-block text-[11px] text-slate-500">
                      {step.estimated_duration}
                    </span>
                  )}
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    step.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 text-blue-700'
                      : step.status === 'SUBMITTED'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {step.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
