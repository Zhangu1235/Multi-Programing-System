// scheduler/Scheduler.js
// Implements Round Robin, Priority Scheduling, and SJF algorithms

const { ProcessStatus } = require('../models/Process');
const memoryManager = require('../models/MemoryManager');
const logger = require('../middleware/logger');

const SchedulingAlgorithm = {
  ROUND_ROBIN: 'Round Robin',
  PRIORITY: 'Priority',
  SJF: 'Shortest Job First',
};

class Scheduler {
  constructor() {
    this.processes = new Map();       // All processes: pid -> process
    this.readyQueue = [];             // PIDs waiting for CPU
    this.algorithm = SchedulingAlgorithm.ROUND_ROBIN;
    this.quantum = 3;                 // Default time quantum (ticks)
    this.simulationSpeed = 1000;      // ms per tick
    this.simulationTimer = null;
    this.tickCount = 0;
    this.cpuUsageHistory = [];        // Rolling history for graph
    this.memoryUsageHistory = [];
    this.currentProcess = null;       // Currently running PID
    this.quantumCounter = 0;          // Ticks used in current quantum
    this.completedCount = 0;
    this.listeners = new Set();       // WebSocket broadcast callbacks
    this.bottleneckState = {
      cpuOverload: false,
      memoryExhausted: false,
      lastRebalanced: null,
    };
  }

  // ─── Process CRUD ────────────────────────────────────────────

  addProcess(process) {
    // Try to allocate memory
    const allocated = memoryManager.allocate(process.pid, process.memoryUsage);
    if (!allocated) {
      logger.warn(`Cannot allocate memory for ${process.pid}: not enough RAM`);
      process.status = ProcessStatus.WAITING;
      process.memoryAllocated = 0;
      // Still add to system but don't queue until memory available
    } else {
      process.memoryAllocated = process.memoryUsage;
      process.status = ProcessStatus.WAITING;
      this.readyQueue.push(process.pid);
    }

    this.processes.set(process.pid, process);
    logger.info(`Process ${process.pid} (${process.name}) added | Memory: ${process.memoryUsage}MB | Priority: ${process.priority}`);
    this.broadcast();
    return process;
  }

  removeProcess(pid) {
    const process = this.processes.get(pid);
    if (!process) return false;

    if (this.currentProcess === pid) {
      this.currentProcess = null;
      this.quantumCounter = 0;
    }

    memoryManager.free(pid);
    this.readyQueue = this.readyQueue.filter(p => p !== pid);
    process.status = ProcessStatus.TERMINATED;
    process.completionTime = Date.now();

    logger.info(`Process ${pid} (${process.name}) terminated`);
    this.processes.delete(pid);
    this.broadcast();
    return true;
  }

  pauseProcess(pid) {
    const process = this.processes.get(pid);
    if (!process) return false;

    if (process.status === ProcessStatus.RUNNING || process.status === ProcessStatus.WAITING) {
      if (this.currentProcess === pid) {
        this.currentProcess = null;
        this.quantumCounter = 0;
      }
      this.readyQueue = this.readyQueue.filter(p => p !== pid);
      process.status = ProcessStatus.PAUSED;
      process.cpuUsage = 0;
      logger.info(`Process ${pid} paused`);
      this.broadcast();
      return true;
    }
    return false;
  }

  resumeProcess(pid) {
    const process = this.processes.get(pid);
    if (!process || process.status !== ProcessStatus.PAUSED) return false;

    process.status = ProcessStatus.WAITING;
    if (!this.readyQueue.includes(pid)) {
      this.readyQueue.push(pid);
    }
    logger.info(`Process ${pid} resumed`);
    this.broadcast();
    return true;
  }

  // ─── Scheduling Algorithms ───────────────────────────────────

  /**
   * Select next process based on current algorithm
   */
  selectNext() {
    const waiting = this.readyQueue.filter(pid => {
      const p = this.processes.get(pid);
      return p && p.status !== ProcessStatus.PAUSED && p.status !== ProcessStatus.TERMINATED;
    });

    if (waiting.length === 0) return null;

    switch (this.algorithm) {
      case SchedulingAlgorithm.ROUND_ROBIN:
        return this._roundRobinSelect(waiting);
      case SchedulingAlgorithm.PRIORITY:
        return this._prioritySelect(waiting);
      case SchedulingAlgorithm.SJF:
        return this._sjfSelect(waiting);
      default:
        return waiting[0];
    }
  }

  _roundRobinSelect(queue) {
    // In RR, we rotate the queue — just pick first
    return queue[0];
  }

  _prioritySelect(queue) {
    // Pick process with highest priority (lower number = higher priority)
    return queue.reduce((best, pid) => {
      const bestProc = this.processes.get(best);
      const currProc = this.processes.get(pid);
      return currProc.priority < bestProc.priority ? pid : best;
    });
  }

  _sjfSelect(queue) {
    // Pick process with shortest remaining burst time
    return queue.reduce((best, pid) => {
      const bestProc = this.processes.get(best);
      const currProc = this.processes.get(pid);
      return currProc.remainingTime < bestProc.remainingTime ? pid : best;
    });
  }

  // ─── Simulation Engine ───────────────────────────────────────

  start() {
    if (this.simulationTimer) return;
    logger.info(`Scheduler started | Algorithm: ${this.algorithm} | Speed: ${this.simulationSpeed}ms`);
    this.simulationTimer = setInterval(() => this._tick(), this.simulationSpeed);
  }

  stop() {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
      logger.info('Scheduler stopped');
    }
  }

  async _tick() {
    this.tickCount++;

    // Check for processes waiting for memory
    this._tryAllocateWaitingProcesses();

    // Preempt current process if quantum expired (Round Robin)
    if (this.currentProcess && this.algorithm === SchedulingAlgorithm.ROUND_ROBIN) {
      this.quantumCounter++;
      if (this.quantumCounter >= this.quantum) {
        const p = this.processes.get(this.currentProcess);
        if (p && p.status === ProcessStatus.RUNNING) {
          p.status = ProcessStatus.WAITING;
          p.cpuUsage = 0;
          // Move to end of queue (rotate)
          this.readyQueue = this.readyQueue.filter(pid => pid !== this.currentProcess);
          this.readyQueue.push(this.currentProcess);
        }
        this.currentProcess = null;
        this.quantumCounter = 0;
      }
    }

    // Select next process if CPU is idle
    if (!this.currentProcess) {
      const next = this.selectNext();
      if (next) {
        this.currentProcess = next;
        this.quantumCounter = 0;
        const p = this.processes.get(next);
        if (p) {
          p.status = ProcessStatus.RUNNING;
          if (!p.startTime) p.startTime = Date.now();
        }
      }
    }

    // Execute current process for one tick
    if (this.currentProcess) {
      const p = this.processes.get(this.currentProcess);
      if (p) {
        // Simulate IO wait
        const isIOWait = p.ioWait > 0 && Math.random() * 100 < p.ioWait;

        if (isIOWait) {
          p.status = ProcessStatus.WAITING;
          p.cpuUsage = 0;
          this.currentProcess = null;
          this.quantumCounter = 0;
          // Re-queue after IO
          if (!this.readyQueue.includes(p.pid)) {
            setTimeout(() => {
              const proc = this.processes.get(p.pid);
              if (proc && proc.status === ProcessStatus.WAITING) {
                if (!this.readyQueue.includes(proc.pid)) this.readyQueue.push(proc.pid);
              }
            }, this.simulationSpeed * 2);
          }
        } else {
          // Normal execution
          const cpuBurn = this._getCPUUsage(p);
          p.cpuUsage = cpuBurn;
          p.cpuTimeUsed++;
          p.remainingTime = Math.max(0, p.remainingTime - 1);

          // Check if process completed
          if (p.remainingTime <= 0) {
            p.status = ProcessStatus.STOPPED;
            p.cpuUsage = 0;
            p.completionTime = Date.now();
            p.turnaroundTime = p.completionTime - p.arrivalTime;
            p.waitingTime = p.turnaroundTime - p.cpuTimeUsed * this.simulationSpeed;
            this.completedCount++;
            this.readyQueue = this.readyQueue.filter(pid => pid !== p.pid);
            memoryManager.free(p.pid);
            p.memoryAllocated = 0;
            this.currentProcess = null;
            this.quantumCounter = 0;
            logger.info(`Process ${p.pid} completed in ${p.turnaroundTime}ms`);
          }
        }
      }
    }

    // Update waiting times for queued processes
    this._updateWaitingTimes();

    // Detect bottlenecks
    this._detectBottlenecks();

    // Record history
    this._recordHistory();

    // Broadcast state
    this.broadcast();
  }

  _getCPUUsage(process) {
    const base = {
      CPU_INTENSIVE: 70,
      MEMORY_INTENSIVE: 30,
      BALANCED: 50,
      IO_BOUND: 20,
    }[process.type] || 50;
    // Add jitter
    return Math.min(100, Math.max(5, base + (Math.random() - 0.5) * 20));
  }

  _tryAllocateWaitingProcesses() {
    this.processes.forEach((p) => {
      if (p.status === ProcessStatus.WAITING && p.memoryAllocated === 0 && p.remainingTime > 0) {
        const allocated = memoryManager.allocate(p.pid, p.memoryUsage);
        if (allocated) {
          p.memoryAllocated = p.memoryUsage;
          if (!this.readyQueue.includes(p.pid)) {
            this.readyQueue.push(p.pid);
          }
          logger.info(`Memory allocated for waiting process ${p.pid}`);
        }
      }
    });
  }

  _updateWaitingTimes() {
    this.readyQueue.forEach(pid => {
      const p = this.processes.get(pid);
      if (p && p.status === ProcessStatus.WAITING) {
        p.waitingTime += this.simulationSpeed;
      }
    });
  }

  _detectBottlenecks() {
    const memStats = memoryManager.getStats();
    const totalCPU = this._getTotalCPUUsage();

    const prevCpuOverload = this.bottleneckState.cpuOverload;
    const prevMemExhausted = this.bottleneckState.memoryExhausted;

    this.bottleneckState.cpuOverload = totalCPU > 85;
    this.bottleneckState.memoryExhausted = memStats.utilizationPercent > 88;

    // Auto-rebalance on bottleneck detection
    if (this.bottleneckState.cpuOverload && !prevCpuOverload) {
      logger.warn(`CPU OVERLOAD detected: ${totalCPU.toFixed(1)}% | Adjusting quantum...`);
      this._rebalanceCPU();
    }

    if (this.bottleneckState.memoryExhausted && !prevMemExhausted) {
      logger.warn(`MEMORY EXHAUSTION detected: ${memStats.utilizationPercent}% used | Freeing processes...`);
      this._rebalanceMemory();
    }
  }

  _rebalanceCPU() {
    // Reduce quantum to give more processes a chance
    if (this.quantum > 1) {
      this.quantum = Math.max(1, this.quantum - 1);
      logger.info(`Quantum reduced to ${this.quantum} to reduce CPU contention`);
    }
    this.bottleneckState.lastRebalanced = new Date().toISOString();
  }

  _rebalanceMemory() {
    // Find and stop the lowest-priority, stopped or waiting processes
    const candidates = Array.from(this.processes.values())
      .filter(p => p.status === ProcessStatus.WAITING && p.memoryAllocated > 0)
      .sort((a, b) => b.priority - a.priority); // highest priority number = lowest priority

    if (candidates.length > 0) {
      const victim = candidates[0];
      memoryManager.free(victim.pid);
      victim.memoryAllocated = 0;
      victim.status = ProcessStatus.WAITING;
      this.readyQueue = this.readyQueue.filter(pid => pid !== victim.pid);
      logger.info(`Memory reclaimed from process ${victim.pid} (priority ${victim.priority})`);
    }
    this.bottleneckState.lastRebalanced = new Date().toISOString();
  }

  _getTotalCPUUsage() {
    let total = 0;
    this.processes.forEach(p => { total += p.cpuUsage; });
    return Math.min(100, total);
  }

  _recordHistory() {
    const memStats = memoryManager.getStats();
    const cpuUsage = this._getTotalCPUUsage();
    const ts = Date.now();

    this.cpuUsageHistory.push({ time: ts, value: cpuUsage });
    this.memoryUsageHistory.push({ time: ts, value: memStats.utilizationPercent });

    // Keep only last 60 data points
    if (this.cpuUsageHistory.length > 60) this.cpuUsageHistory.shift();
    if (this.memoryUsageHistory.length > 60) this.memoryUsageHistory.shift();
  }

  // ─── State Getters ───────────────────────────────────────────

  getState() {
    const memStats = memoryManager.getStats();
    const processes = Array.from(this.processes.values()).map(p => ({ ...p, logs: p.logs.slice(-5) }));

    return {
      processes,
      systemStats: {
        cpuUtilization: this._getTotalCPUUsage(),
        memoryStats: memStats,
        algorithm: this.algorithm,
        quantum: this.quantum,
        simulationSpeed: this.simulationSpeed,
        tickCount: this.tickCount,
        completedProcesses: this.completedCount,
        activeProcesses: processes.filter(p => p.status === ProcessStatus.RUNNING).length,
        waitingProcesses: processes.filter(p => p.status === ProcessStatus.WAITING).length,
        readyQueueLength: this.readyQueue.length,
        currentProcess: this.currentProcess,
        isRunning: !!this.simulationTimer,
        bottleneck: this.bottleneckState,
      },
      cpuHistory: this.cpuUsageHistory,
      memoryHistory: this.memoryUsageHistory,
    };
  }

  setAlgorithm(algo) {
    if (Object.values(SchedulingAlgorithm).includes(algo)) {
      this.algorithm = algo;
      logger.info(`Scheduling algorithm changed to: ${algo}`);
      return true;
    }
    return false;
  }

  setSpeed(speedMs) {
    this.simulationSpeed = Math.max(100, Math.min(5000, speedMs));
    if (this.simulationTimer) {
      this.stop();
      this.start();
    }
    logger.info(`Simulation speed set to ${this.simulationSpeed}ms`);
  }

  setQuantum(q) {
    this.quantum = Math.max(1, Math.min(20, q));
    logger.info(`Time quantum set to ${this.quantum}`);
  }

  // ─── WebSocket Broadcast ─────────────────────────────────────

  addListener(fn) { this.listeners.add(fn); }
  removeListener(fn) { this.listeners.delete(fn); }

  broadcast() {
    const state = this.getState();
    this.listeners.forEach(fn => {
      try { fn(state); } catch (e) { /* ignore dead sockets */ }
    });
  }

  // ─── Reset ───────────────────────────────────────────────────

  reset() {
    this.stop();
    this.processes.clear();
    this.readyQueue = [];
    this.currentProcess = null;
    this.quantumCounter = 0;
    this.tickCount = 0;
    this.completedCount = 0;
    this.cpuUsageHistory = [];
    this.memoryUsageHistory = [];
    memoryManager.reset();
    logger.info('System reset');
    this.broadcast();
  }
}

module.exports = { Scheduler: new Scheduler(), SchedulingAlgorithm };
