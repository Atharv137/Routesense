import React from 'react';
import { BusStatus, IncidentSeverity, IncidentStatus, IncidentType } from '../../types';

interface StatusBadgeProps {
  status?: BusStatus | IncidentStatus | IncidentType | IncidentSeverity | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = 'on_time', size = 'md', showDot = true }) => {
  let bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotClass = 'bg-emerald-500';
  let label = String(status);

  switch (status) {
    case 'on_time':
    case 'resolved':
    case 'paid':
    case 'active':
    case 'on_duty':
      bgClass = 'bg-[#22A06B]/10 text-[#22A06B] border-[#22A06B]/20';
      dotClass = 'bg-[#22A06B]';
      label = status === 'on_time' ? 'On Time' : status === 'on_duty' ? 'On Duty' : status.toUpperCase();
      break;

    case 'delayed':
    case 'warning':
    case 'in_progress':
    case 'in_review':
    case 'medium':
      bgClass = 'bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/25';
      dotClass = 'bg-[#FF6B00]';
      label = status === 'delayed' ? 'Delayed' : status === 'in_progress' ? 'In Progress' : status === 'in_review' ? 'In Review' : status.toUpperCase();
      break;

    case 'breakdown':
    case 'critical':
    case 'high':
    case 'error':
      bgClass = 'bg-[#E5484D]/10 text-[#E5484D] border-[#E5484D]/25';
      dotClass = 'bg-[#E5484D] animate-pulse';
      label = status === 'breakdown' ? 'Breakdown' : status.toUpperCase();
      break;

    case 'obstruction':
      bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
      dotClass = 'bg-amber-500';
      label = 'Obstruction';
      break;

    case 'delay':
      bgClass = 'bg-orange-50 text-[#FF6B00] border-orange-200';
      dotClass = 'bg-[#FF6B00]';
      label = 'Delay';
      break;

    case 'low':
    case 'info':
    case 'scheduled':
    case 'idle':
      bgClass = 'bg-[#3478F6]/10 text-[#3478F6] border-[#3478F6]/20';
      dotClass = 'bg-[#3478F6]';
      label = status === 'scheduled' ? 'Scheduled' : status === 'idle' ? 'Idle' : status.toUpperCase();
      break;

    default:
      bgClass = 'bg-gray-100 text-gray-700 border-gray-200';
      dotClass = 'bg-gray-400';
      label = String(status);
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold tracking-wide',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${bgClass} ${sizeClasses}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />}
      <span className="capitalize">{label.replace(/_/g, ' ')}</span>
    </span>
  );
};
