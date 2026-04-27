/**
 * src/services/api.ts
 * Client Axios centralisé vers le backend Oscilla.
 * La clé NASA ne transite JAMAIS côté frontend — uniquement via le backend proxy.
 */

import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Intercepteurs ────────────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('[API] Erreur réseau :', error?.message ?? error);
    return Promise.reject(error);
  }
);

export default api;
