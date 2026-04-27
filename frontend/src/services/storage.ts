/**
 * src/services/storage.ts
 * Wrappers AsyncStorage (cache) et SecureStore (données sensibles).
 *
 * AsyncStorage  → cache liste d'astéroïdes, préférences UI (TTL: 5 min)
 * SecureStore   → tokens d'auth futurs (chiffré sur le device)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { CACHE_TTL_MS } from '../constants/config';

// ── Types ────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// ── AsyncStorage — Cache général ─────────────────────────────────────────────

export async function cacheSet<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    console.warn('[Storage] cacheSet error:', e);
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch (e) {
    console.warn('[Storage] cacheGet error:', e);
    return null;
  }
}

export async function cacheClear(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

// ── SecureStore — Données sensibles ──────────────────────────────────────────

export async function secureSet(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function secureGet(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function secureDelete(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
