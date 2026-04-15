// src/components/SchedulerControls.jsx
import React, { useState } from 'react';
import { api } from '../utils/api';

const ALGORITHMS = ['Round Robin', 'Priority', 'Shortest Job First'];

export function SchedulerControls({ systemStats, onUpdate }) {
  const [loading, setLoading] = useState({});

  const act = async (key, fn) => {
    setLoading(l => ({ ...l, [key]: true }));
    try { await fn(); onUpdate?.(); }
    catch (e) { console.error(e); }
    finally { setLoading(l => ({ ...l, [key]: false })); }
  };

  const isRunning = systemStats?.isRunning;
  const algo = systemStats?.algorithm || 'Round Robin';
  const quantum = systemStats?.quantum || 3;
  const speed = systemStats?.simulationSpeed || 1000;

  return (
    <div className="space-y-4">
      {/* Start / Stop */}
      <div className="flex gap-2">
        <button
          onClick={() => act('toggle', isRunning ? api.stopScheduler : api.startScheduler)}
          disabled={loading.toggle}
          className={`flex-1 py-2 rounded-lg font-mono font-bold text-sm transition-all ${
            isRunning
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
          } disabled:opacity-40`}
        >
          {loading.toggle ? '...' : isRunning ? '⏹ Stop' : '▶ Start'}
        </button>
        <button
          onClick={() => act('reset', api.resetScheduler)}
          disabled={loading.reset}
          className="flex-1 py-2 rounded-lg font-mono font-bold text-sm bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-40"
        >
          {loading.reset ? '...' : '↺ Reset'}
        </button>
      </div>

      {/* Algorithm */}
      <div>
        <label className="block text-xs font-mono text-slate-500 mb-2 uppercase tracking-wider">Scheduling Algorithm</label>
        <div className="space-y-1.5">
          {ALGORITHMS.map(a => (
            <button
              key={a}
              onClick={() => act('algo', () => api.setAlgorithm(a))}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all border ${
                algo === a
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  : 'text-slate-400 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              {algo === a ? '◉' : '○'} {a}
            </button>
          ))}
        </div>
      </div>

      {/* Time Quantum (Round Robin only) */}
      {algo === 'Round Robin' && (
        <div>
          <label className="block text-xs font-mono text-slate-500 mb-2 uppercase tracking-wider">
            Time Quantum: <span className="text-cyan-400">{quantum} ticks</span>
          </label>
          <input
            type="range" min="1" max="10" value={quantum}
            onChange={e => act('quantum', () => api.setQuantum(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-xs font-mono text-slate-600 mt-1">
            <span>1</span><span>5</span><span>10</span>
          </div>
        </div>
      )}

      {/* Simulation Speed */}
      <div>
        <label className="block text-xs font-mono text-slate-500 mb-2 uppercase tracking-wider">
          Sim Speed: <span className="text-violet-400">{speed}ms/tick</span>
        </label>
        <input
          type="range" min="200" max="3000" step="200" value={speed}
          onChange={e => act('speed', () => api.setSpeed(e.target.value))}
          className="w-full accent-violet-500"
        />
        <div className="flex justify-between text-xs font-mono text-slate-600 mt-1">
          <span>Fast</span><span>Normal</span><span>Slow</span>
        </div>
      </div>

      {/* Load Test */}
      <div>
        <label className="block text-xs font-mono text-slate-500 mb-2 uppercase tracking-wider">Stress Test</label>
        <div className="grid grid-cols-3 gap-2">
          {[4, 8, 12].map(n => (
            <button
              key={n}
              onClick={() => act(`load-${n}`, () => api.loadTest(n))}
              disabled={loading[`load-${n}`]}
              className="py-2 rounded-lg text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors disabled:opacity-40"
            >
              +{n} procs
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
