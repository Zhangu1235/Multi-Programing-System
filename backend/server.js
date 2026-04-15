// server.js
// Express + WebSocket server for Multiprogramming System

const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const routes = require('./routes');
const { Scheduler } = require('./scheduler/Scheduler');
const { createProcess } = require('./models/Process');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api', routes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'Multiprogramming System Backend Running',
    version: '1.0.0',
    endpoints: [
      'GET /api/get-processes',
      'GET /api/system-stats',
      'POST /api/create-process',
      'DELETE /api/delete-process/:pid',
      'POST /api/pause-process/:pid',
      'POST /api/resume-process/:pid',
      'POST /api/scheduler/algorithm',
      'POST /api/scheduler/speed',
      'POST /api/scheduler/quantum',
      'POST /api/scheduler/start',
      'POST /api/scheduler/stop',
      'POST /api/scheduler/reset',
      'POST /api/load-test',
      'GET /api/logs',
      'WS ws://localhost:4000/ws',
    ],
  });
});

// ── HTTP + WebSocket Server ───────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');

  // Send current state immediately on connect
  ws.send(JSON.stringify({ type: 'state', data: Scheduler.getState() }));

  // Register broadcast listener
  const broadcastFn = (state) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'state', data: state }));
    }
  };
  Scheduler.addListener(broadcastFn);

  // Handle incoming WS messages (client commands)
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      switch (msg.type) {
        case 'create-process':
          Scheduler.addProcess(createProcess(msg.payload || {}));
          break;
        case 'delete-process':
          Scheduler.removeProcess(msg.pid);
          break;
        case 'pause-process':
          Scheduler.pauseProcess(msg.pid);
          break;
        case 'resume-process':
          Scheduler.resumeProcess(msg.pid);
          break;
        case 'set-algorithm':
          Scheduler.setAlgorithm(msg.algorithm);
          break;
        case 'set-speed':
          Scheduler.setSpeed(msg.speed);
          break;
        default:
          logger.warn(`Unknown WS message type: ${msg.type}`);
      }
    } catch (e) {
      logger.error(`WS message parse error: ${e.message}`);
    }
  });

  ws.on('close', () => {
    Scheduler.removeListener(broadcastFn);
    logger.info('WebSocket client disconnected');
  });

  ws.on('error', (err) => {
    Scheduler.removeListener(broadcastFn);
    logger.error(`WebSocket error: ${err.message}`);
  });
});

// ── Boot Sequence ─────────────────────────────────────────────
server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`WebSocket on ws://localhost:${PORT}/ws`);

  // Seed with sample processes
  logger.info('Seeding sample processes...');
  for (let i = 0; i < 6; i++) {
    Scheduler.addProcess(createProcess({}));
  }

  // Start the scheduler automatically
  Scheduler.start();
  logger.info('Scheduler started with sample processes');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  Scheduler.stop();
  server.close(() => {
    logger.info('Server shut down gracefully');
    process.exit(0);
  });
});
