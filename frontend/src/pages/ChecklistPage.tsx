import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  FileCheck2,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { api } from '../services/api';
import type { ActionPlanItem, TenderMetadata, ReadinessScoreResult } from '../types';

export const ChecklistPage: React.FC = () => {
  const [actions, setActions] = useState<ActionPlanItem[]>([]);
  const [tenders, setTenders] = useState<TenderMetadata[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [readiness, setReadiness] = useState<ReadinessScoreResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const tRes = await api.getTenders();
      setTenders(tRes.tenders || []);

      if (tRes.tenders && tRes.tenders.length > 0) {
        const activeId = tRes.tenders[0].id || tRes.tenders[0].tender_id;
        setSelectedTenderId(activeId);
        await fetchActionsAndReadiness(activeId);
      } else {
        setActions([]);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Failed to load action checklist:', err);
      setErrorMsg(err.message || 'Unable to connect to action plan engine.');
      setLoading(false);
    }
  };

  const fetchActionsAndReadiness = async (tenderId: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [actRes, readRes] = await Promise.all([
        api.getActions(tenderId),
        api.getReadiness(tenderId)
      ]);
      setActions(actRes.actions || []);
      setReadiness(readRes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load actions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (actionId: string, newStatus: string) => {
    if (!selectedTenderId) return;

    try {
      setUpdatingId(actionId);
      setErrorMsg(null);
      const res = await api.updateActionStatus(selectedTenderId, actionId, newStatus);

      // update local actions
      setActions(prev => prev.map(a => a.id === actionId ? { ...a, status: newStatus as any } : a));
      
      // update readiness with new score
      if (res.updated_readiness) {
        setReadiness(res.updated_readiness);
        setToastMsg(`Action updated! Readiness Score dynamically recalculated to ${res.updated_readiness.overall_score}%.`);
      }
    } catch (err: any) {
      console.error('Failed to update action:', err);
      setErrorMsg(err.message || 'Could not update action status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setLoading(true);
      await api.loadDemoData();
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to seed demo data.');
      setLoading(false);
    }
  };

  // Filter actions
  const filteredActions = actions.filter(a => {
    const pMatch = priorityFilter === 'ALL' || a.priority.toUpperCase() === priorityFilter.toUpperCase();
    const sMatch = statusFilter === 'ALL' || a.status.toUpperCase() === statusFilter.toUpperCase();
    return pMatch && sMatch;
  });

  const criticalCount = actions.filter(a => a.priority === 'CRITICAL').length;
  const highCount = actions.filter(a => a.priority === 'HIGH').length;
  const completedCount = actions.filter(a => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dynamic Bid Action Plan"
        description="Prioritized tasks to resolve compliance gaps and eliminate submission blockers. Every completed item instantly recalculates readiness."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Action Checklist' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => selectedTenderId && fetchActionsAndReadiness(selectedTenderId)}
              loading={loading}
            >
              Refresh
            </Button>
            <Link to="/readiness">
              <Button variant="primary" size="sm" icon={FileCheck2}>
                Pre-Bid Audit ({readiness ? `${readiness.overall_score}%` : '...'})
              </Button>
            </Link>
          </div>
        }
      />

      {/* Dynamic Feedback Toast */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">DISMISS</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 text-xs font-bold">DISMISS</button>
        </div>
      )}

      {/* Tender Switcher */}
      {tenders.length > 1 && (
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Tender:</span>
          <select
            value={selectedTenderId}
            onChange={(e) => {
              setSelectedTenderId(e.target.value);
              fetchActionsAndReadiness(e.target.value);
            }}
            aria-label="Select target tender for checklist"
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800"
          >
            {tenders.map(t => (
              <option key={t.id} value={t.id || t.tender_id}>
                {t.tender_id} — {t.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Live Readiness Synchronizer Banner */}
      {readiness && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                  Live Engine Synchronized
                </span>
                <span className={`text-xs font-bold ${
                  readiness.final_status === 'READY_FOR_SUBMISSION' ? 'text-emerald-300' : 'text-amber-300'
                }`}>
                  {readiness.final_status === 'READY_FOR_SUBMISSION' ? 'SUBMISSION READY' : 'REMEDIES REQUIRED'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Current Bid Readiness Score: <span className="text-2xl font-black text-emerald-400">{readiness.overall_score}%</span>
              </h3>
              <p className="text-xs text-blue-200 max-w-xl">
                {readiness.gate_message}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 shrink-0">
              <div className="text-center">
                <div className="text-xl font-black text-white">{completedCount}/{actions.length}</div>
                <div className="text-[10px] text-blue-200 uppercase font-bold">Tasks Done</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-xl font-black text-rose-300">{readiness.critical_blockers_count}</div>
                <div className="text-[10px] text-blue-200 uppercase font-bold">Blockers</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Priority Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setPriorityFilter(priorityFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            priorityFilter === 'CRITICAL' ? 'ring-2 ring-rose-500 bg-rose-50/70' : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Critical Blockers</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{criticalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Disqualifies bid if open</div>
        </div>

        <div 
          onClick={() => setPriorityFilter(priorityFilter === 'HIGH' ? 'ALL' : 'HIGH')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            priorityFilter === 'HIGH' ? 'ring-2 ring-amber-500 bg-amber-50/70' : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">High Priority</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{highCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">High point deductions</div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'IN_PROGRESS' ? 'ring-2 ring-blue-500 bg-blue-50/70' : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {actions.filter(a => a.status === 'IN_PROGRESS').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Being drafted or acquired</div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'COMPLETED' ? 'ring-2 ring-emerald-500 bg-emerald-50/70' : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{completedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Verified compliant</div>
        </div>
      </div>

      {/* Action Plan List */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <CardTitle>Prioritized Dynamic Action Checklist</CardTitle>
            <CardDescription>
              Select status from the dropdown to toggle action state and observe immediate readiness adjustments.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter action plan by priority"
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="VERIFICATION">Verification</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Loading action plan items...</p>
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="text-sm">No action items found.</p>
              <Button size="sm" variant="outline" className="mt-4" onClick={handleSeedDemo}>
                Load Demo Actions
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredActions.map((item) => (
                <div key={item.id} className="p-6 hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          item.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          item.priority === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          item.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.priority} PRIORITY
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-bold">
                          {item.id}
                        </span>
                        {item.requirement_id && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            Ref: {item.requirement_id}
                          </span>
                        )}
                      </div>

                      <h4 className={`text-base font-bold text-slate-900 ${
                        item.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
                      }`}>
                        {item.title}
                      </h4>

                      <div className="space-y-1.5 pt-1">
                        <div className="text-xs text-slate-600">
                          <strong className="text-slate-800">Why this matters:</strong> {item.reason}
                        </div>
                        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-950 font-medium flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Recommended Action:</strong> {item.recommended_action}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Toggle Control */}
                    <div className="sm:text-right shrink-0">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Action Status
                      </label>
                      <select
                        value={item.status}
                        disabled={updatingId === item.id}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className={`text-xs font-semibold rounded-lg px-3 py-1.5 border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                          item.status === 'COMPLETED' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                            : item.status === 'IN_PROGRESS'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Mark as Completed</option>
                        <option value="NEEDS_VERIFICATION">Needs Verification</option>
                      </select>
                      {updatingId === item.id && (
                        <div className="text-[10px] text-blue-600 font-semibold mt-1 flex items-center justify-end gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Recalculating...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
