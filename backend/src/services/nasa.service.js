const axios = require('axios');
const { NASA_API_KEY, NASA_BASE_URL } = require('../config');

/**
 * Formate un objet NEO brut de la NASA en objet propre pour le frontend.
 * @param {Object} neo - Objet NEO brut de l'API NASA
 * @param {string|null} targetBody - Corps céleste de référence pour filtrer les close approaches
 * @returns {Object} - Objet formaté
 */
const formatNeo = (neo, targetBody = null) => {
  const diameter = neo.estimated_diameter?.kilometers;
  const closeApproaches = neo.close_approach_data ?? [];

  // Si un corps cible est précisé, on priorise ses données d'approche
  let closeApproach;
  if (targetBody) {
    const normalized = targetBody.toLowerCase();
    closeApproach =
      closeApproaches.find(
        (ca) => ca.orbiting_body?.toLowerCase() === normalized
      ) ?? closeApproaches[0];
  } else {
    closeApproach = closeApproaches[0];
  }

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
      // L'API retourne en km/h, on convertit en km/s pour l'affichage
      kmPerSecond: parseFloat(
        (parseFloat(closeApproach?.relative_velocity?.kilometers_per_hour ?? 0) / 3600).toFixed(3)
      ),
      kmPerHour: parseFloat(
        parseFloat(closeApproach?.relative_velocity?.kilometers_per_hour ?? 0).toFixed(2)
      ),
    },
    missDistance: {
      km: parseFloat(
        parseFloat(closeApproach?.miss_distance?.kilometers ?? 0).toFixed(0)
      ),
      au: parseFloat(
        parseFloat(closeApproach?.miss_distance?.astronomical ?? 0).toFixed(6)
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
    params: { api_key: NASA_API_KEY, page, size },
    timeout: 10000,
  });

  const raw = response.data;
  return {
    page: raw.page,
    asteroids: raw.near_earth_objects.map((neo) => formatNeo(neo, null)),
  };
};

/**
 * Récupère les astéroïdes ayant des close approaches avec un corps céleste donné.
 *
 * L'API NASA NeoWS Browse ne filtre pas par corps directement.
 * On pagine et on filtre côté serveur jusqu'à avoir `size` résultats
 * ou avoir parcouru `MAX_PAGES` pages.
 *
 * Corps supportés par la NASA : Merc, Venus, Earth, Mars, Juptr, Saturn, Uranus, Neptune, Moon, etc.
 *
 * @param {string} body  - Nom du corps tel qu'attendu par la NASA (ex: "Mars", "Juptr")
 * @param {number} size  - Nombre de résultats souhaités (max 20)
 */
const fetchAsteroidsByBody = async (body, size = 20) => {
  const MAX_PAGES = 8; // on ne va pas trop loin pour éviter les timeouts
  const normalizedBody = body.toLowerCase();
  const results = [];
  let page = 0;

  while (results.length < size && page < MAX_PAGES) {
    const response = await axios.get(`${NASA_BASE_URL}/neo/browse`, {
      params: { api_key: NASA_API_KEY, page, size: 20 },
      timeout: 12000,
    });

    const neos = response.data.near_earth_objects ?? [];

    for (const neo of neos) {
      if (results.length >= size) break;

      const closeApproaches = neo.close_approach_data ?? [];
      const matchesBody = closeApproaches.some(
        (ca) => ca.orbiting_body?.toLowerCase() === normalizedBody
      );

      if (matchesBody) {
        results.push(formatNeo(neo, body));
      }
    }

    // Si la page retourne moins de 20, on a atteint la fin
    if (neos.length < 20) break;
    page++;
  }

  return {
    body,
    total: results.length,
    asteroids: results.slice(0, size),
  };
};

module.exports = { fetchAsteroids, fetchAsteroidsByBody };