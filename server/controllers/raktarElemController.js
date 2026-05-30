const RaktarElem = require('../models/RaktarElem');
const Logger = require('../utils/logger');
const i18n = require('../config/i18n');

/**
 * Get all elements for a raktar entry
 */
exports.getRaktarElemek = async (req, res) => {
  try {
    const elements = await RaktarElem.findByRaktarId(req.params.raktarId);
    
    res.json({
      success: true,
      data: { elements }
    });
  } catch (error) {
    Logger.error('Error fetching raktar elements:', error);
    res.status(500).json({
      success: false,
      message: i18n.t('common.server_error')
    });
  }
};

/**
 * Create a new raktar element
 */
exports.createRaktarElem = async (req, res) => {
  try {
    const data = {
      ...req.body,
      raktar_id: req.params.raktarId
    };
    
    const element = await RaktarElem.create(data);
    
    Logger.info(`Raktar element created: ${element.id} by user ${req.user.username}`);
    
    res.status(201).json({
      success: true,
      message: i18n.t('raktarElem.created_successfully'),
      data: { element }
    });
  } catch (error) {
    Logger.error('Error creating raktar element:', error);
    res.status(500).json({
      success: false,
      message: i18n.t('common.server_error')
    });
  }
};

/**
 * Update a raktar element
 */
exports.updateRaktarElem = async (req, res) => {
  try {
    const element = await RaktarElem.findById(req.params.id);
    
    if (!element) {
      return res.status(404).json({
        success: false,
        message: i18n.t('raktarElem.not_found')
      });
    }
    
    const updatedElement = await RaktarElem.update(req.params.id, req.body);
    
    Logger.info(`Raktar element updated: ${req.params.id} by user ${req.user.username}`);
    
    res.json({
      success: true,
      message: i18n.t('raktarElem.updated_successfully'),
      data: { element: updatedElement }
    });
  } catch (error) {
    Logger.error('Error updating raktar element:', error);
    res.status(500).json({
      success: false,
      message: i18n.t('common.server_error')
    });
  }
};

/**
 * Delete a raktar element
 */
exports.deleteRaktarElem = async (req, res) => {
  try {
    const element = await RaktarElem.findById(req.params.id);
    
    if (!element) {
      return res.status(404).json({
        success: false,
        message: i18n.t('raktarElem.not_found')
      });
    }
    
    await RaktarElem.deleteById(req.params.id);
    
    Logger.info(`Raktar element deleted: ${req.params.id} by user ${req.user.username}`);
    
    res.json({
      success: true,
      message: i18n.t('raktarElem.deleted_successfully')
    });
  } catch (error) {
    Logger.error('Error deleting raktar element:', error);
    res.status(500).json({
      success: false,
      message: i18n.t('common.server_error')
    });
  }
};
