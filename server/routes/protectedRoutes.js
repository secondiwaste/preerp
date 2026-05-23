const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin, requireModerator } = require('../middleware/requireRole');
const User = require('../models/User');
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
    const users = await User.findAll();
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
        message: 'Invalid user level. Must be: user, moderator, or administrator'
      });
    }

    const updated = await User.updateUserLevel(userId, user_level);
    
    if (updated) {
      Logger.info('ADMIN', `User ${userId} level updated to ${user_level} by ${req.user.username}`, { consoleOnly: true });
      res.json({
        success: true,
        message: 'User level updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.userNotFound')
      });
    }
  } catch (error) {
    Logger.error('ADMIN', `Update user level error: ${error.message}`, { consoleOnly: true });
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
