import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">ProcureEase 2.0</span>
            <span>•</span>
            <span>Tender-to-Action Intelligence</span>
            <span>•</span>
            <span>AI understands. Rules decide.</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 max-w-xl text-center md:text-right">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
            <span>
              Decision-support guidance only. Final eligibility and bid compliance must be verified against official tender documents before submission.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
