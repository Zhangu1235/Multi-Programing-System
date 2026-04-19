// models/MemoryManager.js
// Simulates RAM allocation using paging concept

const TOTAL_RAM_MB = 4096; // 4 GB simulated RAM
const PAGE_SIZE_MB = 4;    // 4 MB per page
const TOTAL_PAGES = TOTAL_RAM_MB / PAGE_SIZE_MB; // 1024 pages

class MemoryManager {
  constructor() {
    this.totalMemory = TOTAL_RAM_MB;
    this.pageSize = PAGE_SIZE_MB;
    this.totalPages = TOTAL_PAGES;
    // Page table: index = page number, value = PID or null
    this.pageTable = new Array(TOTAL_PAGES).fill(null);
    // Process page map: PID -> [page numbers]
    this.processPages = new Map();
    this.allocatedMemory = 0;
  }

  /**
   * Allocate memory for a process using paging
   * @param {string} pid - Process ID
   * @param {number} memoryMB - Memory to allocate in MB
   * @returns {boolean} Success status
   */
  allocate(pid, memoryMB) {
    const pagesNeeded = Math.ceil(memoryMB / this.pageSize);
    const freePages = this.getFreePages();

    if (freePages.length < pagesNeeded) {
      return false; // Not enough memory
    }

    // Allocate pages (first-fit strategy)
    const allocatedPages = freePages.slice(0, pagesNeeded);
    allocatedPages.forEach(pageNum => {
      this.pageTable[pageNum] = pid;
    });

    this.processPages.set(pid, allocatedPages);
    this.allocatedMemory += pagesNeeded * this.pageSize;
    return true;
  }

  /**
   * Free memory pages for a process
   * @param {string} pid - Process ID
   */
  free(pid) {
    const pages = this.processPages.get(pid);
    if (!pages) return;

    pages.forEach(pageNum => {
      this.pageTable[pageNum] = null;
    });

    this.allocatedMemory -= pages.length * this.pageSize;
    if (this.allocatedMemory < 0) this.allocatedMemory = 0;
    this.processPages.delete(pid);
  }

  /**
   * Get list of free page indices
   */
  getFreePages() {
    return this.pageTable
      .map((val, idx) => (val === null ? idx : -1))
      .filter(idx => idx !== -1);
  }

  /**
   * Get memory stats
   */
  getStats() {
    const freePages = this.getFreePages().length;
    const usedPages = this.totalPages - freePages;
    return {
      total: this.totalMemory,
      used: usedPages * this.pageSize,
      free: freePages * this.pageSize,
      utilizationPercent: Math.round((usedPages / this.totalPages) * 100),
      totalPages: this.totalPages,
      usedPages,
      freePages,
      pageSize: this.pageSize,
    };
  }

  /**
   * Check if memory is critically low (>90% used)
   */
  isCritical() {
    const stats = this.getStats();
    return stats.utilizationPercent >= 90;
  }

  /**
   * Check if memory is under pressure (>75% used)
   */
  isUnderPressure() {
    const stats = this.getStats();
    return stats.utilizationPercent >= 75;
  }

  /**
   * Get pages allocated to a specific process
   */
  getProcessMemory(pid) {
    const pages = this.processPages.get(pid) || [];
    return pages.length * this.pageSize;
  }

  /**
   * Get full page table snapshot for visualization
   */
  getPageTableSnapshot() {
    return this.pageTable.map((pid, idx) => ({ page: idx, pid }));
  }

  reset() {
    this.pageTable = new Array(TOTAL_PAGES).fill(null);
    this.processPages.clear();
    this.allocatedMemory = 0;
  }
}

module.exports = new MemoryManager();
