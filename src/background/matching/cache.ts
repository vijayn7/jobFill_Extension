import type { MemoryEntry } from '../../shared/types';

type CacheEntry = {
  expiresAt: number;
  suggestions: MemoryEntry[];
};

const CACHE_TTL_MS = 5000;
const cacheByTab = new Map<number, CacheEntry>();

export const getCachedSuggestions = (tabId: number): MemoryEntry[] | null => {
  const cached = cacheByTab.get(tabId);
  if (!cached) {
    return null;
  }
  if (Date.now() > cached.expiresAt) {
    cacheByTab.delete(tabId);
    return null;
  }
  return cached.suggestions;
};

export const setCachedSuggestions = (tabId: number, suggestions: MemoryEntry[]): void => {
  cacheByTab.set(tabId, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    suggestions,
  });
};

export const clearCachedSuggestions = (tabId: number): void => {
  cacheByTab.delete(tabId);
};
