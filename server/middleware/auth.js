const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const User = require('../models/User');
const i18n = require('../config/i18n');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.noToken')
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists in database
    const session = await Session.findByToken(token);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.invalidSession')
      });
    }
    
    // Check if user is disabled
    const user = await User.findById(decoded.id);
    if (!user) {
      await Session.deleteByToken(token);
      return res.status(401).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.invalidSession')
      });
    }
    
    if (user.disabled) {
      // Delete all sessions for the disabled user
      await Session.deleteByUserId(user.id);
      return res.status(403).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.accountDisabled')
      });
    }
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.invalidToken')
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: i18n.tReq(req, 'auth.errors.tokenExpired')
      });
    }
    return res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'auth.errors.internalError')
    });
  }
};

module.exports = authMiddleware;
