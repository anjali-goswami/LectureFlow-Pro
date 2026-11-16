import React from 'react';
import {
  Coffee,
  Timer,
  Landmark,
  GraduationCap,
  Users,
  AlertTriangle
} from 'lucide-react';

const SEVERITY_STYLES = {
  high: 'border-rose-200 bg-rose-50 text-rose-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700'
};

const SEVERITY_LABELS = {
  high: 'Critical',
  medium: 'Medium',
  low: 'Low'
};

const SEVERITY_DOT = {
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500'
};

export function SeverityBadge({ severity }) {
  const key = SEVERITY_STYLES[severity] ? severity : 'medium';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
        SEVERITY_STYLES[key]
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[key]}`} />
      {SEVERITY_LABELS[key] || severity}
    </span>
  );
}

const CONFLICT_TYPES = {
  lunch_break: {
    label: 'Lunch Break',
    color: 'border-purple-200 bg-purple-50 text-purple-700',
    icon: Coffee
  },
  insufficient_break: {
    label: 'Insufficient Buffer',
    color: 'border-orange-200 bg-orange-50 text-orange-700',
    icon: Timer
  },
  hall: {
    label: 'Hall Collision',
    color: 'border-rose-200 bg-rose-50 text-rose-700',
    icon: Landmark
  },
  instructor: {
    label: 'Faculty Clash',
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    icon: GraduationCap
  },
  capacity: {
    label: 'Capacity Overflow',
    color: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    icon: Users
  }
};

export function ConflictTypeBadge({ type }) {
  const conf = CONFLICT_TYPES[type] || {
    label: type ? String(type).replace(/_/g, ' ') : 'Conflict',
    color: 'border-slate-200 bg-slate-100 text-slate-600',
    icon: AlertTriangle
  };
  const Icon = conf.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${conf.color}`}
    >
      <Icon className="h-3 w-3" />
      {conf.label}
    </span>
  );
}