import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  phaseNotice?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  phaseNotice,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white border border-dashed border-slate-300 rounded-2xl ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {phaseNotice && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>{phaseNotice}</span>
        </div>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
