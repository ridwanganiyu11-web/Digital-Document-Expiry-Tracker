import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, XCircle, Ban, HelpCircle } from 'lucide-react';

export default function StatusBadge({ status, size = "md", showIcon = true }) {
  const numStatus = Number(status);

  const configs = {
    1: {
      label: 'Valid',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      dot: 'bg-emerald-400'
    },
    2: {
      label: 'Expiring Soon',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      dot: 'bg-amber-400'
    },
    3: {
      label: 'Critical (≤7d)',
      bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      icon: AlertOctagon,
      dot: 'bg-orange-400'
    },
    4: {
      label: 'Expired',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: XCircle,
      dot: 'bg-rose-400'
    },
    5: {
      label: 'Revoked',
      bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      icon: Ban,
      dot: 'bg-slate-400'
    },
    0: {
      label: 'Unregistered',
      bg: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
      icon: HelpCircle,
      dot: 'bg-gray-400'
    }
  };

  const conf = configs[numStatus] || configs[0];
  const Icon = conf.icon;

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1'
    : size === 'lg'
    ? 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border ${conf.bg} ${sizeClasses} backdrop-blur-sm transition-all`}>
      <span className={`h-1.5 w-1.5 rounded-full ${conf.dot} animate-pulse`} />
      {showIcon && <Icon className={size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      <span>{conf.label}</span>
    </span>
  );
}

