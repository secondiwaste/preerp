const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Find user by username
  static async findByUsername(username) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT id, username, user_level, disabled, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID with password (for password change)
  static async findByIdWithPassword(id) {
    try {
      const [rows] = await pool.query(
        'SELECT id, username, password, user_level, disabled, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new user
  static async create(username, password, userLevel = 'user') {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [result] = await pool.query(
        'INSERT INTO users (username, password, user_level) VALUES (?, ?, ?)',
        [username, hashedPassword, userLevel]
      );

      return {
        id: result.insertId,
        username,
        user_level: userLevel
      };
    } catch (error) {
      throw error;
    }
  }

  // Compare password
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get all users (without passwords)
  static async findAll(options = {}) {
    try {
      const { search = '', sortField = 'id', sortDirection = 'asc' } = options;
      
      // Validate sortField to prevent SQL injection
      const allowedSortFields = ['id', 'username', 'user_level', 'disabled', 'created_at'];
      const field = allowedSortFields.includes(sortField) ? sortField : 'id';
      
      // Validate sortDirection
      const direction = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      
      let query = 'SELECT id, username, user_level, disabled, created_at FROM users';
      const params = [];
      
      if (search) {
        query += ' WHERE username LIKE ?';
        params.push(`%${search}%`);
      }
      
      query += ` ORDER BY ${field} ${direction}`;
      
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update user level (admin only)
  static async updateUserLevel(userId, newLevel) {
    try {
      const validLevels = ['user', 'moderator', 'administrator'];
      if (!validLevels.includes(newLevel)) {
        throw new Error('Invalid user level');
      }

      const [result] = await pool.query(
        'UPDATE users SET user_level = ? WHERE id = ?',
        [newLevel, userId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update user password
  static async updatePassword(userId, newPassword) {
    try {
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const [result] = await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete user by ID
  static async deleteById(userId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Set user disabled status
  static async setDisabledStatus(userId, disabled) {
    try {
      const [result] = await pool.query(
        'UPDATE users SET disabled = ? WHERE id = ?',
        [disabled, userId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
