const express = require('express');
const configController = require('../controllers/configController');

const router = express.Router();

// Get application configuration
router.get('/', configController.getConfig);

module.exports = router;
