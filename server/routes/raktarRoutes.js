const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireModerator } = require('../middleware/requireRole');
const {
  getRaktar,
  getRaktarById,
  createRaktar,
  updateRaktar,
  deleteRaktar
} = require('../controllers/raktarController');
const {
  getRaktarElemek,
  createRaktarElem,
  updateRaktarElem,
  deleteRaktarElem
} = require('../controllers/raktarElemController');

// All routes require authentication
router.use(authMiddleware);

// Routes
router.get('/', getRaktar);
router.get('/:id', getRaktarById);
router.post('/', requireModerator, createRaktar);
router.put('/:id', requireModerator, updateRaktar);
router.delete('/:id', requireModerator, deleteRaktar);

// Raktar elem routes
router.get('/:raktarId/elemek', getRaktarElemek);
router.post('/:raktarId/elemek', requireModerator, createRaktarElem);
router.put('/:raktarId/elemek/:id', requireModerator, updateRaktarElem);
router.delete('/:raktarId/elemek/:id', requireModerator, deleteRaktarElem);

module.exports = router;
