import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  FileSearch, 
  Scale, 
  Sparkles, 
  TrendingUp,
  Zap,
  Layers,
  ChevronRight,
  Send,
  Building2,
  Award
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();
  const [demoLoading, setDemoLoading] = React.useState(false);

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

  const visualJourney = [
    { step: '01', title: 'Prepare', desc: 'DPIIT & Certifications', icon: Building2 },
    { step: '02', title: 'Discover', desc: 'Targeted RFPs & GeM', icon: FileSearch },
    { step: '03', title: 'Check', desc: 'Eligibility Gap Analysis', icon: Scale },
    { step: '04', title: 'Act', desc: 'Evidence & Checklist', icon: Layers },
    { step: '05', title: 'Submit', desc: 'Pre-Bid Audit & GeM Bid', icon: Send },
    { step: '06', title: 'Track', desc: 'Evaluation & Award', icon: TrendingUp },
    { step: '07', title: 'Grow', desc: 'Contract & Milestones', icon: Award },
  ];

  const novelties = [
    {
      title: 'Explainable Tender Match',
      badge: '82% Match',
      desc: 'Explains exactly why a tender matches your startup capabilities instead of a black-box percentage score.',
      items: [
        '✓ Technology capability matched',
        '✓ Sector matched',
        '✓ Required product capability available',
        '⚠ Experience requirement needs verification',
        '⚠ ISO evidence missing'
      ]
    },
    {
      title: 'Eligibility Gap Explainer',
      badge: 'Deterministic Rules',
      desc: 'Transparent 4-column matrix: Requirement → Startup Status → Action → Startup Relaxation note.',
      items: [
        'GST Registration: ✓ Met (GSTIN active)',
        'Technical Specs: ✓ Met (IoT platform match)',
        '2-Year Experience: ✕ Missing (Add project proof)',
        'DPIIT Exemption: ⚠ Potential startup relaxation applies'
      ]
    },
    {
      title: 'Requirement → Evidence Mapping',
      badge: 'Clause Audited',
      desc: 'Connects every tender clause to the exact supporting document page inside your startup vault.',
      items: [
        'Clause 4.1 ISO 9001:2015 → Page 2 of ISO_Cert.pdf',
        'Clause 3.2 DPIIT Recognition → Verified in DPIIT_Cert.pdf',
        'Clause 5.1 Past Experience → ✕ Evidence Missing'
      ]
    },
    {
      title: 'Bid Readiness & Pre-Bid Audit',
      badge: '78% Ready',
      desc: 'Mathematical formula calculating readiness score with negative penalties for missing blockers.',
      items: [
        '12 Requirements Satisfied',
        '3 Require Verification',
        '2 Evidence Documents Missing',
        'Deterministic Verdict: Attention Required'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                ProcureEase <span className="text-blue-600">2.0</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Tender-to-Action
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#journey" className="hover:text-blue-600 transition-colors">The Journey</a>
            <a href="#novelties" className="hover:text-blue-600 transition-colors">Technical Novelty</a>
            <a href="#principles" className="hover:text-blue-600 transition-colors">Philosophy</a>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={Zap}
              onClick={handleDemoClick}
              loading={demoLoading}
              className="hidden sm:inline-flex border-amber-300 text-amber-700 bg-amber-50/50 hover:bg-amber-100/60"
            >
              Try Demo
            </Button>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Create Startup Account
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tender-to-Action Intelligence for Startups</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              From Startup Registration to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500">
                Successful Procurement
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              ProcureEase guides startups from preparation and registration to tender discovery, bid readiness, submission tracking, and project completion.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" icon={ArrowRight} className="w-full sm:w-auto shadow-lg shadow-blue-600/20">
                  Create Startup Account
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                icon={Zap}
                onClick={handleDemoClick}
                loading={demoLoading}
                className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Explore Interactive Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> DPIIT & MSME Relaxation Aware
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI Understands, Rules Decide
              </span>
              <span className="flex items-center gap-1.5 hidden sm:flex">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Explainable Scoring
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Journey Strip */}
      <section id="journey" className="py-14 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
              End-to-End Workflow
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              The Startup Procurement Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1">
              A guided, milestone-driven pathway ensuring no critical compliance clause or deadline is missed.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {visualJourney.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 transition-all duration-200 flex flex-col items-center text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Phase {item.step}
                  </span>
                  <span className="text-sm font-black text-slate-900 mt-0.5">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {item.desc}
                  </span>

                  {idx < visualJourney.length - 1 && (
                    <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technical Novelty Showcase */}
      <section id="novelties" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
                Deep Tech Novelty
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Why ProcureEase is Not Just Another Tender Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1">
                We replace opaque "tender search" with auditable intelligence that tells you if you can bid, what is missing, and what to do next.
              </p>
            </div>
            <Link to="/register">
              <Button variant="outline" size="sm" icon={ArrowRight}>
                Try All Features
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {novelties.map((nov, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {nov.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Feature 0{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {nov.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                    {nov.desc}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs font-mono">
                  {nov.items.map((line, i) => (
                    <div
                      key={i}
                      className={`${
                        line.startsWith('✓') ? 'text-emerald-700 font-semibold' :
                        line.startsWith('⚠') ? 'text-amber-700 font-medium' :
                        'text-rose-700 font-medium'
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Philosophy Section */}
      <section id="principles" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Guiding Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            "AI understands. Rules decide."
          </h2>

          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Large Language Models read and translate ambiguous 60-page government tender jargon into plain English. But your eligibility verdict and bid readiness score are computed through strict, deterministic rules so your startup never risks disqualification.
          </p>

          <div className="pt-4 flex items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="primary" size="lg" icon={ArrowRight}>
                Get Started with ProcureEase
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-800">ProcureEase 2.0</span>
            <span>— Tender-to-Action Intelligence</span>
          </div>

          <div>
            Built for Smart India Hackathon (SIH) Prototype • GFR Rule 173(i) & DPIIT Startup Aware
          </div>
        </div>
      </footer>
    </div>
  );
};
