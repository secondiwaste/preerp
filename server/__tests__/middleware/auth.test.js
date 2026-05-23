const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth');
const User = require('../../models/User');
const Session = require('../../models/Session');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/User');
jest.mock('../../models/Session');
jest.mock('../../config/i18n', () => ({
  tReq: (req, key) => key
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      ip: '192.168.1.1'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('should reject request without authorization header', async () => {
      // No authorization header set

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.noToken'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token format', async () => {
      req.headers.authorization = 'InvalidToken';

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.noToken'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject expired or invalid JWT token', async () => {
      req.headers.authorization = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.invalidToken'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject when session not found', async () => {
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 1, username: 'testuser', user_level: 'user' });
      Session.findByToken.mockResolvedValue(null);

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.invalidSession'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should authenticate valid request', async () => {
      const mockDecoded = {
        id: 1,
        username: 'testuser',
        user_level: 'user'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        user_level: 'user',
        disabled: false
      };

      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue(mockDecoded);
      Session.findByToken.mockResolvedValue({ user_id: 1 });
      User.findById.mockResolvedValue(mockUser);

      await authMiddleware(req, res, next);

      expect(req.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 1, username: 'testuser', user_level: 'user' });
      Session.findByToken.mockRejectedValue(new Error('Database error'));

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.internalError'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
