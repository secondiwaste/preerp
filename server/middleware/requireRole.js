const i18n = require('../config/i18n');
const Logger = require('../utils/logger');

/**
 * Middleware to check if user has required role/level
 * User levels hierarchy: user < moderator < administrator
 */

const ROLE_HIERARCHY = {
  'user': 1,
  'moderator': 2,
  'administrator': 3
};

/**
 * Check if user has at least the required role level
 * @param {string} requiredRole - Minimum required role ('user', 'moderator', 'administrator')
 * @returns {Function} Express middleware function
 */
const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated (should be checked by authMiddleware first)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: i18n.tReq(req, 'auth.errors.noToken')
        });
      }

      const userRole = req.user.user_level || 'user';
      const userRoleLevel = ROLE_HIERARCHY[userRole] || 1;
      const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 1;

      Logger.debug('RBAC', `User: ${req.user.username}, Level: ${userRole} (${userRoleLevel}), Required: ${requiredRole} (${requiredRoleLevel})`, { consoleOnly: true });

      if (userRoleLevel >= requiredRoleLevel) {
        next();
      } else {
        Logger.warn('RBAC', `Access denied for ${req.user.username} - insufficient privileges`, { consoleOnly: true });
        return res.status(403).json({
          success: false,
          message: i18n.tReq(req, 'auth.errors.insufficientPrivileges')
        });
      }
    } catch (error) {
      Logger.error('RBAC', `Role check error: ${error.message}`, { consoleOnly: true });
      return res.status(500).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.internalError')
      });
    }
  };
};

/**
 * Check if user is administrator
 */
const requireAdmin = requireRole('administrator');

/**
 * Check if user is at least moderator
 */
const requireModerator = requireRole('moderator');

module.exports = {
  requireRole,
  requireAdmin,
  requireModerator,
  ROLE_HIERARCHY
};
