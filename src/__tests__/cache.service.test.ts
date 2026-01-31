import * as cacheService from "../cache/cache.service.js";
import { getRedisClient } from "../cache/redis.client.js";

jest.mock("../cache/redis.client.js");

describe("Cache Service", () => {
  let mockRedis: any;

  beforeEach(() => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
      expire: jest.fn(),
      keys: jest.fn(),
    };
    (getRedisClient as jest.Mock).mockReturnValue(mockRedis);
  });

  describe("getCache", () => {
    it("should return cached data", async () => {
      const mockData = { city: "London", temp: 20 };
      mockRedis.get.mockResolvedValue(JSON.stringify(mockData));

      const result = await cacheService.getCache("weather:london");
      expect(result).toEqual(mockData);
    });

    it("should return null for non-existent key", async () => {
      mockRedis.get.mockResolvedValue(null);
      const result = await cacheService.getCache("nonexistent");
      expect(result).toBeNull();
    });

    it("should return null for invalid JSON", async () => {
      mockRedis.get.mockResolvedValue("invalid json");
      const result = await cacheService.getCache("broken");
      expect(result).toBeNull();
    });
  });
  describe("setCache", () => {
    it("should set cache with TTL", async () => {
      const data = { city: "Paris", temp: 25 };
      await cacheService.setCache("weather:paris", data, 3600);

      expect(mockRedis.set).toHaveBeenCalledWith(
        "weather:paris",
        JSON.stringify(data),
        { EX: 3600 },
      );
    });
  });

  describe("deleteCache", () => {
    it("should return true when key is deleted", async () => {
      mockRedis.del.mockResolvedValue(1);
      const result = await cacheService.deleteCache("weather:london");
      expect(result).toBe(true);
    });

    it("should return false when key does not exist", async () => {
      mockRedis.del.mockResolvedValue(0);
      const result = await cacheService.deleteCache("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("existsCache", () => {
    it("should return true for existing key", async () => {
      mockRedis.exists.mockResolvedValue(1);
      const result = await cacheService.existsCache("weather:london");
      expect(result).toBe(true);
    });

    it("should return false for non-existent key", async () => {
      mockRedis.exists.mockResolvedValue(0);
      const result = await cacheService.existsCache("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("getTTL", () => {
    it("should return TTL for key", async () => {
      mockRedis.ttl.mockResolvedValue(3598);
      const result = await cacheService.getTTL("weather:london");
      expect(result).toBe(3598);
    });

    it("should handle Redis TTL codes", async () => {
      mockRedis.ttl.mockResolvedValue(-2); // Doesn't exist
      const result = await cacheService.getTTL("nonexistent");
      expect(result).toBe(-2);
    });
  });

  describe("searchKeys", () => {
    it("should search keys with pattern", async () => {
      const keys = ["weather:london", "weather:paris"];
      mockRedis.keys.mockResolvedValue(keys);

      const result = await cacheService.searchKeys("weather:*");
      expect(result).toEqual(keys);
      expect(mockRedis.keys).toHaveBeenCalledWith("weather:*");
    });
  });
});
