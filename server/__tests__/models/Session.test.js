const Session = require('../../models/Session');

// Mock the database pool
jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

const { pool } = require('../../config/database');

describe('Session Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new session', async () => {
      const mockResult = { insertId: 1 };
      pool.query.mockResolvedValue([mockResult]);

      const result = await Session.create(1, 'test-token', '24h');

      expect(result).toMatchObject({
        id: 1,
        userId: 1,
        token: 'test-token'
      });
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        expect.arrayContaining([1, 'test-token', expect.any(Date)])
      );
    });

    it('should throw error on database failure', async () => {
      // Suppress console.error for this test since we're intentionally triggering an error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(
        Session.create(1, 'test-token', '24h')
      ).rejects.toThrow('Database error');
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('findByToken', () => {
    it('should return session by token', async () => {
      const mockSession = {
        id: 1,
        user_id: 1,
        token: 'test-token',
        expires_at: new Date(Date.now() + 86400000)
      };

      pool.query.mockResolvedValue([[mockSession]]);

      const result = await Session.findByToken('test-token');

      expect(result).toEqual(mockSession);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()',
        ['test-token']
      );
    });

    it('should return null if session not found', async () => {
      pool.query.mockResolvedValue([[]]);

      const result = await Session.findByToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('deleteByToken', () => {
    it('should delete session by token and return true', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await Session.deleteByToken('test-token');

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM sessions WHERE token = ?',
        ['test-token']
      );
    });

    it('should return false if no session deleted', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 0 }]);

      const result = await Session.deleteByToken('invalid-token');

      expect(result).toBe(false);
    });
  });

  describe('deleteByUserId', () => {
    it('should delete all sessions for a user', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 3 }]);

      const result = await Session.deleteByUserId(1);

      expect(result).toBe(3);
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM sessions WHERE user_id = ?',
        [1]
      );
    });
  });

  describe('cleanupExpired', () => {
    it('should delete expired sessions', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 5 }]);
      // Mock console.log to avoid output in tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await Session.cleanupExpired();

      expect(result).toBe(5);
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM sessions WHERE expires_at <= NOW()'
      );
      expect(consoleSpy).toHaveBeenCalledWith('[SESSION] Cleaned up 5 expired sessions');
      
      consoleSpy.mockRestore();
    });

    it('should not log when no sessions expired', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 0 }]);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await Session.cleanupExpired();

      expect(result).toBe(0);
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('parseExpiry', () => {
    it('should parse seconds correctly', () => {
      expect(Session.parseExpiry('30s')).toBe(30 * 1000);
    });

    it('should parse minutes correctly', () => {
      expect(Session.parseExpiry('15m')).toBe(15 * 60 * 1000);
    });

    it('should parse hours correctly', () => {
      expect(Session.parseExpiry('24h')).toBe(24 * 60 * 60 * 1000);
    });

    it('should parse days correctly', () => {
      expect(Session.parseExpiry('7d')).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it('should default to 24 hours for invalid format', () => {
      expect(Session.parseExpiry('invalid')).toBe(24 * 60 * 60 * 1000);
    });
  });
});
