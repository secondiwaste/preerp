const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireModerator } = require('../middleware/requireRole');
const {
  getBetonozasiNaplo,
  getBetonozasiNaploById,
  createBetonozasiNaplo,
  updateBetonozasiNaplo,
  deleteBetonozasiNaplo,
  getUniqueRendszamok
} = require('../controllers/betonozasiNaploController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get unique rendszamok for autocomplete
router.get('/rendszamok', getUniqueRendszamok);

// Get all betonozasi naplo entries
router.get('/', getBetonozasiNaplo);

// Get a single betonozasi naplo entry
router.get('/:id', getBetonozasiNaploById);

// Create a new betonozasi naplo entry (moderator or admin only)
router.post('/', requireModerator, createBetonozasiNaplo);

// Update a betonozasi naplo entry (moderator or admin only)
router.put('/:id', requireModerator, updateBetonozasiNaplo);

// Delete a betonozasi naplo entry (moderator or admin only)
router.delete('/:id', requireModerator, deleteBetonozasiNaplo);

module.exports = router;
