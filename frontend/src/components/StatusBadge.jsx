// src/components/StatusBadge.jsx
import React from 'react';

const STATUS_CONFIG = {
  Running:    { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: 'bg-emerald-400', pulse: true },
  Waiting:    { bg: 'bg-amber-500/20',   text: 'text-amber-400',   border: 'border-amber-500/40',   dot: 'bg-amber-400',   pulse: false },
  Paused:     { bg: 'bg-blue-500/20',    text: 'text-blue-400',    border: 'border-blue-500/40',    dot: 'bg-blue-400',    pulse: false },
  Stopped:    { bg: 'bg-slate-500/20',   text: 'text-slate-400',   border: 'border-slate-500/40',   dot: 'bg-slate-400',   pulse: false },
  Terminated: { bg: 'bg-red-500/20',     text: 'text-red-400',     border: 'border-red-500/40',     dot: 'bg-red-400',     pulse: false },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Stopped;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}
