// src/pages/Dashboard.jsx
// Main dashboard page - assembles all components

import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { api } from '../utils/api';
import { MetricCard } from '../components/MetricCard';
import { CPUChart, MemoryChart } from '../components/UsageChart';
import { ProcessTable } from '../components/ProcessTable';
import { SchedulerControls } from '../components/SchedulerControls';
import { CreateProcessModal } from '../components/CreateProcessModal';
import { LogPanel } from '../components/LogPanel';

export function Dashboard() {
  const { state, connected } = useWebSocket();
  const [showModal, setShowModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('processes'); // 'processes' | 'logs'

  // Fetch logs periodically
  const fetchLogs = useCallback(async () => {
    try {
      const data = await api.getLogs(80);
      setLogs(data.logs || []);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const processes = state?.processes || [];
  const systemStats = state?.systemStats || {};
  const cpuHistory = state?.cpuHistory || [];
  const memoryHistory = state?.memoryHistory || [];

  const cpuUtil = systemStats.cpuUtilization || 0;
  const memStats = systemStats.memoryStats || {};
  const isCpuDanger = cpuUtil > 85;
  const isCpuWarning = cpuUtil > 65;
  const isMemDanger = (memStats.utilizationPercent || 0) > 88;
  const isMemWarning = (memStats.utilizationPercent || 0) > 70;

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* ── Header ── */}
      <header className="border-b border-slate-800/80 bg-[#0a0f1a]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <span className="text-cyan-400 text-sm">⚙</span>
            </div>
            <div>
              <h1 className="font-mono font-bold text-white text-sm tracking-tight">
                MultiProg<span className="text-cyan-400">OS</span>
              </h1>
              <p className="font-mono text-[10px] text-slate-600 leading-none">Dynamic Resource Allocator</p>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-4">
            {/* Bottleneck alerts */}
            {systemStats.bottleneck?.cpuOverload && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-mono animate-pulse">
                ⚠ CPU OVERLOAD
              </div>
            )}
            {systemStats.bottleneck?.memoryExhausted && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono animate-pulse">
                ⚠ MEM EXHAUSTED
              </div>
            )}

            {/* Tick counter */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-600">
              <span className="text-slate-700">TICK</span>
              <span className="text-slate-400">{systemStats.tickCount || 0}</span>
            </div>

            {/* WS connection */}
            <div className={`flex items-center gap-1.5 text-xs font-mono ${connected ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              {connected ? 'LIVE' : 'OFFLINE'}
            </div>

            {/* Algorithm badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              {systemStats.algorithm || '—'}
            </div>

            {/* Create process */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-mono font-bold text-xs hover:bg-cyan-400 transition-colors"
            >
              + New Process
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">

        {/* ── Left Column ── */}
        <div className="space-y-5">

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              title="CPU Utilization"
              value={`${cpuUtil.toFixed(1)}%`}
              subtitle={`${systemStats.activeProcesses || 0} running`}
              icon="🖥"
              accent="cyan"
              danger={isCpuDanger}
              warning={!isCpuDanger && isCpuWarning}
            />
            <MetricCard
              title="Memory Used"
              value={`${memStats.utilizationPercent || 0}%`}
              subtitle={`${memStats.used || 0} / ${memStats.total || 4096} MB`}
              icon="💾"
              accent="violet"
              danger={isMemDanger}
              warning={!isMemDanger && isMemWarning}
            />
            <MetricCard
              title="Active Processes"
              value={processes.filter(p => p.status === 'Running').length}
              subtitle={`${systemStats.waitingProcesses || 0} waiting`}
              icon="⚡"
              accent="emerald"
            />
            <MetricCard
              title="Completed"
              value={systemStats.completedProcesses || 0}
              subtitle={`Queue: ${systemStats.readyQueueLength || 0}`}
              icon="✓"
              accent="amber"
            />
          </div>

          {/* ── Charts Row ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CPU Chart */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-mono font-bold text-sm text-white">CPU Utilization</h2>
                  <p className="font-mono text-xs text-slate-600">60-second rolling average</p>
                </div>
                <div className={`font-mono font-bold text-xl ${isCpuDanger ? 'text-rose-400' : isCpuWarning ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {cpuUtil.toFixed(1)}%
                </div>
              </div>
              <CPUChart history={cpuHistory} />
            </div>

            {/* Memory Chart */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-mono font-bold text-sm text-white">Memory Utilization</h2>
                  <p className="font-mono text-xs text-slate-600">Paged RAM — {memStats.pageSize || 4}MB pages</p>
                </div>
                <div className={`font-mono font-bold text-xl ${isMemDanger ? 'text-rose-400' : isMemWarning ? 'text-amber-400' : 'text-violet-400'}`}>
                  {memStats.utilizationPercent || 0}%
                </div>
              </div>
              <MemoryChart history={memoryHistory} />
            </div>
          </div>

          {/* ── Memory Paging Visualizer ── */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-mono font-bold text-sm text-white">Memory Pages</h2>
                <p className="font-mono text-xs text-slate-600">
                  {memStats.usedPages || 0}/{memStats.totalPages || 1024} pages used ({memStats.pageSize || 4}MB each)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-violet-500/70 inline-block" /> Used</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700 inline-block" /> Free</span>
              </div>
            </div>
            <MemoryPageGrid usedPages={memStats.usedPages || 0} totalPages={memStats.totalPages || 1024} />
          </div>

          {/* ── Process Table ── */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl backdrop-blur-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              {['processes', 'logs'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                    activeTab === tab
                      ? 'text-cyan-400 border-b-2 border-cyan-500 -mb-px bg-cyan-500/5'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab === 'processes' ? `⚡ Processes (${processes.length})` : `📋 System Logs`}
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === 'processes' ? (
                <ProcessTable processes={processes} onUpdate={() => {}} />
              ) : (
                <LogPanel logs={logs} />
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column (Controls) ── */}
        <div className="space-y-4">
          {/* Scheduler panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${systemStats.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <h2 className="font-mono font-bold text-sm text-white">Scheduler</h2>
            </div>
            <SchedulerControls systemStats={systemStats} onUpdate={() => {}} />
          </div>

          {/* System Info */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
            <h2 className="font-mono font-bold text-sm text-white mb-3">System Info</h2>
            <div className="space-y-2">
              {[
                ['Algorithm', systemStats.algorithm || '—'],
                ['Quantum', `${systemStats.quantum || 0} ticks`],
                ['Sim Speed', `${systemStats.simulationSpeed || 0}ms`],
                ['Tick Count', systemStats.tickCount || 0],
                ['Queue Depth', systemStats.readyQueueLength || 0],
                ['RAM Total', `${memStats.total || 4096} MB`],
                ['Pages Free', memStats.freePages || 0],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="font-mono text-xs text-slate-500">{k}</span>
                  <span className="font-mono text-xs text-slate-300">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottleneck Status */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
            <h2 className="font-mono font-bold text-sm text-white mb-3">Bottleneck Monitor</h2>
            <div className="space-y-2">
              <BottleneckIndicator
                label="CPU Load"
                active={systemStats.bottleneck?.cpuOverload}
                value={`${cpuUtil.toFixed(0)}%`}
                threshold="85%"
              />
              <BottleneckIndicator
                label="Memory Pressure"
                active={systemStats.bottleneck?.memoryExhausted}
                value={`${memStats.utilizationPercent || 0}%`}
                threshold="88%"
              />
            </div>
            {systemStats.bottleneck?.lastRebalanced && (
              <p className="font-mono text-[10px] text-slate-600 mt-3">
                Last rebalanced: {new Date(systemStats.bottleneck.lastRebalanced).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Create Process Modal ── */}
      {showModal && (
        <CreateProcessModal
          onClose={() => setShowModal(false)}
          onCreated={() => {}}
        />
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function MemoryPageGrid({ usedPages, totalPages }) {
  // Show a representative sample of up to 512 blocks
  const displayCount = Math.min(totalPages, 512);
  const scale = totalPages / displayCount;
  const usedDisplay = Math.round(usedPages / scale);

  return (
    <div className="flex flex-wrap gap-0.5">
      {Array.from({ length: displayCount }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-sm transition-colors duration-500 ${
            i < usedDisplay ? 'bg-violet-500/70' : 'bg-slate-800 border border-slate-700/50'
          }`}
        />
      ))}
    </div>
  );
}

function BottleneckIndicator({ label, active, value, threshold }) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
      active
        ? 'bg-rose-500/10 border-rose-500/30'
        : 'bg-slate-800/40 border-slate-700/30'
    }`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${active ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
        <span className="font-mono text-xs text-slate-400">{label}</span>
      </div>
      <div className="text-right">
        <span className={`font-mono text-xs font-bold ${active ? 'text-rose-400' : 'text-emerald-400'}`}>{value}</span>
        <span className="font-mono text-[10px] text-slate-600 ml-1">/{threshold}</span>
      </div>
    </div>
  );
}
