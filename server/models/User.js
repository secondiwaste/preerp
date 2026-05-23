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
        'SELECT id, username, user_level, created_at FROM users WHERE id = ?',
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
        'SELECT id, username, password, user_level, created_at FROM users WHERE id = ?',
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
  static async findAll() {
    try {
      const [rows] = await pool.query(
        'SELECT id, username, user_level, created_at FROM users'
      );
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
}

module.exports = User;
