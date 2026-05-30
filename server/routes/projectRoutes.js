const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireModerator } = require('../middleware/requireRole');
const projectController = require('../controllers/projectController');
const elemcsoportController = require('../controllers/elemcsoportController');
const itemController = require('../controllers/itemController');

const router = express.Router();

// All authenticated users can view projects
router.get('/', authMiddleware, projectController.getProjects);
router.get('/:id', authMiddleware, projectController.getProjectById);

// Only moderators and administrators can create/update/delete projects
router.post('/', authMiddleware, requireModerator, projectController.createProject);
router.put('/:id', authMiddleware, requireModerator, projectController.updateProject);
router.put('/:id/closed', authMiddleware, requireModerator, projectController.toggleProjectClosed);
router.delete('/:id', authMiddleware, requireModerator, projectController.deleteProject);

// Elemcsoport routes - all authenticated users can view, moderators can modify
router.get('/:projectId/elemcsoport', authMiddleware, elemcsoportController.getElemcsoportok);
router.post('/:projectId/elemcsoport', authMiddleware, requireModerator, elemcsoportController.createElemcsoport);
router.put('/:projectId/elemcsoport/:elemcsoportId', authMiddleware, requireModerator, elemcsoportController.updateElemcsoport);
router.delete('/:projectId/elemcsoport/:elemcsoportId', authMiddleware, requireModerator, elemcsoportController.deleteElemcsoport);

// Item routes - all authenticated users can view, moderators can modify
router.get('/:projectId/elemcsoport/:elemcsoportId/items', authMiddleware, itemController.getItems);
router.post('/:projectId/elemcsoport/:elemcsoportId/items', authMiddleware, requireModerator, itemController.createItem);
router.put('/:projectId/elemcsoport/:elemcsoportId/items/:itemId', authMiddleware, requireModerator, itemController.updateItem);
router.delete('/:projectId/elemcsoport/:elemcsoportId/items/:itemId', authMiddleware, requireModerator, itemController.deleteItem);

module.exports = router;
