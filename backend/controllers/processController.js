// controllers/processController.js
// Handles all process-related REST API logic

const { createProcess, ProcessTypes } = require('../models/Process');
const { Scheduler } = require('../scheduler/Scheduler');
const logger = require('../middleware/logger');

/**
 * POST /api/create-process
 * Create and add a new process to the scheduler
 */
exports.createProcess = (req, res) => {
  try {
    const { name, priority, burstTime, memoryRequired, type, ioWait } = req.body;

    const process = createProcess({
      name: name || undefined,
      priority: priority !== undefined ? parseInt(priority) : undefined,
      burstTime: burstTime !== undefined ? parseInt(burstTime) : undefined,
      memoryRequired: memoryRequired !== undefined ? parseInt(memoryRequired) : undefined,
      type: type || undefined,
      ioWait: ioWait !== undefined ? parseInt(ioWait) : undefined,
    });

    const added = Scheduler.addProcess(process);
    res.status(201).json({ success: true, process: added });
  } catch (err) {
    logger.error(`createProcess error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * DELETE /api/delete-process/:pid
 */
exports.deleteProcess = (req, res) => {
  try {
    const { pid } = req.params;
    const removed = Scheduler.removeProcess(pid);
    if (!removed) return res.status(404).json({ success: false, error: 'Process not found' });
    res.json({ success: true, message: `Process ${pid} terminated` });
  } catch (err) {
    logger.error(`deleteProcess error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/pause-process/:pid
 */
exports.pauseProcess = (req, res) => {
  try {
    const { pid } = req.params;
    const paused = Scheduler.pauseProcess(pid);
    if (!paused) return res.status(400).json({ success: false, error: 'Cannot pause process' });
    res.json({ success: true, message: `Process ${pid} paused` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/resume-process/:pid
 */
exports.resumeProcess = (req, res) => {
  try {
    const { pid } = req.params;
    const resumed = Scheduler.resumeProcess(pid);
    if (!resumed) return res.status(400).json({ success: false, error: 'Cannot resume process' });
    res.json({ success: true, message: `Process ${pid} resumed` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/get-processes
 */
exports.getProcesses = (req, res) => {
  try {
    const state = Scheduler.getState();
    res.json({ success: true, processes: state.processes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/system-stats
 */
exports.getSystemStats = (req, res) => {
  try {
    const state = Scheduler.getState();
    res.json({
      success: true,
      systemStats: state.systemStats,
      cpuHistory: state.cpuHistory,
      memoryHistory: state.memoryHistory,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/scheduler/algorithm
 */
exports.setAlgorithm = (req, res) => {
  const { algorithm } = req.body;
  const ok = Scheduler.setAlgorithm(algorithm);
  if (!ok) return res.status(400).json({ success: false, error: 'Invalid algorithm' });
  res.json({ success: true, algorithm });
};

/**
 * POST /api/scheduler/speed
 */
exports.setSpeed = (req, res) => {
  const { speed } = req.body;
  Scheduler.setSpeed(parseInt(speed));
  res.json({ success: true, speed: Scheduler.simulationSpeed });
};

/**
 * POST /api/scheduler/quantum
 */
exports.setQuantum = (req, res) => {
  const { quantum } = req.body;
  Scheduler.setQuantum(parseInt(quantum));
  res.json({ success: true, quantum: Scheduler.quantum });
};

/**
 * POST /api/scheduler/start
 */
exports.startScheduler = (req, res) => {
  Scheduler.start();
  res.json({ success: true, message: 'Scheduler started' });
};

/**
 * POST /api/scheduler/stop
 */
exports.stopScheduler = (req, res) => {
  Scheduler.stop();
  res.json({ success: true, message: 'Scheduler stopped' });
};

/**
 * POST /api/scheduler/reset
 */
exports.resetScheduler = (req, res) => {
  Scheduler.reset();
  res.json({ success: true, message: 'System reset' });
};

/**
 * POST /api/load-test
 * Add multiple processes to simulate heavy load
 */
exports.loadTest = (req, res) => {
  try {
    const { count = 8 } = req.body;
    const added = [];
    for (let i = 0; i < Math.min(count, 20); i++) {
      const process = createProcess({});
      Scheduler.addProcess(process);
      added.push(process.pid);
    }
    res.json({ success: true, message: `Added ${added.length} processes`, pids: added });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/logs
 */
exports.getLogs = (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json({ success: true, logs: logger.getLogs(limit) });
};

/**
 * GET /api/process-types
 */
exports.getProcessTypes = (req, res) => {
  res.json({ success: true, types: Object.values(ProcessTypes) });
};
