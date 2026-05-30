const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin, requireModerator } = require('../middleware/requireRole');
const User = require('../models/User');
const Session = require('../models/Session');
const i18n = require('../config/i18n');
const Logger = require('../utils/logger');

const router = express.Router();

// Protected route example - Get all users
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    Logger.error('API', `Get users error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Protected route example - Get user dashboard data
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        message: `Welcome ${req.user.username}! This is a protected route.`,
        user: req.user
      }
    });
  } catch (error) {
    Logger.error('API', `Dashboard error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin only route - Get all users (requires administrator level)
router.get('/admin/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { search, sortField, sortDirection } = req.query;
    
    const options = {
      search: search || '',
      sortField: sortField || 'id',
      sortDirection: sortDirection || 'asc'
    };
    
    const users = await User.findAll(options);
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    Logger.error('ADMIN', `Get users error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'auth.errors.internalError')
    });
  }
});

// Admin only route - Update user level
router.put('/admin/users/:userId/level', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { user_level } = req.body;

    if (!user_level || !['user', 'moderator', 'administrator'].includes(user_level)) {
      return res.status(400).json({
        success: false,
        message: i18n.tReq(req, 'users.errors.invalidUserLevel')
      });
    }

    // Get user information for logging
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.userNotFound')
      });
    }

    const updated = await User.updateUserLevel(userId, user_level);
    
    if (updated) {
      Logger.info('ADMIN', `User ${user.username} level updated to ${user_level} by ${req.user.username}`, {});
      res.json({
        success: true,
        message: i18n.tReq(req, 'users.success.levelUpdated')
      });
    } else {
      res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.userNotFound')
      });
    }
  } catch (error) {
    Logger.error('ADMIN', `Update user level error: ${error.message}`, {});
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'auth.errors.internalError')
    });
  }
});

// Admin only route - Enable/disable user
router.put('/admin/users/:userId/status', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { disabled } = req.body;

    if (typeof disabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: i18n.tReq(req, 'users.errors.invalidDisabledStatus')
      });
    }

    // Don't allow admins to disable themselves
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: i18n.tReq(req, 'users.errors.cannotDisableSelf')
      });
    }

    // Get user information for logging
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.userNotFound')
      });
    }

    const updated = await User.setDisabledStatus(userId, disabled);
    
    if (updated) {
      // If disabling user, delete all their sessions to log them out immediately
      if (disabled) {
        const deletedSessions = await Session.deleteByUserId(userId);
        Logger.info('ADMIN', `User ${user.username} disabled and ${deletedSessions} session(s) deleted by ${req.user.username}`, {});
      } else {
        Logger.info('ADMIN', `User ${user.username} enabled by ${req.user.username}`, {});
      }
      
      res.json({
        success: true,
        message: disabled ? i18n.tReq(req, 'users.success.userDisabled') : i18n.tReq(req, 'users.success.userEnabled')
      });
    } else {
      res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.userNotFound')
      });
    }
  } catch (error) {
    Logger.error('ADMIN', `Update user status error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'auth.errors.internalError')
    });
  }
});

// Moderator only route - Example moderation endpoint
router.get('/moderator/dashboard', authMiddleware, requireModerator, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        message: `Welcome ${req.user.username}! You have moderator or administrator access.`,
        user: req.user
      }
    });
  } catch (error) {
    Logger.error('MODERATOR', `Dashboard error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'auth.errors.internalError')
    });
  }
});

module.exports = router;
