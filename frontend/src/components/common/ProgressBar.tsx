import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'auto' | 'primary' | 'success' | 'warning' | 'danger';
  color?: string;
  height?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = false,
  size = 'md',
  variant = 'auto',
  color,
  height,
  className = '',
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  // Variant resolution
  let barColor = color || 'bg-blue-600';
  if (!color) {
    if (variant === 'auto') {
      if (percentage >= 80) barColor = 'bg-emerald-500';
      else if (percentage >= 50) barColor = 'bg-blue-600';
      else if (percentage >= 30) barColor = 'bg-amber-500';
      else barColor = 'bg-rose-500';
    } else {
      barColor = {
        primary: 'bg-blue-600',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-rose-500',
      }[variant];
    }
  }

  const heightClass = height || {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size];

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-semibold text-slate-800">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
