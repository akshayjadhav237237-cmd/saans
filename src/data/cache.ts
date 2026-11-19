import type { Clock } from '../domain/ports';
import type { CacheEntry } from './types';

export const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Provides in-memory and session storage caching with deterministic expiration.
 */
export class SessionCache<T> {
  private readonly memory = new Map<string, CacheEntry<T>>();
  private readonly clock: Clock;

  constructor(clock: Clock) {
    this.clock = clock;
  }

  /**
   * Retrieves an unexpired item from cache if present.
   */
  get(key: string): T | null {
    const now = this.clock.now();

    // Check memory cache first
    const memEntry = this.memory.get(key);
    if (memEntry) {
      if (memEntry.expiresAt > now) {
        return memEntry.data;
      }
      this.memory.delete(key);
    }

    // Check sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const serialized = window.sessionStorage.getItem(`saans.cache.${key}`);
        if (serialized) {
          const entry = JSON.parse(serialized) as CacheEntry<T>;
          if (entry.expiresAt > now) {
            this.memory.set(key, entry);
            return entry.data;
          }
          window.sessionStorage.removeItem(`saans.cache.${key}`);
        }
      }
    } catch {
      // Storage access blocked or unavailable
    }

    return null;
  }

  /**
   * Stores an item in cache with standard TTL.
   */
  set(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
    const entry: CacheEntry<T> = {
      data,
      expiresAt: this.clock.now() + ttlMs,
    };
    this.memory.set(key, entry);

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(`saans.cache.${key}`, JSON.stringify(entry));
      }
    } catch {
      // Storage quota exceeded or disabled
    }
  }

  /**
   * Clears all cached items from memory and session storage.
   */
  clear(): void {
    this.memory.clear();
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.sessionStorage.length; i += 1) {
          const k = window.sessionStorage.key(i);
          if (k?.startsWith('saans.cache.')) {
            keysToRemove.push(k);
          }
        }
        for (const k of keysToRemove) {
          window.sessionStorage.removeItem(k);
        }
      }
    } catch {
      // Ignored
    }
  }
}
