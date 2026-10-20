import React, { useState, useEffect } from 'react';
import { Lightbulb, FileText, Building2, CheckCircle2 } from 'lucide-react';

interface Stage {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const STAGES: Stage[] = [
  {
    id: 'idea',
    title: 'Idea',
    subtitle: 'Domain & legal structure defined',
    icon: Lightbulb
  },
  {
    id: 'documents',
    title: 'Documents',
    subtitle: 'Identity, address & constitutional proofs',
    icon: FileText
  },
  {
    id: 'registrations',
    title: 'Registrations',
    subtitle: 'MCA, PAN, GST & statutory licenses',
    icon: Building2
  },
  {
    id: 'ready',
    title: 'Ready to Operate',
    subtitle: 'Compliant & officially verified',
    icon: CheckCircle2
  }
];

export const StartupJourneyAnimation: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setActiveStep(3); // Show completed state statically
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STAGES.length);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs select-none">
      {/* Header Label */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Roadmap Sequence
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          Stage {activeStep + 1} of {STAGES.length}
        </span>
      </div>

      {/* Progress Track & Stages */}
      <div className="relative space-y-4">
        {/* Background Connecting Line */}
        <div 
          className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-100 -z-0"
          aria-hidden="true"
        />

        {/* Animated Active Line */}
        <div 
          className="absolute left-[19px] top-4 w-[2px] bg-blue-600 transition-all duration-700 ease-in-out -z-0"
          style={{
            height: `${(activeStep / (STAGES.length - 1)) * 82}%`
          }}
          aria-hidden="true"
        />

        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div 
              key={stage.id} 
              className={`flex items-start gap-3.5 p-2 rounded-xl transition-all duration-300 ${
                isCurrent 
                  ? 'bg-blue-50/50' 
                  : 'hover:bg-slate-50/60'
              }`}
            >
              {/* Node Icon */}
              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 z-10 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                    : isCompleted
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white border border-slate-200 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold tracking-tight transition-colors ${
                    isCurrent ? 'text-blue-900 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                  }`}>
                    {stage.title}
                  </span>
                  {isCompleted && (
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                      Done
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-100/70 px-1.5 py-0.2 rounded animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {stage.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle Bottom Note */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Deterministic sequence</span>
        <span>Official portal links</span>
      </div>
    </div>
  );
};
