import request from "supertest";
import app from "../app.js";

// Mock Redis to prevent actual connections
jest.mock("../cache/redis.client.js", () => ({
  getRedisClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    set: jest.fn(),
    setEx: jest.fn(),
  })),
}));

// Mock cache service
jest.mock("../cache/cache.service.js", () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe("Weather API - Timeline Only", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default cache mock
    const { getCache, setCache } = require("../cache/cache.service.js");
    getCache.mockResolvedValue(null);
    setCache.mockResolvedValue(undefined);

    // Setup default fetch mock for timeline
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        resolvedAddress: "Mock City",
        days: [{ datetime: "2026-01-25", temp: 25, conditions: "Sunny" }],
      }),
    });
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  it("should return 404 for current weather endpoint", async () => {
    const res = await request(app).get("/weather/cairo");
    expect(res.status).toBe(404);
  });

  it("should get timeline weather successfully", async () => {
    const { getCache } = require("../cache/cache.service.js");

    // Mock cache hit for timeline
    getCache.mockResolvedValueOnce({
      resolvedAddress: "Cairo",
      days: [{ datetime: "2026-01-25", temp: 30, conditions: "Clear" }],
    });

    const res = await request(app).get("/weather/timeline/cairo");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.resolvedAddress).toBe("Cairo");
  });

  it("should return 404 for /weather/timeline without location", async () => {
    const res = await request(app).get("/weather/timeline");
    expect(res.status).toBe(404);
  });

  it("should return 404 for /weather/timeline/ with trailing slash", async () => {
    const res = await request(app).get("/weather/timeline/");
    expect(res.status).toBe(404);
  });

  it("should get timeline weather with date", async () => {
    const { getCache } = require("../cache/cache.service.js");

    // Mock specific response for London
    getCache.mockResolvedValueOnce({
      resolvedAddress: "London",
      days: [{ datetime: "2026-01-26", temp: 15, conditions: "Rain" }],
    });

    const res = await request(app).get("/weather/timeline/london/2026-01-26");
    expect(res.status).toBe(200);
    expect(res.body.data.resolvedAddress).toBe("London");
  });

  it("should get timeline weather with date range", async () => {
    const { getCache } = require("../cache/cache.service.js");

    // Mock specific response for Paris
    getCache.mockResolvedValueOnce({
      resolvedAddress: "Paris",
      days: [
        { datetime: "2026-01-26", temp: 15, conditions: "Rain" },
        { datetime: "2026-01-27", temp: 16, conditions: "Cloudy" },
      ],
    });

    const res = await request(app).get(
      "/weather/timeline/paris/2026-01-26/2026-01-27",
    );
    expect(res.status).toBe(200);
    expect(res.body.data.resolvedAddress).toBe("Paris");
    expect(res.body.data.days).toHaveLength(2);
  });

  it("should return health check", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Weather API Wrapper is running!");
  });
});
