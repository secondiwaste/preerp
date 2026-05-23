const express = require('express');
const logsController = require('../controllers/logsController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireRole');

const router = express.Router();

// All log routes require authentication and admin privileges
router.get('/', authMiddleware, requireAdmin, logsController.getLogs);
router.get('/categories', authMiddleware, requireAdmin, logsController.getCategories);

module.exports = router;
