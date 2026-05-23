// Mock dependencies
jest.mock('../../config/i18n', () => ({
  tReq: (req, key) => key
}));

jest.mock('../../utils/logger', () => ({
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

const { requireRole, requireModerator, requireAdmin } = require('../../middleware/requireRole');

describe('RequireRole Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('requireRole', () => {
    it('should allow user with exact required level', () => {
      req.user = { id: 1, username: 'testuser', user_level: 'moderator' };
      
      requireRole('moderator')(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow user with higher level', () => {
      req.user = { id: 1, username: 'admin', user_level: 'administrator' };
      
      requireRole('user')(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject user with lower level', () => {
      req.user = { id: 1, username: 'testuser', user_level: 'user' };
      
      requireRole('moderator')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.insufficientPrivileges'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject when user not authenticated', () => {
      req.user = null;
      
      requireRole('user')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.noToken'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireModerator', () => {
    it('should allow moderator (level 2)', () => {
      req.user = { id: 1, username: 'moderator', user_level: 'moderator' };
      
      requireModerator(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow admin (level 3)', () => {
      req.user = { id: 1, username: 'admin', user_level: 'administrator' };
      
      requireModerator(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject regular user (level 1)', () => {
      req.user = { id: 1, username: 'user', user_level: 'user' };
      
      requireModerator(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin (level 3)', () => {
      req.user = { id: 1, username: 'admin', user_level: 'administrator' };
      
      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject moderator (level 2)', () => {
      req.user = { id: 1, username: 'moderator', user_level: 'moderator' };
      
      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject regular user (level 1)', () => {
      req.user = { id: 1, username: 'user', user_level: 'user' };
      
      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
