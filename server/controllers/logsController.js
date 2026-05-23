const Log = require('../models/Log');
const i18n = require('../config/i18n');
const Logger = require('../utils/logger');

// Get logs with pagination and filtering
const getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      level,
      category,
      search,
      startDate,
      endDate
    } = req.query;

    const userInfo = Logger.getUserInfo(req);
    Logger.info('LOGS', `Admin ${userInfo.username} accessed logs viewer`, { 
      ...userInfo,
      metadata: { page, limit, level, category, search }
    });

    const result = await Log.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      level,
      category,
      searchText: search,
      startDate,
      endDate
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    const userInfo = Logger.getUserInfo(req);
    Logger.error('LOGS', `Failed to fetch logs: ${error.message}`, {
      ...userInfo,
      metadata: { error: error.stack }
    });

    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'auth.errors.internalError')
    });
  }
};

// Get available log categories
const getCategories = async (req, res) => {
  try {
    const categories = await Log.getCategories();
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    const userInfo = Logger.getUserInfo(req);
    Logger.error('LOGS', `Failed to fetch categories: ${error.message}`, {
      ...userInfo,
      metadata: { error: error.stack }
    });

    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'auth.errors.internalError')
    });
  }
};

module.exports = {
  getLogs,
  getCategories
};
