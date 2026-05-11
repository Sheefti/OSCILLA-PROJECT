/**
 * src/constants/config.ts
 * Constantes globales de l'application.
 * Modifier ici uniquement — ne jamais hardcoder ces valeurs ailleurs.
 */

/** URL du backend Oscilla (proxy NASA)
 *  Docker expose le backend sur le port 3000 de la machine hôte.
 *  Le mobile (Expo Go) doit pointer sur l'IP WiFi de la machine hôte. */
export const API_BASE_URL = __DEV__
  ? 'http://192.168.0.129:3000'  // IP WiFi local — docker-compose ports: 3000:3000 — à adapter si réseau différent
  : 'https://api.oscilla.app';  // ← URL de prod future (EAS Build)

/** TTL du cache AsyncStorage en millisecondes (5 minutes) */
export const CACHE_TTL_MS = 5 * 60 * 1000;

/** Clés AsyncStorage — centralisées pour éviter les fautes de frappe */
export const STORAGE_KEYS = {
  ASTEROIDS_LIST: 'oscilla:asteroids:list',
  LAST_SELECTED:  'oscilla:ui:last_selected',
} as const;

/** Clés SecureStore */
export const SECURE_KEYS = {
  USER_TOKEN: 'oscilla:auth:token',
} as const;
