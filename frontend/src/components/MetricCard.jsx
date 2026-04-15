// src/components/MetricCard.jsx
import React from 'react';

export function MetricCard({ title, value, subtitle, icon, accent = 'cyan', danger = false, warning = false }) {
  const accents = {
    cyan:   'from-cyan-500/10 border-cyan-500/20 text-cyan-400',
    violet: 'from-violet-500/10 border-violet-500/20 text-violet-400',
    emerald:'from-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber:  'from-amber-500/10 border-amber-500/20 text-amber-400',
    rose:   'from-rose-500/10 border-rose-500/20 text-rose-400',
  };

  const colorClass = danger
    ? 'from-rose-500/20 border-rose-500/40 text-rose-400'
    : warning
    ? 'from-amber-500/20 border-amber-500/40 text-amber-400'
    : accents[accent] || accents.cyan;

  return (
    <div className={`relative rounded-xl border bg-gradient-to-b ${colorClass} p-4 overflow-hidden backdrop-blur-sm`}>
      <div className="absolute top-3 right-3 text-xl opacity-60">{icon}</div>
      <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-1">{title}</p>
      <p className={`text-2xl font-bold font-mono ${colorClass.split(' ').find(c => c.startsWith('text-'))}`}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-slate-500 mt-1 font-mono">{subtitle}</p>}
    </div>
  );
}
