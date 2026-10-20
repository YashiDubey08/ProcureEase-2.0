import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { StartupJourneyAnimation } from '../components/common/StartupJourneyAnimation';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginDemo } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoClick = async () => {
    try {
      setDemoLoading(true);
      await loginDemo();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to launch demo:', err);
      navigate('/dashboard');
    } finally {
      setDemoLoading(false);
    }
  };

  const steps = [
    {
      num: '1',
      title: 'Tell us about your startup',
      desc: 'Choose your domain and share a few details.'
    },
    {
      num: '2',
      title: 'Get your roadmap',
      desc: 'See the registrations and documents relevant to you.'
    },
    {
      num: '3',
      title: 'Follow each step',
      desc: 'Visit official websites and track your progress.'
    }
  ];

  const domains = [
    'Technology',
    'Healthcare',
    'Food and Agriculture',
    'Education',
    'Manufacturing',
    'E-commerce'
  ];

  const portals = [
    { name: 'Ministry of Corporate Affairs', domain: 'mca.gov.in' },
    { name: 'GST Common Portal', domain: 'gst.gov.in' },
    { name: 'Startup India', domain: 'startupindia.gov.in' },
    { name: 'MSME Udyam', domain: 'udyamregistration.gov.in' },
    { name: 'Food Safety (FoSCoS)', domain: 'foscos.fssai.gov.in' },
    { name: 'CDSCO Medical Devices', domain: 'cdsco.gov.in' },
    { name: 'IP India (Patents & Trademarks)', domain: 'ipindia.gov.in' },
    { name: 'Shram Suvidha (EPFO/ESIC)', domain: 'shramsuvidha.gov.in' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-200/80 bg-white/95 sticky top-0 z-40 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-base">ProcureEase</span>
          </Link>

          <nav className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleDemoClick}
                  disabled={demoLoading}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors"
                >
                  {demoLoading ? 'Starting Demo...' : '1-Click Demo'}
                </button>
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-2xs"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Startup Documentation & Registration
              </span>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                Start your business. <br className="hidden sm:inline" />
                Know your next step.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Get a personalized roadmap for your startup's registrations and documents, with direct links to official websites.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-xs"
                >
                  <span>Build My Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
                >
                  How It Works
                </a>
              </div>
            </div>

            {/* Right: Startup Journey in Motion */}
            <div className="lg:col-span-5 flex justify-center">
              <StartupJourneyAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section id="how-it-works" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="max-w-md">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Process
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="space-y-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                  {step.num}
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Domains */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Coverage
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Tailored across domains
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Requirements adapt depending on your industry, business structure, and location.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {domains.map((dom) => (
              <div 
                key={dom}
                className="p-3.5 rounded-lg bg-white border border-slate-200/80 text-center text-xs font-medium text-slate-700"
              >
                {dom}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Portals Strip */}
      <section className="py-12 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-5">
          <div className="text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Direct Links to Official Portals
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {portals.map((p) => (
              <div key={p.domain} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-center">
                <span className="font-medium text-slate-800 block truncate">{p.name}</span>
                <span className="text-[11px] text-slate-500 font-mono block mt-0.5">{p.domain}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clean, Simple Footer */}
      <footer className="mt-auto py-8 bg-slate-100/70 border-t border-slate-200/80 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">ProcureEase</span>
            <span>—</span>
            <span>Startup Registration Roadmap Platform</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Guidance platform. Always verify final submissions directly on official portals.
          </p>
        </div>
      </footer>
    </div>
  );
};
