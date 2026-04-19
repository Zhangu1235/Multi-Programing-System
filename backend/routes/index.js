// routes/index.js
// All REST API routes

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/processController');

// Process management
router.post('/create-process', ctrl.createProcess);
router.delete('/delete-process/:pid', ctrl.deleteProcess);
router.post('/pause-process/:pid', ctrl.pauseProcess);
router.post('/resume-process/:pid', ctrl.resumeProcess);
router.get('/get-processes', ctrl.getProcesses);
router.get('/system-stats', ctrl.getSystemStats);

// Scheduler controls
router.post('/scheduler/algorithm', ctrl.setAlgorithm);
router.post('/scheduler/speed', ctrl.setSpeed);
router.post('/scheduler/quantum', ctrl.setQuantum);
router.post('/scheduler/start', ctrl.startScheduler);
router.post('/scheduler/stop', ctrl.stopScheduler);
router.post('/scheduler/reset', ctrl.resetScheduler);

// Simulation
router.post('/load-test', ctrl.loadTest);

// Logs & metadata
router.get('/logs', ctrl.getLogs);
router.get('/process-types', ctrl.getProcessTypes);

module.exports = router;
