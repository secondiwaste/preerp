const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { register, login, getProfile, logout, changePassword } = require('../../controllers/authController');
const User = require('../../models/User');
const Session = require('../../models/Session');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/User');
jest.mock('../../models/Session');
jest.mock('../../config/i18n', () => ({
  tReq: (req, key) => key
}));
jest.mock('../../utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));
jest.mock('express-validator', () => ({
  body: jest.fn(() => ({
    notEmpty: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis()
  })),
  validationResult: jest.fn(() => ({
    isEmpty: jest.fn(() => true),
    array: jest.fn(() => [])
  }))
}));

const { validationResult } = require('express-validator');
const Logger = require('../../utils/logger');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: null,
      ip: '192.168.1.1',
      headers: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '24h';
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = { username: 'testuser', password: 'password123' };
      
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });
      
      User.findByUsername.mockResolvedValue(null);
      User.create.mockResolvedValue({ id: 1, username: 'testuser', user_level: 1 });
      jwt.sign.mockReturnValue('test-token');
      Session.create.mockResolvedValue(1);

      await register(req, res);

      expect(User.create).toHaveBeenCalledWith('testuser', 'password123');
      expect(Session.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'auth.success.registered',
        data: expect.objectContaining({
          user: expect.any(Object),
          token: 'test-token'
        })
      });
    });

    it('should reject registration with validation errors', async () => {
      req.body = { username: '', password: '123' };
      
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Validation error' }]
      });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: 'Validation error' }]
      });
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should reject registration if username already exists', async () => {
      req.body = { username: 'existinguser', password: 'password123' };
      
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });
      
      User.findByUsername.mockResolvedValue({ id: 1, username: 'existinguser' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.usernameExists'
      });
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      req.body = { username: 'testuser', password: 'password123' };
      
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });
      
      User.findByUsername.mockRejectedValue(new Error('Database error'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.internalError'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      req.body = { username: 'testuser', password: 'password123' };
      
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        user_level: 1
      };

      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });
      
      User.findByUsername.mockResolvedValue(mockUser);
      User.comparePassword.mockResolvedValue(true);
      jwt.sign.mockReturnValue('test-token');
      Session.create.mockResolvedValue(1);

      await login(req, res);

      expect(User.comparePassword).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(Session.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'auth.success.loginSuccess',
        data: expect.objectContaining({
          user: expect.objectContaining({
            id: 1,
            username: 'testuser',
            user_level: 1
          }),
          token: 'test-token'
        })
      });
    });

    it('should reject login with invalid username', async () => {
      req.body = { username: 'nonexistent', password: 'password123' };
      
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });
      
      User.findByUsername.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.invalidCredentials'
      });
    });

    it('should reject login with invalid password', async () => {
      req.body = { username: 'testuser', password: 'wrongpassword' };
      
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        user_level: 1
      };

      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });
      
      User.findByUsername.mockResolvedValue(mockUser);
      User.comparePassword.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.invalidCredentials'
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      req.user = { id: 1, username: 'testuser' };
      
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        userlevel: 1
      };

      User.findById.mockResolvedValue(mockUser);

      await getProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser }
      });
    });

    it('should return 404 if user not found', async () => {
      req.user = { id: 999, username: 'nonexistent' };
      
      User.findById.mockResolvedValue(null);

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.userNotFound'
      });
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      req.user = { id: 1, username: 'testuser' };
      req.headers.authorization = 'Bearer test-token';
      
      Session.deleteByToken.mockResolvedValue(true);

      await logout(req, res);

      expect(Session.deleteByToken).toHaveBeenCalledWith('test-token');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'auth.success.logoutSuccess'
      });
    });

    it('should reject logout without token', async () => {
      req.user = { id: 1, username: 'testuser' };
      req.headers.authorization = null;

      await logout(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.noToken'
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      req.user = { id: 1, username: 'testuser' };
      req.body = { currentPassword: 'oldpassword', newPassword: 'newpassword123' };
      
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedoldpassword'
      };

      User.findByIdWithPassword.mockResolvedValue(mockUser);
      User.comparePassword.mockResolvedValue(true);
      User.updatePassword.mockResolvedValue();

      await changePassword(req, res);

      expect(User.comparePassword).toHaveBeenCalledWith('oldpassword', 'hashedoldpassword');
      expect(User.updatePassword).toHaveBeenCalledWith(1, 'newpassword123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'auth.success.passwordChanged'
      });
    });

    it('should reject change password with missing fields', async () => {
      req.user = { id: 1, username: 'testuser' };
      req.body = { currentPassword: 'oldpassword' };

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.missingFields'
      });
    });

    it('should reject change password with short new password', async () => {
      req.user = { id: 1, username: 'testuser' };
      req.body = { currentPassword: 'oldpassword', newPassword: '123' };

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.validation.passwordLength'
      });
    });

    it('should reject change password with incorrect current password', async () => {
      req.user = { id: 1, username: 'testuser' };
      req.body = { currentPassword: 'wrongpassword', newPassword: 'newpassword123' };
      
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedoldpassword'
      };

      User.findByIdWithPassword.mockResolvedValue(mockUser);
      User.comparePassword.mockResolvedValue(false);

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'auth.errors.incorrectPassword'
      });
      expect(User.updatePassword).not.toHaveBeenCalled();
    });
  });
});
