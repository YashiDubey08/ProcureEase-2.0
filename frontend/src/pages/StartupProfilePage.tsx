import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Files, 
  ArrowRight, 
  Plus, 
  X, 
  RefreshCw,
  Compass
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { api } from '../services/api';
import type { StartupProfile, ProfileCompletion } from '../types';

export const StartupProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  const [profile, setProfile] = useState<Partial<StartupProfile>>({
    name: '',
    founder_name: '',
    email: '',
    phone: '',
    sector: '',
    product_description: '',
    company_stage: '',
    dpiit_status: false,
    dpiit_number: '',
    msme_status: false,
    msme_number: '',
    gst_status: '',
    gstin: '',
    years_experience: 0,
    team_size: 0,
    annual_turnover_lakhs: 0,
    capabilities: [],
    products_services: [],
    past_projects: [],
    certifications: []
  });

  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [buildingRoadmap, setBuildingRoadmap] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [docCount, setDocCount] = useState(0);

  // New tag inputs
  const [newCapability, setNewCapability] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newCert, setNewCert] = useState('');

  const fetchProfileAndDocs = async () => {
    setLoading(true);
    try {
      const [profRes, docRes] = await Promise.all([
        api.getProfile(),
        api.getDocuments().catch(() => ({ total_count: 0 }))
      ]);

      if (profRes.exists && profRes.profile) {
        setProfile(profRes.profile);
        setCompletion(profRes.completion);
      } else {
        setCompletion(profRes.completion);
      }
      setDocCount(docRes.total_count || 0);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndDocs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name?.trim()) {
      setMessage({ type: 'error', text: 'Startup/Company Name is required.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await api.saveProfile(profile);
      setProfile(res.profile);
      setCompletion(res.completion);

      if (isOnboarding) {
        setBuildingRoadmap(true);
        setMessage({
          type: 'success',
          text: 'Building your personalized procurement roadmap...'
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setMessage({ type: 'success', text: 'Profile saved successfully and synchronized with SQLite.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  const addTag = (
    field: 'capabilities' | 'products_services' | 'past_projects' | 'certifications',
    value: string,
    setter: (v: string) => void
  ) => {
    if (!value.trim()) return;
    const current = profile[field] || [];
    if (!current.includes(value.trim())) {
      setProfile({ ...profile, [field]: [...current, value.trim()] });
    }
    setter('');
  };

  const removeTag = (
    field: 'capabilities' | 'products_services' | 'past_projects' | 'certifications',
    item: string
  ) => {
    const current = profile[field] || [];
    setProfile({ ...profile, [field]: current.filter((t) => t !== item) });
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mb-2" />
        <p className="text-sm">Loading startup profile...</p>
      </div>
    );
  }

  const completionPct = completion?.percentage || 0;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Startup Profile"
        description="Maintain your corporate identity, DPIIT/MSME recognitions, capabilities, and past performance for tender matching."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/80">
            <Building2 className="w-3.5 h-3.5" />
            <span>Profile & Capabilities</span>
          </span>
        }
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            loading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile
          </Button>
        }
      />

      {/* Onboarding Welcome Card */}
      {isOnboarding && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-lg space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
              New Startup Onboarding
            </span>
            <span className="text-xs text-blue-200">
              Step 1 of 2: Profile Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Your startup profile is ready.
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
            Verify or update your business sector, technology capabilities, DPIIT status, and certifications below. Once saved, ProcureEase will construct your personalized 12-stage procurement roadmap!
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              icon={buildingRoadmap ? RefreshCw : Compass}
              loading={saving || buildingRoadmap}
              onClick={handleSave}
              className="bg-white text-blue-900 hover:bg-blue-50 border-none font-bold shadow-md"
            >
              {buildingRoadmap ? 'Building your personalized procurement roadmap...' : 'Save & Build Procurement Roadmap'}
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                Skip to Roadmap
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Notifications */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs font-semibold hover:opacity-75">
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Completion & Document Vault Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion Indicator */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Profile Completeness
                </span>
                <StatusBadge
                  status={completionPct >= 80 ? 'Ready' : completionPct >= 50 ? 'Partial' : 'Missing'}
                  size="sm"
                />
              </div>
              <span className="text-2xl font-black text-slate-900">{completionPct}%</span>
            </div>
            <ProgressBar value={completionPct} variant="auto" showPercentage={false} size="md" />

            <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                <span className="font-extrabold text-base block">{completion?.completed_count || 0}</span>
                <span className="text-[11px] font-medium">Completed</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-100">
                <span className="font-extrabold text-base block">{completion?.partial_count || 0}</span>
                <span className="text-[11px] font-medium">Partial</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-100">
                <span className="font-extrabold text-base block">{completion?.missing_count || 0}</span>
                <span className="text-[11px] font-medium">Missing</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 border-t border-slate-100 pt-3">
            Completeness is computed dynamically from your profile fields to ensure maximum qualification confidence.
          </p>
        </Card>

        {/* Document Vault Connection Card */}
        <Card className="p-6 flex flex-col justify-between bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border-blue-200/80">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Document Vault
              </span>
              <div className="p-2 rounded-xl bg-blue-100/70 text-blue-700">
                <Files className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {docCount} Document{docCount !== 1 ? 's' : ''} Uploaded
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Supporting certificates, past project proofs, and product datasheets available for requirement evidence mapping.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-blue-200/60">
            <Link to="/documents">
              <Button variant="primary" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Manage Documents
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>1. Basic Company Information</CardTitle>
            <CardDescription>Legal enterprise entity name, contact founder, and domain of operation.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Startup / Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="e.g. SmartSense Technologies Pvt Ltd"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Founder / Managing Director Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.founder_name || ''}
                onChange={(e) => setProfile({ ...profile, founder_name: e.target.value })}
                placeholder="e.g. Arjun Sharma"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="e.g. founder@smartsensetech.in"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone / Mobile Number
              </label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Business Sector <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.sector || ''}
                onChange={(e) => setProfile({ ...profile, sector: e.target.value })}
                placeholder="e.g. IoT & Smart Infrastructure"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product / Service Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={profile.product_description || ''}
                onChange={(e) => setProfile({ ...profile, product_description: e.target.value })}
                placeholder="Describe your primary hardware/software offering, target market, and technical architecture."
                className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Business Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>2. Business & Statutory Registrations</CardTitle>
            <CardDescription>Official government recognitions, startup stage, experience, and turnover.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Startup Stage
              </label>
              <select
                value={profile.company_stage || ''}
                onChange={(e) => setProfile({ ...profile, company_stage: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select Startup Stage...</option>
                <option value="Ideation">Ideation</option>
                <option value="Early Stage">Early Stage</option>
                <option value="Seed Funded">Seed Funded</option>
                <option value="Growth Stage">Growth Stage</option>
                <option value="Scaled Enterprise">Scaled Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Years of Operating Experience
              </label>
              <input
                type="number"
                min="0"
                value={profile.years_experience !== undefined && profile.years_experience !== null ? profile.years_experience : ''}
                onChange={(e) => setProfile({ ...profile, years_experience: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                placeholder="e.g. 2"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Team Size (FTEs)
              </label>
              <input
                type="number"
                min="0"
                value={profile.team_size !== undefined && profile.team_size !== null ? profile.team_size : ''}
                onChange={(e) => setProfile({ ...profile, team_size: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                placeholder="e.g. 5"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Turnover (in ₹ Lakhs)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={profile.annual_turnover_lakhs || 0}
                onChange={(e) => setProfile({ ...profile, annual_turnover_lakhs: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 42.5"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* DPIIT Recognition Toggle */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">DPIIT Recognized Startup</span>
                  <p className="text-[11px] text-slate-500">Unlocks EMD waiver & prior experience relaxations</p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.dpiit_status || false}
                  onChange={(e) => setProfile({ ...profile, dpiit_status: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
              {profile.dpiit_status && (
                <input
                  type="text"
                  value={profile.dpiit_number || ''}
                  onChange={(e) => setProfile({ ...profile, dpiit_number: e.target.value })}
                  placeholder="DPIIT Certificate No. (e.g. DIPP98214)"
                  className="mt-2 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
              )}
            </div>

            {/* MSME Udyam Toggle */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">MSME Udyam Registered</span>
                  <p className="text-[11px] text-slate-500">Qualifies for public procurement policy benefits</p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.msme_status || false}
                  onChange={(e) => setProfile({ ...profile, msme_status: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
              {profile.msme_status && (
                <input
                  type="text"
                  value={profile.msme_number || ''}
                  onChange={(e) => setProfile({ ...profile, msme_number: e.target.value })}
                  placeholder="Udyam Number (e.g. UDYAM-MH-02-0098412)"
                  className="mt-2 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
              )}
            </div>

            {/* GST Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GST Registration Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={profile.gst_status || ''}
                onChange={(e) => setProfile({ ...profile, gst_status: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select GST Status...</option>
                <option value="Registered">Registered (Active)</option>
                <option value="In Process">Registration In Process</option>
                <option value="Exempt">Exempt / Not Applicable</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                value={profile.gstin || ''}
                onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                placeholder="e.g. 27AABCS1429B1Z4"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Capability Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>3. Technical Capabilities & Track Record</CardTitle>
            <CardDescription>Tag your verified competencies, flagship products, past deployments, and certifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Technical Capabilities Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technical Capabilities
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCapability}
                  onChange={(e) => setNewCapability(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('capabilities', newCapability, setNewCapability); } }}
                  placeholder="e.g. LoRaWAN Networking, Edge Computing"
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addTag('capabilities', newCapability, setNewCapability)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(profile.capabilities || []).map((cap) => (
                  <span
                    key={cap}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium"
                  >
                    <span>{cap}</span>
                    <button type="button" onClick={() => removeTag('capabilities', cap)} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Products & Services */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Flagship Products / Services
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('products_services', newProduct, setNewProduct); } }}
                  placeholder="e.g. SmartSense UrbanEdge Node"
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addTag('products_services', newProduct, setNewProduct)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(profile.products_services || []).map((prod) => (
                  <span
                    key={prod}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-medium"
                  >
                    <span>{prod}</span>
                    <button type="button" onClick={() => removeTag('products_services', prod)} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Past Projects */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Past Completed Projects / Client Proofs
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('past_projects', newProject, setNewProject); } }}
                  placeholder="e.g. Pune Smart City Water Pilot (₹18L, 2024)"
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addTag('past_projects', newProject, setNewProject)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-1.5">
                {(profile.past_projects || []).map((proj) => (
                  <div
                    key={proj}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                  >
                    <span className="truncate">{proj}</span>
                    <button type="button" onClick={() => removeTag('past_projects', proj)} className="text-slate-400 hover:text-rose-600 ml-2">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Active Certifications & Standards
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('certifications', newCert, setNewCert); } }}
                  placeholder="e.g. ISO 9001:2015, CE Certification"
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addTag('certifications', newCert, setNewCert)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(profile.certifications || []).map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium"
                  >
                    <span>{cert}</span>
                    <button type="button" onClick={() => removeTag('certifications', cert)} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save & Update Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
