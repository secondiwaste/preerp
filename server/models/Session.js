const { pool } = require('../config/database');

class Session {
  // Create a new session
  static async create(userId, token, expiresIn) {
    const expiresAt = new Date(Date.now() + this.parseExpiry(expiresIn));
    
    try {
      const [result] = await pool.query(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      );
      
      return {
        id: result.insertId,
        userId,
        token,
        expiresAt
      };
    } catch (error) {
      // If duplicate token (should be virtually impossible with UUID jti), 
      // just return existing session instead of throwing error
      if (error.code === 'ER_DUP_ENTRY') {
        console.warn('[WARN] [SESSION] Duplicate token detected (rare), returning existing session');
        const existing = await this.findByToken(token);
        if (existing) {
          return {
            id: existing.id,
            userId: existing.user_id,
            token: existing.token,
            expiresAt: existing.expires_at
          };
        }
      }
      console.error('[ERROR] [SESSION] Error creating session:', error);
      throw error;
    }
  }

  // Find session by token
  static async findByToken(token) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()',
        [token]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('[ERROR] [SESSION] Error finding session:', error);
      throw error;
    }
  }

  // Delete session by token (logout)
  static async deleteByToken(token) {
    try {
      const [result] = await pool.query(
        'DELETE FROM sessions WHERE token = ?',
        [token]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[ERROR] [SESSION] Error deleting session:', error);
      throw error;
    }
  }

  // Delete all sessions for a user
  static async deleteByUserId(userId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM sessions WHERE user_id = ?',
        [userId]
      );
      
      return result.affectedRows;
    } catch (error) {
      console.error('[ERROR] [SESSION] Error deleting user sessions:', error);
      throw error;
    }
  }

  // Clean up expired sessions
  static async cleanupExpired() {
    try {
      const [result] = await pool.query(
        'DELETE FROM sessions WHERE expires_at <= NOW()'
      );
      
      if (result.affectedRows > 0) {
        console.log(`[SESSION] Cleaned up ${result.affectedRows} expired sessions`);
      }
      return result.affectedRows;
    } catch (error) {
      console.error('[ERROR] [SESSION] Error cleaning up sessions:', error);
      throw error;
    }
  }

  // Parse expiry string (e.g., "24h", "7d") to milliseconds
  static parseExpiry(expiresIn) {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 24 * 60 * 60 * 1000; // Default 24 hours
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers = {
      s: 1000,           // seconds
      m: 60 * 1000,      // minutes
      h: 60 * 60 * 1000, // hours
      d: 24 * 60 * 60 * 1000 // days
    };
    
    return value * (multipliers[unit] || multipliers.h);
  }
}

module.exports = Session;
