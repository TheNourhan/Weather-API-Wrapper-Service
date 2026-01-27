import { getRedisClient } from "./redis.client.js";
import { redisConfig } from "../config/redis.js";
import type { CacheKey } from "../types/cache.js";

export async function getCache<T>(key: CacheKey): Promise<T | null> {
  const redis = getRedisClient();
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setCache<T>(
  key: CacheKey,
  value: T,
  ttl = redisConfig.ttlSeconds,
): Promise<void> {
  const redis = getRedisClient();
  await redis.set(key, JSON.stringify(value), { EX: ttl });
}

export async function deleteCache(key: CacheKey): Promise<boolean> {
  const redis = getRedisClient();
  const result = await redis.del(key);
  return result > 0;
}

export async function existsCache(key: CacheKey): Promise<boolean> {
  const redis = getRedisClient();
  const result = await redis.exists(key);
  return result === 1;
}

// TTL operations
export async function getTTL(key: CacheKey): Promise<number> {
  const redis = getRedisClient();
  const ttl = await redis.ttl(key);
  return ttl; // -2 = doesn't exist, -1 = no expiry, >=0 = seconds remaining
}

export async function updateTTL(key: CacheKey, ttl: number): Promise<boolean> {
  const redis = getRedisClient();
  const result = await redis.expire(key, ttl);
  return result === 1;
}

export async function searchKeys(pattern: string = "*"): Promise<string[]> {
  const redis = getRedisClient();
  return await redis.keys(pattern);
}

export async function getCacheStats(): Promise<{
  totalKeys: number;
  weatherKeys: string[];
  allKeysCount: number;
}> {
  const redis = getRedisClient();
  const allKeys = await redis.keys("*");
  const weatherKeys = await redis.keys("weather:*");

  return {
    totalKeys: allKeys.length,
    weatherKeys,
    allKeysCount: allKeys.length,
  };
}
