// src/utils/api.js
// REST API helper functions

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!data.success && res.status >= 400) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  createProcess: (body) => request('/create-process', { method: 'POST', body: JSON.stringify(body) }),
  deleteProcess: (pid) => request(`/delete-process/${pid}`, { method: 'DELETE' }),
  pauseProcess: (pid) => request(`/pause-process/${pid}`, { method: 'POST' }),
  resumeProcess: (pid) => request(`/resume-process/${pid}`, { method: 'POST' }),
  getProcesses: () => request('/get-processes'),
  getSystemStats: () => request('/system-stats'),
  setAlgorithm: (algorithm) => request('/scheduler/algorithm', { method: 'POST', body: JSON.stringify({ algorithm }) }),
  setSpeed: (speed) => request('/scheduler/speed', { method: 'POST', body: JSON.stringify({ speed }) }),
  setQuantum: (quantum) => request('/scheduler/quantum', { method: 'POST', body: JSON.stringify({ quantum }) }),
  startScheduler: () => request('/scheduler/start', { method: 'POST' }),
  stopScheduler: () => request('/scheduler/stop', { method: 'POST' }),
  resetScheduler: () => request('/scheduler/reset', { method: 'POST' }),
  loadTest: (count) => request('/load-test', { method: 'POST', body: JSON.stringify({ count }) }),
  getLogs: (limit) => request(`/logs?limit=${limit || 100}`),
};
