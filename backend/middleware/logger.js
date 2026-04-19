// middleware/logger.js
// Simple structured logging system

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const MAX_LOGS = 200;

class Logger {
  constructor() {
    this.logs = [];
    this.level = 'info';
  }

  _log(level, message) {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    this.logs.unshift(entry);
    if (this.logs.length > MAX_LOGS) this.logs.pop();

    const colors = { debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m' };
    const reset = '\x1b[0m';
    console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${entry.timestamp} - ${message}`);

    return entry;
  }

  debug(msg) { return this._log('debug', msg); }
  info(msg) { return this._log('info', msg); }
  warn(msg) { return this._log('warn', msg); }
  error(msg) { return this._log('error', msg); }

  getLogs(limit = 50) {
    return this.logs.slice(0, limit);
  }

  clear() { this.logs = []; }
}

module.exports = new Logger();
