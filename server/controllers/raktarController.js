const Raktar = require('../models/Raktar');
const Logger = require('../utils/logger');
const i18n = require('../config/i18n');

/**
 * Get all raktar entries with optional filters
 */
exports.getRaktar = async (req, res) => {
  try {
    const { sortField, sortDirection, search, year, month } = req.query;
    
    const entries = await Raktar.findAll({
      sortField,
      sortDirection,
      search,
      year: year ? parseInt(year) : null,
      month: month ? parseInt(month) : null
    });
    
    res.json({
      success: true,
      data: { entries }
    });
  } catch (error) {
    Logger.error('Error fetching raktar entries:', error);
    res.status(500).json({
      success: false,
      message: i18n.t('common.server_error')
    });
  }
};

/**
 * Get a single raktar entry by ID
 */
exports.getRaktarById = async (req, res) => {
  try {
    const entry = await Raktar.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: i18n.t('raktar.not_found')
      });
    }
    
    res.json({
      success: true,
      data: { entry }
    });
  } catch (error) {
    Logger.error('Error fetching raktar entry:', error);
    res.status(500).json({
      success: false,
      message: i18n.t('common.server_error')
    });
  }
};

/**
 * Create a new raktar entry
 */
exports.createRaktar = async (req, res) => {
  try {
    const { datum } = req.body;
    
    // Validation - only datum is required
    if (!datum) {
      return res.status(400).json({
        success: false,
        message: i18n.t('raktar.datumRequired')
      });
    }
    
    const entry = await Raktar.create(req.body, req.user.id);
    
    Logger.info(`Raktar entry created: ${entry.id} by user ${req.user.username}`);
    
    res.status(201).json({
      success: true,
      message: i18n.t('raktar.created_successfully'),
      data: { entry }
    });
  } catch (error) {
    Logger.error('Error creating raktar entry:', error);
    res.status(500).json({
      success: false,
      message: i18n.t('common.server_error')
    });
  }
};

/**
 * Update a raktar entry
 */
exports.updateRaktar = async (req, res) => {
  try {
    const entry = await Raktar.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: i18n.t('raktar.not_found')
      });
    }
    
    const updatedEntry = await Raktar.update(req.params.id, req.body);
    
    Logger.info(`Raktar entry updated: ${req.params.id} by user ${req.user.username}`);
    
    res.json({
      success: true,
      message: i18n.t('raktar.updated_successfully'),
      data: { entry: updatedEntry }
    });
  } catch (error) {
    Logger.error('Error updating raktar entry:', error);
    res.status(500).json({
      success: false,
      message: i18n.t('common.server_error')
    });
  }
};

/**
 * Delete a raktar entry
 */
exports.deleteRaktar = async (req, res) => {
  try {
    const entry = await Raktar.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: i18n.t('raktar.not_found')
      });
    }
    
    await Raktar.deleteById(req.params.id);
    
    Logger.info(`Raktar entry deleted: ${req.params.id} by user ${req.user.username}`);
    
    res.json({
      success: true,
      message: i18n.t('raktar.deleted_successfully')
    });
  } catch (error) {
    Logger.error('Error deleting raktar entry:', error);
    res.status(500).json({
      success: false,
      message: i18n.t('common.server_error')
    });
  }
};
