import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Save, 
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { StartupProfile, ProfileCompletion } from '../types';

const DOMAINS = [
  'Technology',
  'Healthcare',
  'Education',
  'Food and Agriculture',
  'Manufacturing',
  'E-commerce',
  'Other'
];

const STRUCTURES = [
  'Private Limited Company',
  'Limited Liability Partnership (LLP)',
  'One Person Company (OPC)',
  'Sole Proprietorship',
  'Partnership Firm',
  'Not Yet Registered / Ideation'
];

const STAGES = [
  'Ideation',
  'Early Stage',
  'Seed',
  'Growth',
  'Scaled'
];

const STATES = [
  'Maharashtra',
  'Karnataka',
  'Delhi (NCR)',
  'Tamil Nadu',
  'Gujarat',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
  'Kerala',
  'Andhra Pradesh',
  'Rajasthan',
  'Haryana',
  'Punjab',
  'Madhya Pradesh',
  'Other State / UT'
];

export const StartupProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';
  const { user, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profile, setProfile] = useState<Partial<StartupProfile>>({
    name: user?.company_name || '',
    founder_name: user?.name || '',
    email: user?.email || '',
    phone: '',
    business_domain: 'Technology',
    state_location: 'Maharashtra',
    business_structure: 'Private Limited Company',
    company_stage: 'Early Stage',
    has_employees: false,
    has_physical_premises: false,
    is_interstate_or_ecommerce: false,
    creates_ip: true,
    product_description: '',
    dpiit_status: false,
    dpiit_number: '',
    msme_status: false,
    msme_number: '',
    gst_status: '',
    gstin: ''
  });

  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setNotification(null);
      const res = await api.getProfile();
      if (res.exists && res.profile) {
        setProfile({
          ...res.profile,
          business_domain: res.profile.business_domain || res.profile.sector || 'Technology',
          business_structure: res.profile.business_structure || 'Private Limited Company',
          state_location: res.profile.state_location || 'Maharashtra',
          company_stage: res.profile.company_stage || 'Early Stage'
        });
      }
      setCompletion(res.completion);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setNotification({ type: 'error', text: err.message || 'Unable to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name?.trim()) {
      setNotification({ type: 'error', text: 'Startup / Company Name is required.' });
      return;
    }

    try {
      setSaving(true);
      setNotification(null);

      const res = await api.saveProfile(profile);
      setProfile(res.profile);
      setCompletion(res.completion);
      await refreshProfile();

      setNotification({
        type: 'success',
        text: 'Profile saved. Your roadmap has been updated.'
      });

      if (isOnboarding) {
        setTimeout(() => {
          navigate('/roadmap');
        }, 800);
      }
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setNotification({ type: 'error', text: err.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  const boolValue = (val: any) => val === true || val === 1 || val === 'true';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
          <p className="text-xs text-slate-500">Loading startup profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Startup Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Information used to determine your personalized documentation roadmap.
            </p>
          </div>
          {completion && (
            <div className="text-left sm:text-right shrink-0">
              <span className="text-xs text-slate-500 block">Completeness</span>
              <span className="text-base font-semibold text-slate-900">{completion.percentage}%</span>
            </div>
          )}
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

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 space-y-6 shadow-2xs text-xs">
        {/* Basic Business Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
            1. Business Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Startup / Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Innovations Pvt Ltd"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Business Domain <span className="text-rose-500">*</span>
              </label>
              <select
                value={profile.business_domain || 'Technology'}
                onChange={(e) => setProfile({ ...profile, business_domain: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-blue-500"
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Primary State of Operation <span className="text-rose-500">*</span>
              </label>
              <select
                value={profile.state_location || 'Maharashtra'}
                onChange={(e) => setProfile({ ...profile, state_location: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-blue-500"
              >
                {STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Business Structure <span className="text-rose-500">*</span>
              </label>
              <select
                value={profile.business_structure || 'Private Limited Company'}
                onChange={(e) => setProfile({ ...profile, business_structure: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-blue-500"
              >
                {STRUCTURES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Current Business Stage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setProfile({ ...profile, company_stage: stage })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors border ${
                    profile.company_stage === stage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Factors */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-0.5">
              2. Operational Compliance Factors
            </h2>
            <p className="text-xs text-slate-500">
              Check all that apply to add only applicable statutory requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-start gap-2.5 transition-colors">
              <input
                type="checkbox"
                checked={boolValue(profile.has_employees)}
                onChange={(e) => setProfile({ ...profile, has_employees: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="min-w-0">
                <span className="font-medium text-slate-900 block">Has employees or hiring staff</span>
                <span className="text-[11px] text-slate-500 block">Includes EPFO & ESIC labor registrations</span>
              </div>
            </label>

            <label className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-start gap-2.5 transition-colors">
              <input
                type="checkbox"
                checked={boolValue(profile.has_physical_premises)}
                onChange={(e) => setProfile({ ...profile, has_physical_premises: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="min-w-0">
                <span className="font-medium text-slate-900 block">Physical office / commercial premises</span>
                <span className="text-[11px] text-slate-500 block">Includes State Shop & Establishment Act</span>
              </div>
            </label>

            <label className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-start gap-2.5 transition-colors">
              <input
                type="checkbox"
                checked={boolValue(profile.is_interstate_or_ecommerce)}
                onChange={(e) => setProfile({ ...profile, is_interstate_or_ecommerce: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="min-w-0">
                <span className="font-medium text-slate-900 block">Selling online or inter-state</span>
                <span className="text-[11px] text-slate-500 block">Includes mandatory GST registration</span>
              </div>
            </label>

            <label className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-start gap-2.5 transition-colors">
              <input
                type="checkbox"
                checked={boolValue(profile.creates_ip)}
                onChange={(e) => setProfile({ ...profile, creates_ip: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="min-w-0">
                <span className="font-medium text-slate-900 block">Brand name, logo, or proprietary tech</span>
                <span className="text-[11px] text-slate-500 block">Includes Trademark (TM-A) & Patent filing</span>
              </div>
            </label>
          </div>
        </div>

        {/* Existing Registrations (Optional) */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-0.5">
              3. Existing Registrations (Optional)
            </h2>
            <p className="text-xs text-slate-500">
              If already acquired, record your registration numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                GSTIN
              </label>
              <input
                type="text"
                placeholder="15-digit GSTIN"
                value={profile.gstin || ''}
                onChange={(e) => setProfile({ ...profile, gstin: e.target.value.toUpperCase() })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Udyam MSME Number
              </label>
              <input
                type="text"
                placeholder="UDYAM-XX-00-0000000"
                value={profile.msme_number || ''}
                onChange={(e) => setProfile({ ...profile, msme_number: e.target.value.toUpperCase() })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Roadmap automatically adapts when saved.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-2xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : isOnboarding ? 'Continue to Roadmap' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
