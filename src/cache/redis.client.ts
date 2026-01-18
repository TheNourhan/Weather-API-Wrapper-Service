import { createClient } from "redis";
import type { RedisClientType } from "redis";
import { redisConfig } from "../config/redis.js";

let redisClient: RedisClientType;

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    redisClient = createClient({
      url: redisConfig.url,
    });

    redisClient.on("connect", () => {
      console.log("Redis connected");
    });

    redisClient.on("error", (err) => {
      console.error("Redis error:", err);
    });
  }

  return redisClient;
}
