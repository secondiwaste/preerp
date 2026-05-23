const Log = require('../../models/Log');

// Mock the database pool
jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

const { pool } = require('../../config/database');

describe('Log Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LEVELS constant', () => {
    it('should have correct log levels', () => {
      expect(Log.LEVELS).toEqual({
        ERROR: 'ERROR',
        WARN: 'WARN',
        INFO: 'INFO',
        SUCCESS: 'SUCCESS',
        DEBUG: 'DEBUG'
      });
    });
  });

  describe('create', () => {
    it('should create a log entry with all fields', async () => {
      const mockResult = { insertId: 1 };
      pool.query.mockResolvedValue([mockResult]);

      const logData = {
        level: 'INFO',
        category: 'AUTH',
        message: 'User logged in',
        userId: 1,
        username: 'testuser',
        ipAddress: '192.168.1.1',
        metadata: { action: 'login' }
      };

      const result = await Log.create(logData);

      expect(result).toBe(1);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO logs (level, category, message, user_id, username, ip_address, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['INFO', 'AUTH', 'User logged in', 1, 'testuser', '192.168.1.1', JSON.stringify({ action: 'login' })]
      );
    });

    it('should create a log entry with minimal fields', async () => {
      const mockResult = { insertId: 2 };
      pool.query.mockResolvedValue([mockResult]);

      const logData = {
        level: 'ERROR',
        category: 'SYSTEM',
        message: 'Error occurred'
      };

      const result = await Log.create(logData);

      expect(result).toBe(2);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO logs (level, category, message, user_id, username, ip_address, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['ERROR', 'SYSTEM', 'Error occurred', null, null, null, null]
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated logs without filters', async () => {
      const mockLogs = [
        { id: 1, level: 'INFO', category: 'AUTH', message: 'Test 1', metadata: null },
        { id: 2, level: 'ERROR', category: 'SYSTEM', message: 'Test 2', metadata: null }
      ];

      pool.query
        .mockResolvedValueOnce([[{ total: 2 }]])
        .mockResolvedValueOnce([mockLogs]);

      const result = await Log.findAll({ page: 1, limit: 50 });

      expect(result.logs).toEqual(mockLogs);
      expect(result.pagination).toEqual({
        total: 2,
        page: 1,
        limit: 50,
        totalPages: 1
      });
    });

    it('should filter logs by level', async () => {
      const mockLogs = [
        { id: 1, level: 'ERROR', category: 'SYSTEM', message: 'Error 1', metadata: null }
      ];

      pool.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([mockLogs]);

      const result = await Log.findAll({ page: 1, limit: 50, level: 'ERROR' });

      expect(result.logs).toEqual(mockLogs);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE level = ?'),
        expect.arrayContaining(['ERROR'])
      );
    });

    it('should filter logs by category', async () => {
      pool.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[]]);

      await Log.findAll({ page: 1, limit: 50, category: 'AUTH' });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE category = ?'),
        expect.arrayContaining(['AUTH'])
      );
    });

    it('should filter logs by search text', async () => {
      pool.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[]]);

      await Log.findAll({ page: 1, limit: 50, searchText: 'test' });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('(message LIKE ? OR username LIKE ?)'),
        expect.arrayContaining(['%test%', '%test%'])
      );
    });

    it('should filter logs by date range', async () => {
      pool.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[]]);

      await Log.findAll({ 
        page: 1, 
        limit: 50, 
        startDate: '2024-01-01', 
        endDate: '2024-01-31' 
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DATE(timestamp) >= ?'),
        expect.arrayContaining(['2024-01-01', '2024-01-31'])
      );
    });

    it('should parse JSON metadata', async () => {
      const mockLogs = [
        { id: 1, level: 'INFO', category: 'AUTH', message: 'Test', metadata: '{"key":"value"}' }
      ];

      pool.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([mockLogs]);

      const result = await Log.findAll({ page: 1, limit: 50 });

      expect(result.logs[0].metadata).toEqual({ key: 'value' });
    });
  });

  describe('getCategories', () => {
    it('should return distinct categories', async () => {
      const mockCategories = [
        { category: 'AUTH' },
        { category: 'SYSTEM' },
        { category: 'USER' }
      ];

      pool.query.mockResolvedValue([mockCategories]);

      const result = await Log.getCategories();

      expect(result).toEqual(['AUTH', 'SYSTEM', 'USER']);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT DISTINCT category FROM logs ORDER BY category'
      );
    });
  });

  describe('deleteOlderThan', () => {
    it('should delete logs older than specified days', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 10 }]);

      const result = await Log.deleteOlderThan(30);

      expect(result).toBe(10);
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [30]
      );
    });
  });
});
