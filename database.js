// ========================================
// DATABASE ABSTRACTION LAYER
// ========================================
// Async-first data storage with race condition prevention

const fs = require("fs").promises;
const path = require("path");
const os = require("os");

/**
 * Database Abstraction Layer
 * Provides async CRUD operations with file locking
 * Ready for migration to PostgreSQL/MongoDB
 */
class Database {
  constructor(dataDir = path.join(__dirname, "data")) {
    this.dataDir = dataDir;
    this.locks = new Map(); // File locks for race condition prevention
    this.cache = new Map(); // In-memory cache
    this.cacheExpiry = 60000; // 60 seconds
    this.initialized = false;
  }

  /**
   * Initialize database directory
   */
  async initialize() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      this.initialized = true;
      console.log("✅ Database initialized at:", this.dataDir);
    } catch (error) {
      console.error("❌ Database initialization failed:", error.message);
      throw error;
    }
  }

  /**
   * Acquire file lock
   */
  async acquireLock(filename) {
    const lockKey = filename;
    
    // Wait if lock exists
    while (this.locks.has(lockKey)) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Acquire lock
    this.locks.set(lockKey, {
      acquired: Date.now(),
      stack: new Error().stack
    });
  }

  /**
   * Release file lock
   */
  releaseLock(filename) {
    this.locks.delete(filename);
  }

  /**
   * Clear cache for file
   */
  clearCache(filename) {
    this.cache.delete(filename);
  }

  /**
   * Get cached data
   */
  getCached(filename) {
    const cached = this.cache.get(filename);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    this.cache.delete(filename);
    return null;
  }

  /**
   * Set cache
   */
  setCached(filename, data) {
    this.cache.set(filename, {
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      timestamp: Date.now()
    });
  }

  /**
   * Read file asynchronously with race condition prevention
   */
  async readFile(filename, defaultValue = []) {
    await this.acquireLock(filename);
    
    try {
      // Check cache first
      const cached = this.getCached(filename);
      if (cached) {
        return cached;
      }

      const filepath = path.join(this.dataDir, filename);
      
      try {
        const data = await fs.readFile(filepath, "utf8");
        const parsed = JSON.parse(data);
        this.setCached(filename, parsed);
        return parsed;
      } catch (error) {
        if (error.code === "ENOENT") {
          // File doesn't exist, create it
          await this.writeFile(filename, defaultValue);
          return defaultValue;
        }
        throw error;
      }
    } finally {
      this.releaseLock(filename);
    }
  }

  /**
   * Write file asynchronously with atomic operation
   */
  async writeFile(filename, data) {
    await this.acquireLock(filename);
    
    try {
      const filepath = path.join(this.dataDir, filename);
      const tempPath = filepath + ".tmp";

      // Write to temporary file first (atomic operation)
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
      
      // Atomic rename
      await fs.rename(tempPath, filepath);
      
      // Clear cache after write
      this.clearCache(filename);
      
      return true;
    } finally {
      this.releaseLock(filename);
    }
  }

  /**
   * Get single record by ID
   */
  async findById(filename, id) {
    const data = await this.readFile(filename, []);
    return data.find(item => item.id === parseInt(id));
  }

  /**
   * Get all records
   */
  async findAll(filename) {
    return await this.readFile(filename, []);
  }

  /**
   * Create new record
   */
  async create(filename, record) {
    await this.acquireLock(filename);
    
    try {
      const data = await this.readFile(filename, []);
      const newRecord = {
        id: Date.now(),
        ...record,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.push(newRecord);
      await this.writeFile(filename, data);
      return newRecord;
    } finally {
      this.releaseLock(filename);
    }
  }

  /**
   * Update record by ID
   */
  async updateById(filename, id, updates) {
    await this.acquireLock(filename);
    
    try {
      const data = await this.readFile(filename, []);
      const index = data.findIndex(item => item.id === parseInt(id));
      
      if (index === -1) {
        throw new Error(`Record not found: ${id}`);
      }
      
      data[index] = {
        ...data[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await this.writeFile(filename, data);
      return data[index];
    } finally {
      this.releaseLock(filename);
    }
  }

  /**
   * Delete record by ID
   */
  async deleteById(filename, id) {
    await this.acquireLock(filename);
    
    try {
      const data = await this.readFile(filename, []);
      const index = data.findIndex(item => item.id === parseInt(id));
      
      if (index === -1) {
        throw new Error(`Record not found: ${id}`);
      }
      
      const deleted = data.splice(index, 1)[0];
      await this.writeFile(filename, data);
      return deleted;
    } finally {
      this.releaseLock(filename);
    }
  }

  /**
   * Filter records
   */
  async filter(filename, predicate) {
    const data = await this.readFile(filename, []);
    return data.filter(predicate);
  }

  /**
   * Count records
   */
  async count(filename) {
    const data = await this.readFile(filename, []);
    return data.length;
  }

  /**
   * Clear all data for a file
   */
  async clear(filename) {
    await this.writeFile(filename, []);
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      const files = await fs.readdir(this.dataDir);
      const stats = {};
      let totalSize = 0;
      let totalRecords = 0;

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filepath = path.join(this.dataDir, file);
          const fileStats = await fs.stat(filepath);
          const data = await this.readFile(file, []);
          stats[file] = {
            size: fileStats.size,
            records: data.length,
            lastModified: fileStats.mtime
          };
          totalSize += fileStats.size;
          totalRecords += data.length;
        }
      }

      return {
        files: stats,
        totalSize,
        totalRecords,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        cacheSize: this.cache.size,
        activeLocks: this.locks.size
      };
    } catch (error) {
      console.error("❌ Stats error:", error.message);
      return null;
    }
  }

  /**
   * Backup database to tar.gz
   */
  async backup(backupDir) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `backup-${timestamp}`);
      
      await fs.mkdir(backupPath, { recursive: true });
      
      const files = await fs.readdir(this.dataDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.copyFile(
            path.join(this.dataDir, file),
            path.join(backupPath, file)
          );
        }
      }
      
      console.log(`✅ Backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error("❌ Backup failed:", error.message);
      throw error;
    }
  }

  /**
   * Export data as JSON
   */
  async exportData() {
    try {
      const files = await fs.readdir(this.dataDir);
      const export_data = {};

      for (const file of files) {
        if (file.endsWith('.json')) {
          const key = file.replace('.json', '');
          export_data[key] = await this.readFile(file, []);
        }
      }

      return export_data;
    } catch (error) {
      console.error("❌ Export failed:", error.message);
      throw error;
    }
  }

  /**
   * Import data from JSON
   */
  async importData(importData) {
    try {
      for (const [key, data] of Object.entries(importData)) {
        if (Array.isArray(data)) {
          await this.writeFile(`${key}.json`, data);
        }
      }
      console.log("✅ Data imported successfully");
      return true;
    } catch (error) {
      console.error("❌ Import failed:", error.message);
      throw error;
    }
  }
}

// ========================================
// INITIALIZE GLOBAL DATABASE
// ========================================

const db = new Database();

// Export for use in server
module.exports = { Database, db };
