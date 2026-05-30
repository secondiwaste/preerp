const Project = require('../models/Project');
const i18n = require('../config/i18n');
const Logger = require('../utils/logger');

// Get all projects (accessible by any authenticated user)
const getProjects = async (req, res) => {
  try {
    const { search, sortField, sortDirection, closed } = req.query;
    
    const options = {
      search: search || '',
      sortField: sortField || 'id',
      sortDirection: sortDirection || 'asc',
      closed: closed || 'false'
    };
    
    const projects = await Project.findAll(options);
    
    const userInfo = Logger.getUserInfo(req);
    Logger.info('PROJECT', 'Projects list accessed', {
      ...userInfo,
      metadata: { count: projects.length, search, sortField, sortDirection, closed }
    });
    
    res.json({
      success: true,
      data: { projects }
    });
  } catch (error) {
    Logger.error('PROJECT', `Get projects error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'projects.errors.loadFailed')
    });
  }
};

// Get single project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'projects.errors.notFound')
      });
    }
    
    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    Logger.error('PROJECT', `Get project error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'projects.errors.loadFailed')
    });
  }
};

// Create new project (moderator/admin only)
const createProject = async (req, res) => {
  try {
    const { munkaszam, munka_megnevezes, reszletek, megrendelo_neve, megrendelo_adatai, szallitasi_cim } = req.body;
    
    // Validate required fields
    if (!munkaszam || !munka_megnevezes) {
      return res.status(400).json({
        success: false,
        message: i18n.tReq(req, 'projects.errors.requiredFields')
      });
    }
    
    // Check if munkaszam already exists
    const existing = await Project.findByMunkaszam(munkaszam);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: i18n.tReq(req, 'projects.errors.munkaszamExists')
      });
    }
    
    const project = await Project.create({
      munkaszam,
      munka_megnevezes,
      reszletek,
      megrendelo_neve,
      megrendelo_adatai,
      szallitasi_cim
    }, req.user.id);
    
    const userInfo = Logger.getUserInfo(req);
    Logger.info('PROJECT', `Project created: ${munkaszam}`, {
      ...userInfo,
      metadata: { projectId: project.id, munkaszam }
    });
    
    res.status(201).json({
      success: true,
      message: i18n.tReq(req, 'projects.success.created'),
      data: { project }
    });
  } catch (error) {
    Logger.error('PROJECT', `Create project error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'projects.errors.createFailed')
    });
  }
};

// Update project (moderator/admin only)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { munkaszam, munka_megnevezes, reszletek, megrendelo_neve, megrendelo_adatai, szallitasi_cim } = req.body;
    
    // Validate required fields
    if (!munkaszam || !munka_megnevezes) {
      return res.status(400).json({
        success: false,
        message: i18n.tReq(req, 'projects.errors.requiredFields')
      });
    }
    
    // Check if project exists
    const existing = await Project.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'projects.errors.notFound')
      });
    }
    
    // Check if munkaszam is being changed and if the new one already exists
    if (munkaszam !== existing.munkaszam) {
      const duplicate = await Project.findByMunkaszam(munkaszam);
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: i18n.tReq(req, 'projects.errors.munkaszamExists')
        });
      }
    }
    
    const updated = await Project.update(id, {
      munkaszam,
      munka_megnevezes,
      reszletek,
      megrendelo_neve,
      megrendelo_adatai,
      szallitasi_cim
    });
    
    if (updated) {
      const userInfo = Logger.getUserInfo(req);
      Logger.info('PROJECT', `Project updated: ${munkaszam}`, {
        ...userInfo,
        metadata: { projectId: id, munkaszam }
      });
      
      res.json({
        success: true,
        message: i18n.tReq(req, 'projects.success.updated')
      });
    } else {
      res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'projects.errors.notFound')
      });
    }
  } catch (error) {
    Logger.error('PROJECT', `Update project error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'projects.errors.updateFailed')
    });
  }
};

// Delete project (moderator/admin only)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Project.deleteById(id);
    
    if (deleted) {
      const userInfo = Logger.getUserInfo(req);
      Logger.info('PROJECT', `Project deleted: ID ${id}`, {
        ...userInfo
      });
      
      res.json({
        success: true,
        message: i18n.tReq(req, 'projects.success.deleted')
      });
    } else {
      res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'projects.errors.notFound')
      });
    }
  } catch (error) {
    Logger.error('PROJECT', `Delete project error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'projects.errors.deleteFailed')
    });
  }
};

// Toggle project closed status (moderator/admin only)
const toggleProjectClosed = async (req, res) => {
  try {
    const { id } = req.params;
    const { closed } = req.body;
    
    if (typeof closed !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Closed status must be a boolean'
      });
    }
    
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'projects.errors.notFound')
      });
    }
    
    const updated = await Project.toggleClosed(id, closed);
    
    if (updated) {
      const action = closed ? 'closed' : 'reopened';
      const userInfo = Logger.getUserInfo(req);
      Logger.info('PROJECT', `Project ${action}: ${project.munkaszam}`, {
        ...userInfo,
        metadata: { projectId: id, munkaszam: project.munkaszam, closed }
      });
      
      res.json({
        success: true,
        message: i18n.tReq(req, `projects.success.${action}`)
      });
    } else {
      res.status(404).json({
        success: false,
        message: i18n.tReq(req, 'projects.errors.notFound')
      });
    }
  } catch (error) {
    Logger.error('PROJECT', `Toggle project closed error: ${error.message}`, { consoleOnly: true });
    res.status(500).json({
      success: false,
      message: i18n.tReq(req, 'projects.errors.updateFailed')
    });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectClosed
};
