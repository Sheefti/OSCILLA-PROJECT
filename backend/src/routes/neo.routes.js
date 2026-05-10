const express = require('express');
const router = express.Router();
const { fetchAsteroids, fetchAsteroidsByBody } = require('../services/nasa.service');

// Corps célestes acceptés + leur clé NASA officielle
// La NASA utilise des abréviations spécifiques dans ses données
const VALID_BODIES = {
  mercury: 'Merc',
  venus:   'Venus',
  earth:   'Earth',
  mars:    'Mars',
  jupiter: 'Juptr',
  saturn:  'Saturn',
  uranus:  'Uranus',
  neptune: 'Neptune',
  moon:    'Moon',
};

/**
 * GET /api/neo
 * Retourne une liste d'astéroïdes formatés (browse général).
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
    next(error);
  }
});

/**
 * GET /api/neo/by-body?body=mars&size=4
 * Retourne les astéroïdes ayant des close approaches avec le corps demandé.
 * Query params:
 *   - body  (string, requis) — ex: earth, mars, jupiter
 *   - size  (number, défaut: 4, max: 20)
 *
 * Exemple: GET /api/neo/by-body?body=mars&size=4
 */
router.get('/by-body', async (req, res, next) => {
  try {
    const rawBody = (req.query.body ?? '').toLowerCase().trim();

    if (!rawBody) {
      return res.status(400).json({
        success: false,
        error: 'Paramètre "body" requis. Valeurs acceptées : ' + Object.keys(VALID_BODIES).join(', '),
      });
    }

    const nasaBody = VALID_BODIES[rawBody];
    if (!nasaBody) {
      return res.status(400).json({
        success: false,
        error: `Corps "${rawBody}" non reconnu. Valeurs acceptées : ${Object.keys(VALID_BODIES).join(', ')}`,
      });
    }

    const size = Math.min(20, Math.max(1, parseInt(req.query.size) || 4));

    const data = await fetchAsteroidsByBody(nasaBody, size);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;