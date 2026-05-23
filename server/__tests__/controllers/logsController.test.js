// Mock dependencies first, before importing the controller
jest.mock('../../models/Log');
jest.mock('../../config/i18n', () => ({
  tReq: (req, key) => key
}));
jest.mock('../../utils/logger', () => ({
  info: jest.fn(() => Promise.resolve()),
  error: jest.fn(() => Promise.resolve()),
  getUserInfo: () => ({
    userId: 1,
    username: 'admin',
    ipAddress: '192.168.1.1'
  })
}));

const { getLogs, getCategories } = require('../../controllers/logsController');
const Log = require('../../models/Log');
const Logger = require('../../utils/logger');

describe('Logs Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      user: { id: 1, username: 'admin', userlevel: 3 }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
    // Set default mock implementation for Log.findAll
    Log.findAll.mockResolvedValue({
      logs: [],
      pagination: { total: 0, page: 1, limit: 50, totalPages: 0 }
    });
  });

  describe('getLogs', () => {
    it('should return paginated logs with default parameters', async () => {
      const mockResult = {
        logs: [
          { id: 1, level: 'INFO', category: 'AUTH', message: 'Test log' }
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1
        }
      };

      Log.findAll.mockResolvedValue(mockResult);

      await getLogs(req, res);

      expect(Log.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 50,
        level: undefined,
        category: undefined,
        searchText: undefined,
        startDate: undefined,
        endDate: undefined
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
      expect(Logger.info).toHaveBeenCalled();
    });

    it('should apply filters from query parameters', async () => {
      req.query = {
        page: '2',
        limit: '25',
        level: 'ERROR',
        category: 'SYSTEM',
        search: 'test',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      const mockResult = {
        logs: [],
        pagination: {
          total: 0,
          page: 2,
          limit: 25,
          totalPages: 0
        }
      };

      Log.findAll.mockResolvedValue(mockResult);

      await getLogs(req, res);

      expect(Log.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 25,
        level: 'ERROR',
        category: 'SYSTEM',
        searchText: 'test',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });

    it('should handle database errors', async () => {
      Log.findAll.mockRejectedValue(new Error('Database error'));

      await getLogs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.internalError'
      });
      expect(Logger.error).toHaveBeenCalled();
    });

    it('should log admin access with metadata', async () => {
      req.query = {
        page: '1',
        limit: '50',
        level: 'ERROR',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      Log.findAll.mockResolvedValue({
        logs: [],
        pagination: { total: 0, page: 1, limit: 50, totalPages: 0 }
      });

      await getLogs(req, res);

      expect(Logger.info).toHaveBeenCalledWith(
        'LOGS',
        'Admin admin accessed logs viewer',
        expect.objectContaining({
          userId: 1,
          username: 'admin',
          ipAddress: '192.168.1.1',
          metadata: expect.objectContaining({
            page: '1',
            limit: '50',
            level: 'ERROR',
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          })
        })
      );
    });
  });

  describe('getCategories', () => {
    it('should return list of categories', async () => {
      const mockCategories = ['AUTH', 'SYSTEM', 'USER'];
      Log.getCategories.mockResolvedValue(mockCategories);

      await getCategories(req, res);

      expect(Log.getCategories).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { categories: mockCategories }
      });
    });

    it('should handle database errors', async () => {
      Log.getCategories.mockRejectedValue(new Error('Database error'));

      await getCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.internalError'
      });
      expect(Logger.error).toHaveBeenCalled();
    });
  });
});
