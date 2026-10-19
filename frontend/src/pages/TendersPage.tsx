import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  Upload,
  Sparkles,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  Tag,
  ArrowRight,
  GitCompare,
  Layers,
  ChevronRight,
  Search,
  History,
  FileCheck2,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { api } from '../services/api';
import type {
  TenderMetadata,
  ExtractedRequirement,
  ExplainableMatchResult,
  EvidenceMappingItem,
  TenderChangesResult,
  DiscoveryTender
} from '../types';

type ActiveTab = 'discovery' | 'decoder' | 'match' | 'evidence' | 'corrigendum';


export const TendersPage: React.FC = () => {
  const [tenders, setTenders] = useState<TenderMetadata[]>([]);
  const [activeTender, setActiveTender] = useState<TenderMetadata | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('decoder');
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  
  // Data states for active tender
  const [requirements, setRequirements] = useState<ExtractedRequirement[]>([]);
  const [matchResult, setMatchResult] = useState<ExplainableMatchResult | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceMappingItem[]>([]);
  const [changesResult, setChangesResult] = useState<TenderChangesResult | null>(null);

  // Filters & search
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [tenderFile, setTenderFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch initial tender list
  const fetchTenders = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getTenders();
      setTenders(res.tenders || []);
      if (res.tenders && res.tenders.length > 0) {
        // default select first
        setActiveTender(res.tenders[0]);
      } else {
        setActiveTender(null);
      }
    } catch (err: any) {
      console.error('Failed to load tenders:', err);
      setErrorMsg(err.message || 'Unable to connect to tender registry.');
    } finally {
      setLoading(false);
    }
  };

  // Discovery State (10-20 Sample Tenders)
  const [discoveryTenders, setDiscoveryTenders] = useState<DiscoveryTender[]>([]);
  const [allSectors, setAllSectors] = useState<string[]>([]);
  const [discoverySector, setDiscoverySector] = useState<string>('ALL');
  const [discoverySearch, setDiscoverySearch] = useState<string>('');

  const fetchDiscoveryTenders = async () => {
    try {
      const res = await api.getDiscoveryTenders({
        sector: discoverySector === 'ALL' ? undefined : discoverySector,
        search: discoverySearch.trim() || undefined
      });
      setDiscoveryTenders(res.tenders || []);
      setAllSectors(res.all_sectors || []);
    } catch (err: any) {
      console.error('Failed to load discovery tenders:', err);
    }
  };

  useEffect(() => {
    fetchDiscoveryTenders();
  }, [discoverySector, discoverySearch]);

  const handleSelectDiscoveryTarget = (t: DiscoveryTender) => {
    const meta: TenderMetadata = {
      id: t.id,
      title: t.title,
      organization: t.organization,
      tender_id: t.tender_id,
      deadline: t.deadline,
      emd_amount: t.emd_amount,
      emd_exemption_allowed: t.emd_exemption_allowed,
      estimated_budget: t.estimated_budget,
      active_version: t.active_version,
      total_pages: t.total_pages
    };
    setActiveTender(meta);
    setActiveTab('decoder');
    setSuccessMsg(`Target tender switched to ${t.tender_id} (${t.title})`);
  };

  useEffect(() => {
    fetchTenders();
  }, []);


  // When active tender changes, load all its intelligence datasets
  useEffect(() => {
    if (!activeTender) return;

    const loadTenderIntelligence = async () => {
      try {
        setAnalyzing(true);
        const tenderId = activeTender.id || activeTender.tender_id;

        const [reqRes, matchRes, evRes, chRes] = await Promise.all([
          api.getRequirements(tenderId),
          api.getMatch(tenderId),
          api.getEvidence(tenderId),
          api.getChanges(tenderId)
        ]);

        setRequirements(reqRes.requirements || []);
        setMatchResult(matchRes);
        setEvidenceList(evRes.evidence_mappings || []);
        setChangesResult(chRes);
      } catch (err: any) {
        console.error('Failed to load tender intelligence:', err);
      } finally {
        setAnalyzing(false);
      }
    };

    loadTenderIntelligence();
  }, [activeTender]);

  const handleLoadSampleTender = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.loadSampleTender();
      setSuccessMsg(res.message || 'Sample tender GEM/2026/B/89210 loaded successfully!');
      await fetchTenders();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load sample tender.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenderFile) {
      setErrorMsg('Please select a tender PDF file to upload.');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg(null);
      const formData = new FormData();
      formData.append('file', tenderFile);

      const res = await api.uploadTender(formData);
      setSuccessMsg(res.message || 'Tender PDF parsed and indexed successfully!');
      setTenderFile(null);
      setShowUploadModal(false);
      await fetchTenders();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process tender PDF.');
    } finally {
      setUploading(false);
    }
  };

  // Filtered requirements
  const filteredRequirements = requirements.filter(req => {
    const matchesCat = categoryFilter === 'ALL' || req.category.toUpperCase() === categoryFilter.toUpperCase();
    const matchesSearch = searchQuery === '' || 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.clause_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.plain_language.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tender Intelligence Workspace"
        description="Ingest procurement tenders, decode complex legal requirements into plain language, evaluate fit, and map compliance evidence."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tenders' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchTenders}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Sparkles}
              onClick={handleLoadSampleTender}
            >
              Load Sample Tender (GeM)
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={() => setShowUploadModal(true)}
            >
              Upload Tender PDF
            </Button>
          </div>
        }
      />

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 text-xs font-bold">DISMISS</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMsg}</div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 text-xs font-bold">DISMISS</button>
        </div>
      )}

      {/* Tender Switcher */}
      {tenders.length > 1 && (
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Tender:</span>
          <select
            value={activeTender?.id || activeTender?.tender_id || ''}
            onChange={(e) => {
              const selected = tenders.find(t => (t.id || t.tender_id) === e.target.value);
              if (selected) setActiveTender(selected);
            }}
            aria-label="Select active tender from list"
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

      {/* Active Tender Header Banner */}
      {activeTender ? (
        <Card className="border-blue-200/80 bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-md">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 font-mono">
                    {activeTender.tender_id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> GeM Verified
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <History className="w-3 h-3" /> Version {activeTender.active_version}.0 (Corrigendum Issued)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {activeTender.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-blue-200/90 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-blue-400" />
                    {activeTender.organization}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Deadline: <strong>{activeTender.deadline}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-blue-400" />
                    Estimated Budget: <strong>₹{activeTender.estimated_budget?.toLocaleString()} Lakhs</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Pages: <strong>{activeTender.total_pages}</strong>
                  </span>
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                <Link to="/eligibility">
                  <Button variant="secondary" size="sm" className="w-full justify-between" icon={ChevronRight}>
                    Eligibility Matrix
                  </Button>
                </Link>
                <Link to="/checklist">
                  <Button variant="outline" size="sm" className="w-full justify-between text-white border-white/30 hover:bg-white/10" icon={ArrowRight}>
                    Action Plan
                  </Button>
                </Link>
                <Link to="/readiness">
                  <Button variant="outline" size="sm" className="w-full justify-between text-emerald-200 border-emerald-400/30 hover:bg-emerald-950/40" icon={FileCheck2}>
                    Bid Readiness
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="text-center p-12">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <FileSearch className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Tender Selected</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Upload your government tender PDF to begin automated clause extraction, or load the benchmark GeM Smart City sample tender.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="primary" icon={Sparkles} onClick={handleLoadSampleTender}>
              Load GeM Sample Tender
            </Button>
            <Button variant="outline" icon={Upload} onClick={() => setShowUploadModal(true)}>
              Upload Custom Tender PDF
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs Navigation */}
      {activeTender && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab('discovery')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'discovery'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Compass className="w-4 h-4" />
              Tender Discovery (12+ RFPs)
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 font-bold">
                {discoveryTenders.length || 12}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('decoder')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'decoder'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <FileSearch className="w-4 h-4" />
              Tender Decoder
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 font-bold">
                {requirements.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('match')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'match'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Explainable Match
              {matchResult && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                  {matchResult.score}%
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'evidence'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              Evidence Mapping
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
                {evidenceList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('corrigendum')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'corrigendum'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              Change Detector (Corrigendum)
              {changesResult && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                  {changesResult.total_changes} Changes
                </span>
              )}
            </button>
          </div>

          {/* TAB 0: TENDER DISCOVERY */}
          {activeTab === 'discovery' && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <CardTitle>Government Tender Discovery Catalog</CardTitle>
                    <CardDescription>
                      Algorithmic capability matching across 12+ public tenders from GeM, Indian Railways, Smart Cities, and Central Ministries.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search by RFP title, keyword, tech..."
                        value={discoverySearch}
                        onChange={(e) => setDiscoverySearch(e.target.value)}
                        className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-52 sm:w-64"
                      />
                    </div>
                    <select
                      value={discoverySector}
                      onChange={(e) => setDiscoverySector(e.target.value)}
                      aria-label="Filter discovery tenders by sector"
                      className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ALL">All Sectors ({discoveryTenders.length})</option>
                      {allSectors.map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {discoveryTenders.map((t) => (
                      <div
                        key={t.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                          activeTender.tender_id === t.tender_id
                            ? 'bg-blue-50/40 border-blue-400 shadow-sm ring-1 ring-blue-300'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {t.tender_id}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              t.match_score >= 85 ? 'bg-emerald-100 text-emerald-800' :
                              t.match_score >= 75 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {t.match_score}% Match
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                            {t.title}
                          </h4>

                          <p className="text-xs text-slate-500 line-clamp-1">
                            {t.organization}
                          </p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {t.key_technologies.slice(0, 3).map((tech, i) => (
                              <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block">Est. Budget</span>
                              <strong className="text-slate-800">₹ {(t.estimated_budget / 100000).toFixed(1)} Lakhs</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Deadline</span>
                              <strong className="text-slate-800">{t.deadline}</strong>
                            </div>
                          </div>

                          <Button
                            variant={activeTender.tender_id === t.tender_id ? "secondary" : "outline"}
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => handleSelectDiscoveryTarget(t)}
                          >
                            {activeTender.tender_id === t.tender_id ? "✓ Currently Active Target" : "Select as Target Tender"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}


          {/* TAB 1: TENDER DECODER */}
          {activeTab === 'decoder' && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <CardTitle>Decoded Tender Requirements</CardTitle>
                    <CardDescription>
                      "AI understands. Rules decide." PyMuPDF extracted clauses translated into plain business language with exact citations.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search clause or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 sm:w-60"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      aria-label="Filter requirements by category"
                      className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="ELIGIBILITY">Eligibility</option>
                      <option value="EXPERIENCE">Experience</option>
                      <option value="FINANCIAL">Financial</option>
                      <option value="TECHNICAL">Technical</option>
                      <option value="CERTIFICATION">Certification</option>
                      <option value="DOCUMENTS">Documents</option>
                    </select>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {analyzing ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <p className="text-sm font-medium">Extracting and structuring requirements...</p>
                    </div>
                  ) : filteredRequirements.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                      No matching requirements found.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {filteredRequirements.map((req) => (
                        <div key={req.id} className="p-6 hover:bg-slate-50/60 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wide">
                                  {req.category}
                                </span>
                                <span className="text-[11px] font-medium text-slate-500 font-mono">
                                  {req.source_section} • Page {req.source_page}
                                </span>
                                {req.is_mandatory && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                                    MANDATORY
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base font-bold text-slate-900 pt-1">
                                {req.title}
                              </h4>
                            </div>

                            <div className="shrink-0">
                              <StatusBadge status={req.status} size="sm" />
                            </div>
                          </div>

                          {/* Side-by-side: Official Legal Clause vs Plain English */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100">
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                Official Legal Tender Clause
                              </div>
                              <p className="text-xs text-slate-700 font-mono leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                                "{req.clause_text}"
                              </p>
                            </div>

                            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/80">
                              <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                Plain-Language Explanation (Founder Translation)
                              </div>
                              <p className="text-xs text-blue-950 font-medium leading-relaxed bg-white p-2.5 rounded border border-blue-100">
                                {req.plain_language}
                              </p>
                              {req.potential_relaxation_rule && (
                                <div className="mt-2.5 p-2 bg-emerald-50 rounded border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Startup Relaxation:</strong> {req.potential_relaxation_rule}
                                  </span>
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
          )}

          {/* TAB 2: EXPLAINABLE MATCH */}
          {activeTab === 'match' && matchResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
                  <CardContent className="pt-6 text-center">
                    <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                      Explainable Match Score
                    </span>
                    <div className="text-5xl font-black text-white mt-2 mb-1">
                      {matchResult.score}%
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
                      {matchResult.tier}
                    </div>
                    <p className="text-xs text-blue-200 mt-4 leading-relaxed text-left bg-blue-950/40 p-3 rounded-xl border border-blue-800">
                      {matchResult.summary}
                    </p>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Match Assessment Summary</CardTitle>
                    <CardDescription>
                      Algorithmic comparison between your Startup Profile and tender criteria.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="text-xl font-bold text-emerald-800">{matchResult.matched.length}</div>
                        <div className="text-xs text-emerald-700 font-semibold mt-0.5">Fully Satisfied</div>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="text-xl font-bold text-amber-800">{matchResult.partial.length}</div>
                        <div className="text-xs text-amber-700 font-semibold mt-0.5">Partially Met</div>
                      </div>
                      <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                        <div className="text-xl font-bold text-rose-800">{matchResult.missing.length}</div>
                        <div className="text-xs text-rose-700 font-semibold mt-0.5">Missing Gaps</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="text-xl font-bold text-blue-800">{matchResult.needs_verification.length}</div>
                        <div className="text-xs text-blue-700 font-semibold mt-0.5">Verify Needed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Match Criteria Details */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Satisfied Requirements ({matchResult.matched.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-slate-100">
                    {matchResult.matched.map((item, i) => (
                      <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-500 uppercase">{item.category}</div>
                          <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                        </div>
                        <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 max-w-md font-medium">
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-amber-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      Partially Met Criteria ({matchResult.partial.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-slate-100">
                    {matchResult.partial.map((item, i) => (
                      <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-500 uppercase">{item.category}</div>
                          <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                        </div>
                        <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 max-w-md font-medium">
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-rose-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      Critical Missing Gaps ({matchResult.missing.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-slate-100">
                    {matchResult.missing.map((item, i) => (
                      <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-500 uppercase">{item.category}</div>
                          <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                        </div>
                        <div className="text-xs text-rose-800 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 max-w-md font-medium">
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE MAPPING */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Requirement $\to$ Evidence Mapping Matrix</CardTitle>
                  <CardDescription>
                    Every tender clause mapped to candidate proof snippets from your uploaded Document Vault.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-6">Requirement ID</th>
                          <th className="py-3 px-6">Candidate Document</th>
                          <th className="py-3 px-6">Extracted Proof Excerpt</th>
                          <th className="py-3 px-6">Confidence</th>
                          <th className="py-3 px-6">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {evidenceList.map((ev, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-4 px-6 font-mono font-bold text-xs text-blue-700">
                              {ev.requirement_id}
                            </td>
                            <td className="py-4 px-6 font-medium text-slate-800">
                              {ev.document_name ? (
                                <div>
                                  <div className="font-semibold">{ev.document_name}</div>
                                  <div className="text-[11px] text-slate-400">Page {ev.page_number}</div>
                                </div>
                              ) : (
                                <span className="text-xs text-rose-600 font-semibold italic">No document mapped</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-600 max-w-md">
                              <div className="p-2 bg-slate-50 rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                                "{ev.evidence_text}"
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                ev.confidence === 'HIGH' ? 'bg-emerald-100 text-emerald-800' :
                                ev.confidence === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {ev.confidence}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <StatusBadge status={ev.status} size="sm" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 4: CORRIGENDUM / TENDER CHANGE DETECTOR */}
          {activeTab === 'corrigendum' && changesResult && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Corrigendum Notice Detected</h4>
                  <p className="text-xs text-amber-800 mt-1">
                    {changesResult.summary}
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Corrigendum Change Comparison (v{changesResult.active_version}.0 vs v{changesResult.previous_version}.0)</CardTitle>
                  <CardDescription>
                    Automated clause diffing to ensure your proposal complies with the latest modifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-6">Clause / Field</th>
                          <th className="py-3 px-6">Original Clause (v1.0)</th>
                          <th className="py-3 px-6">Corrigendum Clause (v2.0)</th>
                          <th className="py-3 px-6">Risk Impact</th>
                          <th className="py-3 px-6">Founder Advisory</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {changesResult.changes.map((ch, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-4 px-6 font-semibold text-slate-800">
                              {ch.field}
                            </td>
                            <td className="py-4 px-6 text-xs text-rose-800 bg-rose-50/30 max-w-xs font-mono">
                              {ch.old_value}
                            </td>
                            <td className="py-4 px-6 text-xs text-emerald-800 bg-emerald-50/30 max-w-xs font-mono font-semibold">
                              {ch.new_value}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                ch.impact === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                                ch.impact === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {ch.impact} IMPACT
                              </span>
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-600">
                              {ch.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Upload Tender Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload Government Tender PDF
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadTender} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tender RFP/Bid PDF File *
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    id="tenderFileInput"
                    accept=".pdf"
                    onChange={(e) => e.target.files && setTenderFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="tenderFileInput" className="cursor-pointer block">
                    <FileSearch className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <span className="text-sm font-semibold text-blue-700 hover:underline">
                      {tenderFile ? tenderFile.name : 'Choose Tender PDF'}
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">
                      {tenderFile ? `${(tenderFile.size / 1024).toFixed(1)} KB selected` : 'Extracts clauses using PyMuPDF engine'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={uploading}
                  disabled={!tenderFile || uploading}
                  icon={Upload}
                >
                  {uploading ? 'Parsing PDF Pages...' : 'Upload & Parse Tender'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
