const i18n = require('../config/i18n');
const Logger = require('../utils/logger');

// Get application configuration
const getConfig = (req, res) => {
  Logger.debug('CONFIG', 'Configuration requested', { consoleOnly: true });
  
  try {
    const config = {
      defaultLocale: i18n.defaultLocale,
      supportedLocales: i18n.getSupportedLocales(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    Logger.debug('CONFIG', 'Configuration retrieved successfully', { consoleOnly: true, metadata: config });
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    Logger.error('CONFIG', `Error retrieving configuration: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve configuration'
    });
  }
};

module.exports = {
  getConfig
};
