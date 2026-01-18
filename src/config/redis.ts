export const redisConfig = {
  url: process.env.REDIS_URL!,
  ttlSeconds: Number(process.env.REDIS_TTL_SECONDS ?? 43200),
};
