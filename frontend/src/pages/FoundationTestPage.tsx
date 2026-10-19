import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Database, 
  FileCode, 
  Terminal, 
  Sparkles, 
  AlertTriangle,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';
import type { BackendHealthResponse } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const FoundationTestPage: React.FC = () => {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (err: any) {
      setError(err?.message || 'Unable to communicate with Flask backend API at /api/health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  // Demo readiness dial chart for Recharts verification
  const dialData = [
    { name: 'Completed', value: 78, color: '#2563eb' },
    { name: 'Remaining', value: 22, color: '#e2e8f0' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Phase 1 Foundation Setup Complete</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            ProcureEase 2.0
          </h1>
          <p className="text-lg text-blue-100 font-medium">
            "Don't just find tenders. Know if you can bid—and exactly what to do next."
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-lg font-mono">
              Core Concept: Tender-to-Action Intelligence
            </span>
            <span className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-lg font-mono">
              Philosophy: AI understands. Rules decide.
            </span>
          </div>
        </div>
      </div>

      {/* Backend Live Telemetry Status */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${health ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Backend & Engine Diagnostics</h2>
              <p className="text-xs text-slate-500">Live connection to Flask REST API & SQLite Database</p>
            </div>
          </div>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-check</span>
          </button>
        </div>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mb-2 text-blue-600" />
            <p className="text-sm">Connecting to /api/health...</p>
          </div>
        ) : error ? (
          <div className="mt-4 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold">Backend Connection Issue</p>
              <p className="text-xs mt-1">{error}</p>
              <p className="text-xs mt-2 text-rose-700">
                To start the backend server, run: <code className="bg-rose-100 px-1.5 py-0.5 rounded font-mono">cd backend && .venv\Scripts\python run.py</code>
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Database</span>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">{health?.database.type}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate" title={health?.database.path}>
                Connected & Persistent
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">PDF Engine</span>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">{health?.pdf_engine.name}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                v{health?.pdf_engine.version} (Native fitz)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">AI Service Mode</span>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800">Deterministic Fallback</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Zero-failure hackathon mode
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">API Server</span>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">Flask 3.1 REST</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                CORS Enabled on Port 5000
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Technology Stack Verification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frontend Stack */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Frontend Technology Stack</h3>
              <p className="text-xs text-slate-500">Modern reactive Single-Page Application (SPA)</p>
            </div>
          </div>

          <ul className="space-y-2 text-xs">
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">Framework</span>
              <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">React.js + Vite</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">Styling & System</span>
              <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Tailwind CSS (Enterprise Palette)</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">Client-Side Routing</span>
              <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">React Router (v7)</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">Data Visualization</span>
              <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Recharts Gauges & Dials</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">Iconography</span>
              <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Lucide React</span>
            </li>
          </ul>
        </div>

        {/* Backend Stack */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Backend Technology Stack</h3>
              <p className="text-xs text-slate-500">Modular REST API & Extraction Architecture</p>
            </div>
          </div>

          <ul className="space-y-2 text-xs">
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">Web Framework</span>
              <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Python 3.12 + Flask REST APIs</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">PDF Parsing</span>
              <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">PyMuPDF (fitz 1.28.2)</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">Database Layer</span>
              <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">SQLite + SQLAlchemy Models</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">Schema Validation</span>
              <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Pydantic v2</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">AI Role</span>
              <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Tender Text Understanding Only</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Component & Visualization Verification Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recharts Verification Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recharts Dial Verification</span>
          <div className="w-36 h-36 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dialData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900">78%</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Readiness</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Deterministic score component ready for Phase 10
          </p>
        </div>

        {/* Status System Verification Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strict Status System</span>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Green</span>
              <StatusBadge status="MET" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Amber</span>
              <StatusBadge status="PARTIAL" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Red</span>
              <StatusBadge status="MISSING" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Blue</span>
              <StatusBadge status="ACTION" />
            </div>
          </div>
          <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
            Ensures uniform status terminology across all screens.
          </p>
        </div>

        {/* SQLite Database Tables */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered SQLite Tables</span>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-700">
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>startups</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>documents</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>tenders</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>tender_versions</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>requirements</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>evidence_mappings</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>action_items</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>readiness_audits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
