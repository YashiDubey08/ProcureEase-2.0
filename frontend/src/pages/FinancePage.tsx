import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Info
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { api } from '../services/api';
import type { FinancialScheme } from '../types';

export const FinancePage: React.FC = () => {
  const [schemes, setSchemes] = useState<FinancialScheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [disclaimer, setDisclaimer] = useState<string>('');

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const res = await api.getFinanceSchemes();
      setSchemes(res.schemes || []);
      setDisclaimer(res.disclaimer || 'ProcureEase provides decision-support information on government financial schemes.');
    } catch (err: any) {
      console.error('Failed to load financial schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const filteredSchemes = filterType === 'ALL'
    ? schemes
    : schemes.filter(s => s.type.toLowerCase().includes(filterType.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Funding & Financial Support"
        description="Government financial assistance, working capital facilities, and invoice discounting programs for public procurement contractors."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Financial Support' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchSchemes}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Explanatory Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                Government Procurement Financing
              </span>
              <span className="text-xs text-white/80">Special Concessions for DPIIT Startups</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Bridge Working Capital Gaps Between Bid Award & Public Invoicing
            </h3>
            <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
              Startups often decline large tenders because of upfront component costs or 45-day payment cycles. Leverage <strong>CGTMSE collateral-free guarantees</strong>, <strong>SIDBI procurement advances</strong>, and <strong>TReDS bill discounting</strong> to execute contracts smoothly.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'Grant', 'Credit Guarantee', 'Working Capital', 'Bill Discounting', 'Bank Guarantee'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL' ? 'All Schemes (6)' : tab}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading financial schemes...</p>
          </div>
        ) : (
          filteredSchemes.map((sch) => (
            <Card key={sch.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                      {sch.type}
                    </span>
                    <CardTitle className="mt-2 text-base font-bold text-slate-900">
                      {sch.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 font-medium">
                      {sch.agency}
                    </CardDescription>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Max Facility</span>
                    <span className="text-base font-black text-emerald-700">{sch.max_support}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 py-4 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Eligibility Criteria:</span>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {sch.eligibility_summary}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Key Contractor Benefits:</span>
                  <p className="text-slate-600 leading-relaxed bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 text-emerald-950 font-medium">
                    {sch.benefits}
                  </p>
                </div>
              </CardContent>

              <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Startup Eligible
                </span>
                <a
                  href={sch.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Open Official Scheme Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Advisory Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center gap-3">
        <Info className="w-5 h-5 text-slate-400 shrink-0" />
        <p className="leading-relaxed">
          <strong>Official Financial Advisory:</strong> {disclaimer}
        </p>
      </div>
    </div>
  );
};
