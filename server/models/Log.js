const { pool } = require('../config/database');

class Log {
  // Log levels
  static LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
    DEBUG: 'DEBUG'
  };

  // Create a log entry
  static async create({ level, category, message, userId = null, username = null, ipAddress = null, metadata = null }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO logs (level, category, message, user_id, username, ip_address, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [level, category, message, userId, username, ipAddress, metadata ? JSON.stringify(metadata) : null]
      );
      return result.insertId;
    } catch (error) {
      // If logging to database fails, at least log to console
      console.error('[ERROR] [LOG] Failed to write log to database:', error.message);
      return null;
    }
  }

  // Get logs with pagination and filtering
  static async findAll({ page = 1, limit = 50, level = null, category = null, searchText = null, startDate = null, endDate = null }) {
    try {
      const offset = (page - 1) * limit;
      const conditions = [];
      const params = [];

      if (level) {
        conditions.push('level = ?');
        params.push(level);
      }

      if (category) {
        conditions.push('category = ?');
        params.push(category);
      }

      if (searchText) {
        conditions.push('(message LIKE ? OR username LIKE ?)');
        params.push(`%${searchText}%`, `%${searchText}%`);
      }

      if (startDate) {
        conditions.push('DATE(timestamp) >= ?');
        params.push(startDate);
      }

      if (endDate) {
        conditions.push('DATE(timestamp) <= ?');
        params.push(endDate);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM logs ${whereClause}`,
        params
      );
      const total = countResult[0].total;

      // Get paginated results
      const [rows] = await pool.query(
        `SELECT id, timestamp, level, category, message, user_id, username, ip_address, metadata 
         FROM logs ${whereClause} 
         ORDER BY timestamp DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Parse JSON metadata
      const logs = rows.map(row => ({
        ...row,
        metadata: row.metadata ? JSON.parse(row.metadata) : null
      }));

      return {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[ERROR] [LOG] Failed to fetch logs:', error.message);
      throw error;
    }
  }

  // Get distinct categories
  static async getCategories() {
    try {
      const [rows] = await pool.query(
        'SELECT DISTINCT category FROM logs ORDER BY category'
      );
      return rows.map(row => row.category);
    } catch (error) {
      console.error('[ERROR] [LOG] Failed to fetch categories:', error.message);
      return [];
    }
  }

  // Delete old logs (cleanup)
  static async deleteOlderThan(days) {
    try {
      const [result] = await pool.query(
        'DELETE FROM logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [days]
      );
      return result.affectedRows;
    } catch (error) {
      console.error('[ERROR] [LOG] Failed to delete old logs:', error.message);
      return 0;
    }
  }
}

module.exports = Log;
