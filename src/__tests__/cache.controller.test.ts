import request from "supertest";
import app from "../app.js";
import * as cacheService from "../cache/cache.service.js";

jest.mock("../cache/cache.service.js");

describe("Cache Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/cache/stats", () => {
    it("should return cache statistics", async () => {
      const mockStats = {
        totalKeys: 5,
        weatherKeys: ["weather:london", "weather:paris"],
        allKeysCount: 5,
      };
      (cacheService.getCacheStats as jest.Mock).mockResolvedValue(mockStats);

      const response = await request(app).get("/api/cache/stats");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toEqual(mockStats);
    });

    it("should handle service errors", async () => {
      (cacheService.getCacheStats as jest.Mock).mockRejectedValue(
        new Error("Redis connection failed"),
      );

      const response = await request(app).get("/api/cache/stats");

      expect(response.status).toBe(500);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Redis connection failed");
    });
  });

  describe("GET /api/cache/:key/exists", () => {
    it("should check if key exists", async () => {
      (cacheService.existsCache as jest.Mock).mockResolvedValue(true);

      const response = await request(app).get(
        "/api/cache/weather:london/exists",
      );

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.exists).toBe(true);
    });

    // it("should return 400 for empty key", async () => {
    //   const response = await request(app).get("/api/cache//exists"); // Double slash

    //   expect(response.status).toBe(404); // Updated from 400 to 404
    //   expect(response.body.status).toBe("fail");
    // });
  });

  describe("GET /api/cache/:key/ttl", () => {
    it("should get TTL for key", async () => {
      (cacheService.getTTL as jest.Mock).mockResolvedValue(3598);

      const response = await request(app).get("/api/cache/weather:london/ttl");

      expect(response.status).toBe(200);
      expect(response.body.data.ttl).toBe(3598);
      expect(response.body.data.status).toBe("active");
    });

    it("should handle not-found key", async () => {
      (cacheService.getTTL as jest.Mock).mockResolvedValue(-2);

      const response = await request(app).get("/api/cache/nonexistent/ttl");

      expect(response.status).toBe(200); // This endpoint returns 200 even for not found
      expect(response.body.data.status).toBe("not-found");
    });
  });

  describe("PUT /api/cache/:key/ttl", () => {
    it("should update TTL", async () => {
      (cacheService.existsCache as jest.Mock).mockResolvedValue(true);
      (cacheService.updateTTL as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .put("/api/cache/weather:london/ttl")
        .send({ ttl: 600 });

      expect(response.status).toBe(200);
      expect(response.body.data.updated).toBe(true);
    });

    it("should return 404 for non-existent key", async () => {
      (cacheService.existsCache as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .put("/api/cache/nonexistent/ttl")
        .send({ ttl: 600 });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain("Cache key not found");
    });

    it("should validate TTL is number > 0", async () => {
      const response = await request(app)
        .put("/api/cache/weather:london/ttl")
        .send({ ttl: -5 });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain("TTL must be greater than 0");
    });

    it("should validate TTL is required", async () => {
      const response = await request(app)
        .put("/api/cache/weather:london/ttl")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain("TTL must be a number");
    });
  });

  describe("DELETE /api/cache/:key", () => {
    it("should delete cache key", async () => {
      (cacheService.deleteCache as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete("/api/cache/weather:london");

      expect(response.status).toBe(200);
      expect(response.body.data.deleted).toBe(true);
    });

    it("should handle non-existent key", async () => {
      (cacheService.deleteCache as jest.Mock).mockResolvedValue(false);

      const response = await request(app).delete("/api/cache/nonexistent");

      expect(response.status).toBe(200); // DELETE returns 200 even if not found
      expect(response.body.data.deleted).toBe(false);
    });
  });

  describe("GET /api/cache/keys/search", () => {
    it("should search keys with pattern", async () => {
      const mockKeys = ["weather:london", "weather:paris"];
      (cacheService.searchKeys as jest.Mock).mockResolvedValue(mockKeys);

      const response = await request(app).get(
        "/api/cache/keys/search?pattern=weather:*",
      );

      expect(response.status).toBe(200);
      expect(response.body.data.keys).toEqual(mockKeys);
    });

    it("should use default pattern if none provided", async () => {
      (cacheService.searchKeys as jest.Mock).mockResolvedValue([]);

      await request(app).get("/api/cache/keys/search");

      expect(cacheService.searchKeys).toHaveBeenCalledWith("weather:*");
    });
  });
});
