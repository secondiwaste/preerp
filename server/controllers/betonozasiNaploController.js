const BetonozasiNaplo = require('../models/BetonozasiNaplo');
const Logger = require('../utils/logger');
const i18n = require('../config/i18n');

/**
 * Get all betonozasi naplo entries
 */
const getBetonozasiNaplo = async (req, res) => {
  try {
    const { sortField, sortDirection, search, year, month } = req.query;
    
    const options = {
      sortField: sortField || 'datum',
      sortDirection: sortDirection || 'DESC',
      search: search || null,
      year: year ? parseInt(year, 10) : null,
      month: month ? parseInt(month, 10) : null
    };
    
    const entries = await BetonozasiNaplo.findAll(options);
    
    const userInfo = Logger.getUserInfo(req);
    Logger.info('BETONOZASI_NAPLO', 'Betonozasi naplo list accessed', {
      ...userInfo,
      metadata: { count: entries.length, search, sortField, sortDirection, year, month }
    });
    
    res.json({
      success: true,
      data: { entries }
    });
  } catch (error) {
    Logger.error('BETONOZASI_NAPLO', `Get betonozasi naplo error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.error')
    });
  }
};

/**
 * Get a single betonozasi naplo entry by ID
 */
const getBetonozasiNaploById = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await BetonozasiNaplo.findById(id);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'betonozasiNaplo.not_found')
      });
    }
    
    res.json({
      success: true,
      data: { entry }
    });
  } catch (error) {
    Logger.error('BETONOZASI_NAPLO', `Get betonozasi naplo by ID error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.error')
    });
  }
};

/**
 * Create a new betonozasi naplo entry
 */
const createBetonozasiNaplo = async (req, res) => {
  try {
    const entry = await BetonozasiNaplo.create(req.body, req.user.id);
    
    const userInfo = Logger.getUserInfo(req);
    Logger.info('BETONOZASI_NAPLO', `Betonozasi naplo entry created: ${entry.datum}`, {
      ...userInfo,
      metadata: { entryId: entry.id, datum: entry.datum }
    });
    
    res.status(201).json({
      success: true,
      message: i18n.tReq(req, 'betonozasiNaplo.created_successfully'),
      data: { entry }
    });
  } catch (error) {
    Logger.error('BETONOZASI_NAPLO', `Create betonozasi naplo error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.error')
    });
  }
};

/**
 * Update a betonozasi naplo entry
 */
const updateBetonozasiNaplo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingEntry = await BetonozasiNaplo.findById(id);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'betonozasiNaplo.not_found')
      });
    }
    
    const entry = await BetonozasiNaplo.update(id, req.body);
    
    const userInfo = Logger.getUserInfo(req);
    Logger.info('BETONOZASI_NAPLO', `Betonozasi naplo entry updated: ${entry.datum}`, {
      ...userInfo,
      metadata: { entryId: id, datum: entry.datum }
    });
    
    res.json({
      success: true,
      message: i18n.tReq(req, 'betonozasiNaplo.updated_successfully'),
      data: { entry }
    });
  } catch (error) {
    Logger.error('BETONOZASI_NAPLO', `Update betonozasi naplo error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.error')
    });
  }
};

/**
 * Delete a betonozasi naplo entry
 */
const deleteBetonozasiNaplo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingEntry = await BetonozasiNaplo.findById(id);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'betonozasiNaplo.not_found')
      });
    }
    
    const deleted = await BetonozasiNaplo.deleteById(id);
    
    if (deleted) {
      const userInfo = Logger.getUserInfo(req);
      Logger.info('BETONOZASI_NAPLO', `Betonozasi naplo entry deleted: ID ${id}`, {
        ...userInfo,
        metadata: { entryId: id, datum: existingEntry.datum }
      });
      
      res.json({
        success: true,
        message: i18n.tReq(req, 'betonozasiNaplo.deleted_successfully')
      });
    } else {
      res.status(500).json({
        success: false,
        message: i18n.tReq(req, 'common.error')
      });
    }
  } catch (error) {
    Logger.error('BETONOZASI_NAPLO', `Delete betonozasi naplo error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.error')
    });
  }
};

/**
 * Get unique rendszam values for autocomplete
 */
const getUniqueRendszamok = async (req, res) => {
  try {
    const rendszamok = await BetonozasiNaplo.getUniqueRendszamok();
    
    res.json({
      success: true,
      data: { rendszamok }
    });
  } catch (error) {
    Logger.error('BETONOZASI_NAPLO', `Get unique rendszamok error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.error')
    });
  }
};

module.exports = {
  getBetonozasiNaplo,
  getBetonozasiNaploById,
  createBetonozasiNaplo,
  updateBetonozasiNaplo,
  deleteBetonozasiNaplo,
  getUniqueRendszamok
};
