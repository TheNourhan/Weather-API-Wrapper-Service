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
