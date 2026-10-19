import React from 'react';

export type StatusType = 
  | 'Met' | 'Completed' | 'Ready' | 'Verified'
  | 'Partial' | 'Verify' | 'Attention' | 'Needs Review' | 'Pending'
  | 'Missing' | 'Critical' | 'Blocked' | 'High'
  | 'Information' | 'Active' | 'In Progress' | 'Action'
  | 'Not Started' | 'Neutral' | 'Draft' | 'Optional'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const normalized = status.trim().toUpperCase();

  // Green = Met / Completed / Ready
  const isGreen = ['MET', 'COMPLETED', 'READY', 'VERIFIED'].includes(normalized);
  // Yellow/Amber = Partial / Verify / Attention
  const isAmber = ['PARTIAL', 'VERIFY', 'ATTENTION', 'NEEDS REVIEW', 'PENDING', 'MEDIUM'].includes(normalized);
  // Red = Missing / Critical
  const isRed = ['MISSING', 'CRITICAL', 'BLOCKED', 'HIGH'].includes(normalized);
  // Blue/Indigo = Information / Active
  const isBlue = ['INFORMATION', 'ACTIVE', 'IN PROGRESS', 'IN_PROGRESS', 'ACTION'].includes(normalized);
  // Gray = Not started / Neutral (default fallback)

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (isGreen) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
  } else if (isAmber) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200/80';
    dotColor = 'bg-amber-500';
  } else if (isRed) {
    styles = 'bg-rose-50 text-rose-800 border-rose-200/80';
    dotColor = 'bg-rose-500';
  } else if (isBlue) {
    styles = 'bg-blue-50 text-blue-800 border-blue-200/80';
    dotColor = 'bg-blue-500';
  } else {
    // Gray
    styles = 'bg-slate-100 text-slate-600 border-slate-200';
    dotColor = 'bg-slate-400';
  }

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${styles} ${sizeStyles} ${className} transition-colors select-none font-medium`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
      <span className="capitalize">{status}</span>
    </span>
  );
};
