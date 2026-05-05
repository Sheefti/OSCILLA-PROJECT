const axios = require('axios');
const { NASA_API_KEY, NASA_BASE_URL } = require('../config');

/**
 * Formate un objet NEO brut de la NASA en objet propre pour le frontend.
 * @param {Object} neo - Objet NEO brut de l'API NASA
 * @returns {Object} - Objet formaté
 */
const formatNeo = (neo) => {
  const diameter = neo.estimated_diameter?.kilometers;
  const closeApproaches = neo.close_approach_data ?? [];
  const closeApproach = closeApproaches[0]; // première approche pour les stats

  // Tous les corps célestes uniques associés à cet astéroïde
  const orbitingBodies = [
    ...new Set(closeApproaches.map((ca) => ca.orbiting_body).filter(Boolean)),
  ];

  return {
    id: neo.id,
    name: neo.name.replace(/[()]/g, '').trim(),
    isHazardous: neo.is_potentially_hazardous_asteroid,
    diameterKm: {
      min: parseFloat(diameter?.estimated_diameter_min?.toFixed(3) ?? 0),
      max: parseFloat(diameter?.estimated_diameter_max?.toFixed(3) ?? 0),
    },
    velocity: {
      kmPerHour: parseFloat(
        parseFloat(closeApproach?.relative_velocity?.kilometers_per_hour ?? 0).toFixed(2)
      ),
    },
    missDistance: {
      km: parseFloat(
        parseFloat(closeApproach?.miss_distance?.kilometers ?? 0).toFixed(0)
      ),
      lunar: parseFloat(
        parseFloat(closeApproach?.miss_distance?.lunar ?? 0).toFixed(2)
      ),
    },
    closeApproachDate: closeApproach?.close_approach_date ?? null,
    orbitingBodies,
    nasaUrl: neo.nasa_jpl_url,
  };
};

/**
 * Récupère une page d'astéroïdes depuis l'API NASA NeoWS Browse.
 * @param {number} page - Numéro de page (commence à 0)
 * @param {number} size - Nombre d'éléments par page (max 20)
 */
const fetchAsteroids = async (page = 0, size = 20) => {
  const response = await axios.get(`${NASA_BASE_URL}/neo/browse`, {
    params: {
      api_key: NASA_API_KEY,
      page,
      size,
    },
    timeout: 10000,
  });

  const raw = response.data;

  return {
    page: raw.page,
    asteroids: raw.near_earth_objects.map(formatNeo),
  };
};

module.exports = { fetchAsteroids };