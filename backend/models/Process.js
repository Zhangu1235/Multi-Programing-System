// models/Process.js
// Defines the Process data structure and factory

const { v4: uuidv4 } = require('uuid');

/**
 * Process status enum
 */
const ProcessStatus = {
  RUNNING: 'Running',
  WAITING: 'Waiting',
  STOPPED: 'Stopped',
  PAUSED: 'Paused',
  TERMINATED: 'Terminated',
};

/**
 * Process types with different resource profiles
 */
const ProcessTypes = {
  CPU_INTENSIVE: 'CPU_INTENSIVE',
  MEMORY_INTENSIVE: 'MEMORY_INTENSIVE',
  BALANCED: 'BALANCED',
  IO_BOUND: 'IO_BOUND',
};

/**
 * Sample process names for simulation
 */
const PROCESS_NAMES = [
  'chrome.exe', 'node.js', 'python.py', 'java.jar', 'webpack.js',
  'postgres', 'redis', 'nginx', 'docker', 'vscode',
  'compiler', 'linker', 'analyzer', 'renderer', 'encoder',
  'ml-trainer', 'data-sync', 'log-parser', 'cache-warm', 'indexer',
];

/**
 * Create a new process object
 * @param {Object} options - Process configuration
 * @returns {Object} Process object
 */
function createProcess(options = {}) {
  const type = options.type || randomChoice(Object.values(ProcessTypes));
  const burstTime = options.burstTime || randomInt(5, 50);
  const memoryRequired = options.memoryRequired || getMemoryByType(type);

  return {
    pid: options.pid || `P-${uuidv4().slice(0, 6).toUpperCase()}`,
    name: options.name || randomChoice(PROCESS_NAMES),
    type,
    priority: options.priority !== undefined ? options.priority : randomInt(1, 10),
    status: ProcessStatus.WAITING,
    cpuUsage: 0,           // Current CPU usage %
    memoryUsage: memoryRequired,   // Memory in MB
    memoryAllocated: 0,    // Actually allocated memory
    burstTime,             // Total CPU time needed (simulated units)
    remainingTime: options.remainingTime || burstTime, // Remaining burst time
    arrivalTime: Date.now(),
    startTime: null,
    completionTime: null,
    waitingTime: 0,
    turnaroundTime: 0,
    cpuTimeUsed: 0,        // CPU time consumed so far
    quantumUsed: 0,        // Time used in current quantum (Round Robin)
    ioWait: options.ioWait || (type === ProcessTypes.IO_BOUND ? randomInt(20, 60) : 0), // % chance of IO wait per cycle
    logs: [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Get memory requirement based on process type
 */
function getMemoryByType(type) {
  const ranges = {
    [ProcessTypes.CPU_INTENSIVE]: [64, 256],
    [ProcessTypes.MEMORY_INTENSIVE]: [512, 2048],
    [ProcessTypes.BALANCED]: [128, 512],
    [ProcessTypes.IO_BOUND]: [32, 128],
  };
  const [min, max] = ranges[type] || [64, 256];
  return randomInt(min, max);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = { createProcess, ProcessStatus, ProcessTypes, PROCESS_NAMES };
