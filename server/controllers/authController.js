const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Session = require('../models/Session');
const i18n = require('../config/i18n');
const Logger = require('../utils/logger');
require('dotenv').config();

// Generate JWT token
const generateToken = (userId, username, userLevel) => {
  Logger.debug('AUTH', `Generating token for user: ${username} (ID: ${userId}, Level: ${userLevel})`, { consoleOnly: true });
  try {
    const token = jwt.sign(
      { id: userId, username, user_level: userLevel },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    Logger.debug('AUTH', `Token generated, expires in: ${process.env.JWT_EXPIRES_IN}`, { consoleOnly: true });
    return token;
  } catch (error) {
    Logger.error('AUTH', `Error generating token: ${error.message}`, { consoleOnly: true, metadata: { stack: error.stack } });
    throw error;
  }
};

// Register new user
const register = async (req, res) => {
  Logger.info('AUTH', `Register request received from ${req.ip}`, { consoleOnly: true, metadata: { username: req.body.username } });
  
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      Logger.warn('AUTH', `Register validation failed for ${req.body.username}`, { consoleOnly: true, metadata: { errors: errors.array() } });
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, password } = req.body;
    Logger.debug('AUTH', `Register validation passed for username: ${username}`, { consoleOnly: true });

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      Logger.warn('AUTH', `Register failed - user already exists: ${username}`, { consoleOnly: true });
      return res.status(400).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.usernameExists')
      });
    }

    // Create new user
    const user = await User.create(username, password);
    Logger.info('AUTH', `User created successfully: ${username} (ID: ${user.id})`, { consoleOnly: true });

    // Generate token
    const token = generateToken(user.id, user.username, user.user_level);

    // Save token to database
    await Session.create(user.id, token, process.env.JWT_EXPIRES_IN);
    Logger.success('AUTH', `Registration completed successfully for: ${username}`, { consoleOnly: true });
    res.status(201).json({
      success: true,
      message: i18n.tReq(req, 'auth.success.registered'),
      data: {
        user: {
          id: user.id,
          username: user.username,
          user_level: user.user_level
        },
        token
      }
    });
  } catch (error) {
    Logger.error('AUTH', `Register error: ${error.message}`, { consoleOnly: true, metadata: { name: error.name, code: error.code, stack: error.stack } });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'auth.errors.internalError')
    });
  }
};

// Login user
const login = async (req, res) => {
  Logger.info('AUTH', `Login request received from ${req.ip}`, { consoleOnly: true, metadata: { username: req.body.username } });
  
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      Logger.warn('AUTH', `Login validation failed for ${req.body.username}`, { consoleOnly: true, metadata: { errors: errors.array() } });
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, password } = req.body;
    Logger.debug('AUTH', `Login validation passed for username: ${username}`, { consoleOnly: true });

    // Find user
    const user = await User.findByUsername(username);
    if (!user) {
      Logger.warn('AUTH', `Login failed - user not found: ${username}`, { consoleOnly: true });
      return res.status(401).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.invalidCredentials')
      });
    }
    Logger.debug('AUTH', `User found: ${username} (ID: ${user.id})`, { consoleOnly: true });

    // Verify password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      Logger.warn('AUTH', `Login failed - invalid password for user: ${username}`, { consoleOnly: true });
      return res.status(401).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.invalidCredentials')
      });
    }
    Logger.debug('AUTH', 'Password verified successfully', { consoleOnly: true });

    // Generate token
    const token = generateToken(user.id, user.username, user.user_level);

    // Save token to database
    await Session.create(user.id, token, process.env.JWT_EXPIRES_IN);
    Logger.success('AUTH', `Login successful for user: ${username}`, { consoleOnly: true });
    res.json({
      success: true,
      message: i18n.tReq(req, 'auth.success.loginSuccess'),
      data: {
        user: {
          id: user.id,
          username: user.username,
          user_level: user.user_level
        },
        token
      }
    });
  } catch (error) {
    Logger.error('AUTH', `Login error: ${error.message}`, { consoleOnly: true, metadata: { name: error.name, code: error.code, stack: error.stack } });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'auth.errors.internalError')
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  Logger.debug('AUTH', `Profile request for user: ${req.user?.username} (ID: ${req.user?.id})`, { consoleOnly: true });
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      Logger.warn('AUTH', `Profile not found for user ID: ${req.user.id}`, { consoleOnly: true });
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.userNotFound')
      });
    }

    Logger.debug('AUTH', `Profile retrieved for user: ${user.username}`, { consoleOnly: true });
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    Logger.error('AUTH', `Profile error: ${error.message}`, { consoleOnly: true, metadata: { name: error.name, code: error.code, stack: error.stack } });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'auth.errors.internalError')
    });
  }
};

// Logout user
const logout = async (req, res) => {
  Logger.info('AUTH', `Logout request for user: ${req.user?.username} (ID: ${req.user?.id})`, { consoleOnly: true });
  
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      Logger.warn('AUTH', 'Logout failed - no token provided', { consoleOnly: true });
      return res.status(401).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.noToken')
      });
    }

    const token = authHeader.substring(7);
    
    const deleted = await Session.deleteByToken(token);
    
    if (deleted) {
      Logger.success('AUTH', 'Session deleted successfully', { consoleOnly: true });
      res.json({
        success: true,
        message: i18n.tReq(req, 'auth.success.logoutSuccess')
      });
    } else {
      Logger.debug('AUTH', 'Logout - session not found in database', { consoleOnly: true });
      res.json({
        success: true,
        message: i18n.tReq(req, 'auth.success.logoutSuccess')
      });
    }
  } catch (error) {
    Logger.error('AUTH', `Logout error: ${error.message}`, { consoleOnly: true, metadata: { name: error.name, stack: error.stack } });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'auth.errors.internalError')
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  Logger.info('AUTH', `Change password request for user: ${req.user?.username} (ID: ${req.user?.id})`, { consoleOnly: true });
  
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      Logger.warn('AUTH', 'Change password failed - missing required fields', { consoleOnly: true });
      return res.status(400).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.missingFields')
      });
    }

    if (newPassword.length < 6) {
      Logger.warn('AUTH', 'Change password failed - new password too short', { consoleOnly: true });
      return res.status(400).json({
        success: false,
        message: i18n.tReq(req, 'auth.validation.passwordLength')
      });
    }

    const user = await User.findByIdWithPassword(req.user.id);
    
    if (!user) {
      Logger.warn('AUTH', `Change password failed - user not found: ${req.user.id}`, { consoleOnly: true });
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.userNotFound')
      });
    }

    const isPasswordValid = await User.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      Logger.warn('AUTH', `Change password failed - current password incorrect for user: ${user.username}`, { consoleOnly: true });
      return res.status(401).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.incorrectPassword')
      });
    }

    await User.updatePassword(user.id, newPassword);
    Logger.success('AUTH', `Password updated successfully for user: ${user.username}`, { consoleOnly: true });

    res.json({
      success: true,
      message: i18n.tReq(req, 'auth.success.passwordChanged')
    });
  } catch (error) {
    Logger.error('AUTH', `Change password error: ${error.message}`, { consoleOnly: true, metadata: { name: error.name, stack: error.stack } });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'auth.errors.internalError')
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  changePassword
};
