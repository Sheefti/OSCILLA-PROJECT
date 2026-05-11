export const API_BASE_URL = __DEV__
  ? 'http://172.20.10.2:3000'
  : 'https://api.oscilla.app';

export const CACHE_TTL_MS = 5 * 60 * 1000;

export const STORAGE_KEYS = {
  ASTEROIDS_LIST: 'oscilla:asteroids:list',
  LAST_SELECTED:  'oscilla:ui:last_selected',
} as const;

export const SECURE_KEYS = {
  USER_TOKEN: 'oscilla:auth:token',
} as const;
