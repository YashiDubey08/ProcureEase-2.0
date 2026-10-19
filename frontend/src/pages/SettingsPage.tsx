import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { api } from '../services/api';
import type { BackendHealthResponse } from '../types';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & System Diagnostics"
        description="Application configurations, engine telemetry, and procurement policy rule parameters."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend & Engine Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Engine Telemetry</CardTitle>
              <CardDescription>Flask REST & Native PyMuPDF state</CardDescription>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">Project</span>
              <span className="font-bold text-slate-900">{health?.project || 'ProcureEase 2.0'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">Database Engine</span>
              <div className="flex items-center gap-1.5">
                <StatusBadge status="Ready" size="sm" />
                <span className="font-mono text-slate-800">{health?.database.type || 'SQLite'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">PDF Extraction</span>
              <span className="font-mono text-slate-800">
                {health?.pdf_engine.name} v{health?.pdf_engine.version}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="font-semibold text-slate-700">AI Service Mode</span>
              <span className="font-mono text-blue-700 font-semibold">
                {health?.ai_engine.mode || 'Deterministic Fallback'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Rule Engine Parameters Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Procurement Rule Configurator</CardTitle>
            <CardDescription>Configurable policy relaxation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">DPIIT Prior Experience Relaxation</span>
                <StatusBadge status="ACTIVE" size="sm" />
              </div>
              <p className="text-[11px] text-slate-500">
                Allows recognized startups exemption from prior turnover/experience subject to meeting quality & technical specs.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">MSME EMD Exemption</span>
                <StatusBadge status="ACTIVE" size="sm" />
              </div>
              <p className="text-[11px] text-slate-500">
                Grants exemption from Earnest Money Deposit submission for registered Udyam MSME enterprises.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
