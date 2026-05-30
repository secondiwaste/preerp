const Elemcsoport = require('../models/Elemcsoport');
const Project = require('../models/Project');
const Logger = require('../utils/Logger');
const i18n = require('../config/i18n');

// Get all elemcsoport for a project
const getElemcsoportok = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'projects.not_found')
      });
    }
    
    const elemcsoportok = await Elemcsoport.findByProjectId(projectId);
    
    const userInfo = Logger.getUserInfo(req);
    Logger.info('ELEMCSOPORT', `Element groups listed for project ${project.munkaszam}`, {
      ...userInfo,
      metadata: { projectId, munkaszam: project.munkaszam, count: elemcsoportok.length }
    });
    
    res.json({
      success: true,
      data: { elemcsoportok }
    });
  } catch (error) {
    Logger.error('ELEMCSOPORT', `Get element groups error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.server_error')
    });
  }
};

// Create new elemcsoport
const createElemcsoport = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { nev } = req.body;
    
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'projects.not_found')
      });
    }
    
    if (!nev || nev.trim() === '') {
      return res.status(400).json({
        success: false,
        message: i18n.tReq(req, 'elemcsoport.name_required')
      });
    }
    
    const elemcsoport = await Elemcsoport.create({
      project_id: projectId,
      nev
    });
    
    const userInfo = Logger.getUserInfo(req);
    Logger.info('ELEMCSOPORT', `Element group created: "${nev}" (ID: ${elemcsoport.id}) for project ${project.munkaszam}`, {
      ...userInfo,
      metadata: { projectId, munkaszam: project.munkaszam, elemcsoportId: elemcsoport.id, nev }
    });
    
    res.status(201).json({
      success: true,
      message: i18n.tReq(req, 'elemcsoport.created_successfully'),
      data: { elemcsoport }
    });
  } catch (error) {
    Logger.error('ELEMCSOPORT', `Create element group error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.server_error')
    });
  }
};

// Update elemcsoport
const updateElemcsoport = async (req, res) => {
  try {
    const { projectId, elemcsoportId } = req.params;
    const { nev } = req.body;
    
    // Check if elemcsoport exists and belongs to the project
    const elemcsoport = await Elemcsoport.findById(elemcsoportId);
    if (!elemcsoport) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'elemcsoport.not_found')
      });
    }
    
    if (elemcsoport.project_id != projectId) {
      return res.status(403).json({
        success: false,
        message: i18n.tReq(req, 'common.forbidden')
      });
    }
    
    // Get project for munkaszám
    const project = await Project.findById(projectId);
    
    if (!nev || nev.trim() === '') {
      return res.status(400).json({
        success: false,
        message: i18n.tReq(req, 'elemcsoport.name_required')
      });
    }
    
    const updatedElemcsoport = await Elemcsoport.update(elemcsoportId, {
      nev
    });
    
    const userInfo = Logger.getUserInfo(req);
    Logger.info('ELEMCSOPORT', `Element group updated: "${nev}" (ID: ${elemcsoportId}) in project ${project.munkaszam}`, {
      ...userInfo,
      metadata: { projectId, munkaszam: project.munkaszam, elemcsoportId, nev }
    });
    
    res.json({
      success: true,
      message: i18n.tReq(req, 'elemcsoport.updated_successfully'),
      data: { elemcsoport: updatedElemcsoport }
    });
  } catch (error) {
    Logger.error('ELEMCSOPORT', `Update element group error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.server_error')
    });
  }
};

// Delete elemcsoport
const deleteElemcsoport = async (req, res) => {
  try {
    const { projectId, elemcsoportId } = req.params;
    
    // Check if elemcsoport exists and belongs to the project
    const elemcsoport = await Elemcsoport.findById(elemcsoportId);
    if (!elemcsoport) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'elemcsoport.not_found')
      });
    }
    
    if (elemcsoport.project_id != projectId) {
      return res.status(403).json({
        success: false,
        message: i18n.tReq(req, 'common.forbidden')
      });
    }
    
    // Get project for munkaszám
    const project = await Project.findById(projectId);
    
    await Elemcsoport.deleteById(elemcsoportId);
    
    const userInfo = Logger.getUserInfo(req);
    Logger.info('ELEMCSOPORT', `Element group deleted: "${elemcsoport.nev}" (ID: ${elemcsoportId}) from project ${project.munkaszam}`, {
      ...userInfo,
      metadata: { projectId, munkaszam: project.munkaszam, elemcsoportId, nev: elemcsoport.nev }
    });
    
    res.json({
      success: true,
      message: i18n.tReq(req, 'elemcsoport.deleted_successfully')
    });
  } catch (error) {
    Logger.error('ELEMCSOPORT', `Delete element group error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'common.server_error')
    });
  }
};

module.exports = {
  getElemcsoportok,
  createElemcsoport,
  updateElemcsoport,
  deleteElemcsoport
};
