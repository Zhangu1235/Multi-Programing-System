// src/components/ProcessTable.jsx
import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { MiniBar } from './UsageChart';
import { api } from '../utils/api';

const TYPE_COLORS = {
  CPU_INTENSIVE:    'text-orange-400 bg-orange-500/10',
  MEMORY_INTENSIVE: 'text-violet-400 bg-violet-500/10',
  BALANCED:         'text-cyan-400 bg-cyan-500/10',
  IO_BOUND:         'text-green-400 bg-green-500/10',
};

export function ProcessTable({ processes = [], onUpdate }) {
  const [actionPid, setActionPid] = useState(null);

  const handleAction = async (action, pid) => {
    setActionPid(pid);
    try {
      if (action === 'delete') await api.deleteProcess(pid);
      else if (action === 'pause') await api.pauseProcess(pid);
      else if (action === 'resume') await api.resumeProcess(pid);
      onUpdate?.();
    } catch (e) {
      console.error(e);
    } finally {
      setActionPid(null);
    }
  };

  if (processes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-600">
        <div className="text-4xl mb-3">⚙️</div>
        <p className="font-mono text-sm">No active processes</p>
        <p className="font-mono text-xs mt-1">Create a process or run a load test</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            {['PID', 'Name', 'Type', 'Priority', 'Status', 'CPU', 'Memory', 'Remaining', 'Actions'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {processes.map((proc) => (
            <tr
              key={proc.pid}
              className={`transition-colors hover:bg-slate-800/30 ${
                proc.status === 'Running' ? 'bg-emerald-500/5' :
                proc.status === 'Paused'  ? 'bg-blue-500/5' : ''
              }`}
            >
              {/* PID */}
              <td className="px-3 py-2 font-mono text-xs text-slate-300 whitespace-nowrap">
                {proc.pid}
              </td>

              {/* Name */}
              <td className="px-3 py-2 font-mono text-xs text-white whitespace-nowrap">
                {proc.name}
              </td>

              {/* Type */}
              <td className="px-3 py-2 whitespace-nowrap">
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${TYPE_COLORS[proc.type] || 'text-slate-400'}`}>
                  {proc.type?.replace('_', ' ')}
                </span>
              </td>

              {/* Priority */}
              <td className="px-3 py-2 text-center">
                <span className={`font-mono text-xs font-bold ${
                  proc.priority <= 3 ? 'text-rose-400' :
                  proc.priority <= 6 ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  P{proc.priority}
                </span>
              </td>

              {/* Status */}
              <td className="px-3 py-2 whitespace-nowrap">
                <StatusBadge status={proc.status} />
              </td>

              {/* CPU */}
              <td className="px-3 py-2 min-w-[100px]">
                <MiniBar value={proc.cpuUsage} color="#06b6d4" />
              </td>

              {/* Memory */}
              <td className="px-3 py-2 whitespace-nowrap">
                <span className="font-mono text-xs text-violet-400">{proc.memoryAllocated}MB</span>
                <span className="font-mono text-xs text-slate-600"> / {proc.memoryUsage}MB</span>
              </td>

              {/* Remaining burst */}
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((proc.remainingTime / proc.burstTime) * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-slate-500">{proc.remainingTime}/{proc.burstTime}</span>
                </div>
              </td>

              {/* Actions */}
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  {proc.status === 'Paused' ? (
                    <button
                      onClick={() => handleAction('resume', proc.pid)}
                      disabled={actionPid === proc.pid}
                      className="px-2 py-1 text-xs font-mono rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 border border-blue-500/30 transition-colors disabled:opacity-40"
                    >
                      ▶ Resume
                    </button>
                  ) : (proc.status === 'Running' || proc.status === 'Waiting') ? (
                    <button
                      onClick={() => handleAction('pause', proc.pid)}
                      disabled={actionPid === proc.pid}
                      className="px-2 py-1 text-xs font-mono rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/40 border border-amber-500/30 transition-colors disabled:opacity-40"
                    >
                      ⏸ Pause
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleAction('delete', proc.pid)}
                    disabled={actionPid === proc.pid}
                    className="px-2 py-1 text-xs font-mono rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 border border-rose-500/30 transition-colors disabled:opacity-40"
                  >
                    ✕ Kill
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
