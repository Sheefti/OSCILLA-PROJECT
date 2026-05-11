/**
 * useNeoAsteroids.ts
 *
 * Hook personnalisé pour récupérer les astéroïdes depuis l'API backend (/api/neo).
 * Gère : loading, error, data, refresh, et pagination basique.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NeoAsteroid {
  id: string;
  name: string;
  isHazardous: boolean;
  diameterKm: {
    min: number;
    max: number;
  };
  velocity: {
    kmPerHour: number;
  };
  missDistance: {
    km: number;
    lunar: number;
  };
  closeApproachDate: string | null;
  orbitingBodies: string[];
  nasaUrl: string;
}

interface PageMeta {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

interface UseNeoAsteroidsResult {
  asteroids: NeoAsteroid[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  page: PageMeta | null;
  refresh: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useNeoAsteroids(): UseNeoAsteroidsResult {
  const [asteroids, setAsteroids] = useState<NeoAsteroid[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [page, setPage]           = useState<PageMeta | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await api.get<{ success: boolean; data: { page: PageMeta; asteroids: NeoAsteroid[] } }>('/api/neo', {
        params: { page: 0, size: 20 },
      });

      if (res.data?.success) {
        setAsteroids(res.data.data.asteroids);
        setPage(res.data.data.page);
      } else {
        setError('Réponse inattendue du serveur.');
      }
    } catch (err: any) {
      const msg =
        err?.response?.status === 503
          ? 'Service temporairement indisponible.'
          : err?.code === 'ECONNABORTED'
          ? 'Délai de connexion dépassé. Vérifie ta connexion.'
          : err?.message
          ? `Erreur réseau : ${err.message}`
          : 'Impossible de contacter le serveur.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return { asteroids, loading, refreshing, error, page, refresh };
}
