export type CacheKey = string;

// T is the type of the value stored in cache
export interface CacheService {
  getCache<T>(key: CacheKey): Promise<T | null>;
  setCache<T>(key: CacheKey, value: T, ttl?: number): Promise<void>;
}
