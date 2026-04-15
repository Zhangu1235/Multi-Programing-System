// src/components/LogPanel.jsx
import React, { useEffect, useRef } from 'react';

const LEVEL_STYLE = {
  info:  'text-slate-400',
  warn:  'text-amber-400',
  error: 'text-rose-400',
  debug: 'text-slate-600',
};

const LEVEL_TAG = {
  info:  'text-cyan-500',
  warn:  'text-amber-500',
  error: 'text-rose-500',
  debug: 'text-slate-600',
};

export function LogPanel({ logs = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  return (
    <div className="h-48 overflow-y-auto font-mono text-xs space-y-0.5 pr-1">
      {logs.length === 0 && (
        <p className="text-slate-600 py-4 text-center">No log entries yet...</p>
      )}
      {[...logs].reverse().map((log) => (
        <div key={log.id} className={`flex gap-2 py-0.5 ${LEVEL_STYLE[log.level]}`}>
          <span className="text-slate-700 shrink-0">
            {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span className={`font-bold uppercase shrink-0 w-8 ${LEVEL_TAG[log.level]}`}>
            {log.level}
          </span>
          <span className="break-all">{log.message}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
