const Log = require('../models/Log');

class Logger {
  // Define log level hierarchy (lower number = more verbose)
  static LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    SUCCESS: 2,
    WARN: 3,
    ERROR: 4
  };

  static configuredLevel = null;
  static consoleLoggingDisabled = null;

  // Check if console logging is disabled via environment variable
  static isConsoleLoggingDisabled() {
    if (this.consoleLoggingDisabled === null) {
      this.consoleLoggingDisabled = process.env.DISABLE_CONSOLE_LOGS === 'true';
    }
    return this.consoleLoggingDisabled;
  }

  // Get configured log level from environment
  static getConfiguredLevel() {
    if (this.configuredLevel === null) {
      const envLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
      this.configuredLevel = this.LOG_LEVELS[envLevel] !== undefined 
        ? this.LOG_LEVELS[envLevel] 
        : this.LOG_LEVELS.INFO;
    }
    return this.configuredLevel;
  }

  // Check if message should be logged based on level
  static shouldLog(level) {
    const messageLevel = this.LOG_LEVELS[level] || this.LOG_LEVELS.INFO;
    return messageLevel >= this.getConfiguredLevel();
  }

  // Helper to log both to console and database
  static async log(level, category, message, options = {}) {
    const { userId = null, username = null, ipAddress = null, metadata = null, consoleOnly = false } = options;

    // Log to console only if enabled and level is high enough
    if (!this.isConsoleLoggingDisabled() && this.shouldLog(level)) {
      const prefix = `[${level}]${category ? ` [${category}]` : ''}`;
      const userInfo = username ? ` [${username}]` : '';
      console.log(`${prefix}${userInfo} ${message}`);
      if (metadata) {
        console.log(`${prefix}${userInfo} Metadata:`, metadata);
      }
    }

    // Also log to database unless consoleOnly is true
    if (!consoleOnly) {
      try {
        await Log.create({
          level,
          category,
          message,
          userId,
          username,
          ipAddress,
          metadata
        });
      } catch (error) {
        // Don't throw - logging should never break the app
        // Only show database errors if console logging is enabled
        if (!this.isConsoleLoggingDisabled()) {
          console.error('[ERROR] [LOGGER] Failed to write to database:', error.message);
        }
      }
    }
  }

  static error(category, message, options = {}) {
    return this.log('ERROR', category, message, options);
  }

  static warn(category, message, options = {}) {
    return this.log('WARN', category, message, options);
  }

  static info(category, message, options = {}) {
    return this.log('INFO', category, message, options);
  }

  static success(category, message, options = {}) {
    return this.log('SUCCESS', category, message, options);
  }

  static debug(category, message, options = {}) {
    return this.log('DEBUG', category, message, options);
  }

  // Extract user info from request
  static getUserInfo(req) {
    if (!req) {
      return {
        userId: null,
        username: null,
        ipAddress: null
      };
    }
    return {
      userId: req.user?.id || null,
      username: req.user?.username || null,
      ipAddress: req.ip || req.connection?.remoteAddress || null
    };
  }
}

module.exports = Logger;
