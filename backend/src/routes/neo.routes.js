const express = require('express');
const router = express.Router();
const { fetchAsteroids } = require('../services/nasa.service');

/**
 * GET /api/neo
 * Retourne une liste d'astéroïdes formatés.
 * Query params:
 *   - page (number, défaut: 0)
 *   - size (number, défaut: 20, max: 20)
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(0, parseInt(req.query.page) || 0);
    const size = Math.min(20, Math.max(1, parseInt(req.query.size) || 20));

    const data = await fetchAsteroids(page, size);
    res.json({ success: true, data });
  } catch (error) {
    next(error); // Transmis au middleware d'erreur global
  }
});

module.exports = router;