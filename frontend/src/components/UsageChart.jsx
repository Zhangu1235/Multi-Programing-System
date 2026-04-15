// src/components/UsageChart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function buildChartData(history, color, label) {
  const labels = history.map((_, i) => {
    const secondsAgo = (history.length - 1 - i);
    return secondsAgo === 0 ? 'now' : `-${secondsAgo}s`;
  });

  return {
    labels,
    datasets: [{
      label,
      data: history.map(h => Math.round(h.value)),
      fill: true,
      borderColor: color,
      backgroundColor: `${color}22`,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.4,
    }],
  };
}

const chartOptions = (max = 100) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300 },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#64748b', font: { family: 'monospace', size: 10 }, maxTicksLimit: 10 },
    },
    y: {
      min: 0,
      max,
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#64748b', font: { family: 'monospace', size: 10 }, callback: v => `${v}%` },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#1e293b',
      borderWidth: 1,
      titleColor: '#94a3b8',
      bodyColor: '#e2e8f0',
      callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(1)}%` },
    },
  },
});

export function CPUChart({ history }) {
  const data = buildChartData(history, '#06b6d4', 'CPU %');
  return (
    <div className="h-40">
      <Line data={data} options={chartOptions(100)} />
    </div>
  );
}

export function MemoryChart({ history }) {
  const data = buildChartData(history, '#8b5cf6', 'Memory %');
  return (
    <div className="h-40">
      <Line data={data} options={chartOptions(100)} />
    </div>
  );
}

// Mini sparkline for process table
export function MiniBar({ value, color = '#06b6d4', max = 100 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = pct > 85 ? '#ef4444' : pct > 65 ? '#f59e0b' : color;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-9 text-right">{Math.round(value)}%</span>
    </div>
  );
}
