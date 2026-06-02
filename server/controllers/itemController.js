const Item = require('../models/Item');
const Elemcsoport = require('../models/Elemcsoport');
const Project = require('../models/Project');
const Logger = require('../utils/logger');
const i18n = require('../config/i18n');

// Get all items for an elemcsoport
const getItems = async (req, res) => {
  try {
    const { elemcsoportId } = req.params;
    
    // Check if elemcsoport exists
    const elemcsoport = await Elemcsoport.findById(elemcsoportId);
    if (!elemcsoport) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'elemcsoport.not_found')
      });
    }
    
    // Get project for munkaszám
    const project = await Project.findById(elemcsoport.project_id);
    
    const items = await Item.findByElemcsoportId(elemcsoportId);
    
    const userInfo = Logger.getUserInfo(req);
    Logger.info('ITEM', `Items listed for element group ${project.munkaszam} - ${elemcsoport.nev}`, {
      ...userInfo,
      metadata: { elemcsoportId, projectId: project.id, munkaszam: project.munkaszam, elemcsoportNev: elemcsoport.nev, count: items.length }
    });
    
    res.json({
      success: true,
      data: { items }
    });
  } catch (error) {
    Logger.error('ITEM', `Get items error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.server_error')
    });
  }
};

// Create new item
const createItem = async (req, res) => {
  try {
    const { elemcsoportId } = req.params;
    const { elemjel, megjegyzes, keszul, szelesseg, hosszusag, magassag } = req.body;
    
    // Check if elemcsoport exists
    const elemcsoport = await Elemcsoport.findById(elemcsoportId);
    if (!elemcsoport) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'elemcsoport.not_found')
      });
    }
    
    // Get project for munkaszám
    const project = await Project.findById(elemcsoport.project_id);
    
    const item = await Item.create({
      elemcsoport_id: elemcsoportId,
      elemjel,
      megjegyzes,
      keszul,
      szelesseg,
      hosszusag,
      magassag
    });
    
    const userInfo = Logger.getUserInfo(req);
    Logger.info('ITEM', `Item created: ${elemjel || '(empty)'} (ID: ${item.id}) in element group ${project.munkaszam} - ${elemcsoport.nev}`, {
      ...userInfo,
      metadata: { elemcsoportId, projectId: project.id, munkaszam: project.munkaszam, elemcsoportNev: elemcsoport.nev, itemId: item.id, elemjel }
    });
    
    res.status(201).json({
      success: true,
      message: i18n.tReq(req, 'item.created_successfully'),
      data: { item }
    });
  } catch (error) {
    Logger.error('ITEM', `Create item error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.server_error')
    });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const { elemcsoportId, itemId } = req.params;
    const { elemjel, megjegyzes, keszul, szelesseg, hosszusag, magassag } = req.body;
    
    // Check if item exists and belongs to the elemcsoport
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'item.not_found')
      });
    }
    
    if (item.elemcsoport_id != elemcsoportId) {
      return res.status(403).json({
        success: false,
        message: i18n.tReq(req, 'common.forbidden')
      });
    }
    
    // Get elemcsoport and project for better logging
    const elemcsoport = await Elemcsoport.findById(elemcsoportId);
    const project = await Project.findById(elemcsoport.project_id);
    
    // Only include fields that were actually sent in the request
    const updateData = {};
    if (elemjel !== undefined) updateData.elemjel = elemjel;
    if (megjegyzes !== undefined) updateData.megjegyzes = megjegyzes;
    if (keszul !== undefined) updateData.keszul = keszul;
    if (szelesseg !== undefined) updateData.szelesseg = szelesseg;
    if (hosszusag !== undefined) updateData.hosszusag = hosszusag;
    if (magassag !== undefined) updateData.magassag = magassag;
    
    const updatedItem = await Item.update(itemId, updateData);
    
    // Get field names that were updated for logging
    const updatedFields = Object.keys(updateData).join(', ');
    
    const userInfo = Logger.getUserInfo(req);
    Logger.info('ITEM', `Item updated: ${updatedItem.elemjel || '(empty)'} (ID: ${itemId}) - fields: ${updatedFields} - in element group ${project.munkaszam} - ${elemcsoport.nev}`, {
      ...userInfo,
      metadata: { elemcsoportId, projectId: project.id, munkaszam: project.munkaszam, elemcsoportNev: elemcsoport.nev, itemId, updatedFields, elemjel: updatedItem.elemjel }
    });
    
    res.json({
      success: true,
      message: i18n.tReq(req, 'item.updated_successfully'),
      data: { item: updatedItem }
    });
  } catch (error) {
    Logger.error('ITEM', `Update item error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.server_error')
    });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const { elemcsoportId, itemId } = req.params;
    
    // Check if item exists and belongs to the elemcsoport
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'item.not_found')
      });
    }
    
    if (item.elemcsoport_id != elemcsoportId) {
      return res.status(403).json({
        success: false,
        message: i18n.tReq(req, 'common.forbidden')
      });
    }
    
    // Get elemcsoport and project for better logging
    const elemcsoport = await Elemcsoport.findById(elemcsoportId);
    const project = await Project.findById(elemcsoport.project_id);
    
    await Item.deleteById(itemId);
    
    const userInfo = Logger.getUserInfo(req);
    Logger.info('ITEM', `Item deleted: ID ${itemId} from element group ${project.munkaszam} - ${elemcsoport.nev}`, {
      ...userInfo,
      metadata: { elemcsoportId, projectId: project.id, munkaszam: project.munkaszam, elemcsoportNev: elemcsoport.nev, itemId }
    });
    
    res.json({
      success: true,
      message: i18n.tReq(req, 'item.deleted_successfully')
    });
  } catch (error) {
    Logger.error('ITEM', `Delete item error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.server_error')
    });
  }
};

module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem
};
