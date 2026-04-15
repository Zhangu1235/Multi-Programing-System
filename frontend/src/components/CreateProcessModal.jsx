// src/components/CreateProcessModal.jsx
import React, { useState } from 'react';
import { api } from '../utils/api';

const PROCESS_TYPES = ['CPU_INTENSIVE', 'MEMORY_INTENSIVE', 'BALANCED', 'IO_BOUND'];

export function CreateProcessModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    priority: 5,
    burstTime: 20,
    memoryRequired: 256,
    type: 'BALANCED',
    ioWait: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createProcess({
        ...form,
        priority: parseInt(form.priority),
        burstTime: parseInt(form.burstTime),
        memoryRequired: parseInt(form.memoryRequired),
        ioWait: parseInt(form.ioWait),
      });
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-white font-mono font-bold text-lg">Create Process</h2>
            <p className="text-slate-500 text-xs font-mono mt-0.5">Configure and spawn a new process</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Process Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Leave blank for random"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Process Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {PROCESS_TYPES.map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Priority + Burst Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                Priority <span className="text-slate-600">(1=high)</span>
              </label>
              <input
                type="number" name="priority" min="1" max="10"
                value={form.priority} onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Burst Time</label>
              <input
                type="number" name="burstTime" min="1" max="100"
                value={form.burstTime} onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Memory + IO Wait */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Memory (MB)</label>
              <input
                type="number" name="memoryRequired" min="32" max="2048" step="32"
                value={form.memoryRequired} onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">IO Wait %</label>
              <input
                type="number" name="ioWait" min="0" max="80"
                value={form.ioWait} onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2 text-rose-400 text-xs font-mono">
              ⚠ {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-400 font-mono text-sm hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2 rounded-lg bg-cyan-500 text-black font-mono font-bold text-sm hover:bg-cyan-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : '⚡ Spawn Process'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
