import { getWeather, getTimelineWeather } from "../services/weather.service.js";
import * as cacheService from "../cache/cache.service.js";

// Mock the entire cache module
jest.mock("../cache/cache.service");

// Mock fetch globally to prevent actual API calls
global.fetch = jest.fn();

describe("Weather Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();

    // Mock console.log to suppress Timeline URL logs
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should return cached weather if available", async () => {
    // Mock getCache to return cached data
    (cacheService.getCache as jest.Mock).mockResolvedValue({
      temp: 25,
      humidity: 50,
      description: "Sunny",
      city: "Cairo",
    });

    // Mock setCache to avoid actual Redis calls
    (cacheService.setCache as jest.Mock).mockResolvedValue(undefined);

    const result = await getWeather("Cairo");
    expect(result.temp).toBe(25);
    expect(result.source).toBe("cache");
    expect(cacheService.getCache).toHaveBeenCalledWith("weather:cairo");
  });

  // Remove or update this test since empty string creates cache key "weather:"
  it("should fetch from API if cache is empty", async () => {
    // Mock empty cache
    (cacheService.getCache as jest.Mock).mockResolvedValue(null);
    (cacheService.setCache as jest.Mock).mockResolvedValue(undefined);

    // Mock successful API response
    const mockApiResponse = {
      days: [
        {
          temp: 20,
          humidity: 60,
          conditions: "Cloudy",
        },
      ],
      resolvedAddress: "London",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });

    const result = await getWeather("London");
    expect(result.source).toBe("api");
    expect(global.fetch).toHaveBeenCalled();
    expect(cacheService.setCache).toHaveBeenCalled();
  });

  it("should handle API errors", async () => {
    (cacheService.getCache as jest.Mock).mockResolvedValue(null);

    // Mock failed API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: "Not Found",
      status: 404,
    });

    await expect(getWeather("InvalidCity")).rejects.toThrow(
      "Weather API error",
    );
  });

  it("should handle missing weather data", async () => {
    (cacheService.getCache as jest.Mock).mockResolvedValue(null);

    // Mock API response with no days
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ days: [] }),
    });

    await expect(getWeather("Nowhere")).rejects.toThrow(
      "Weather data not available",
    );
  });
});

describe("Timeline Weather Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return timeline weather from cache", async () => {
    const mockCachedData = {
      resolvedAddress: "Cairo",
      days: [{ datetime: "2026-01-25", temp: 30, conditions: "Clear" }],
    };

    (cacheService.getCache as jest.Mock).mockResolvedValue(mockCachedData);

    const result = await getTimelineWeather({
      location: "Cairo",
      date1: undefined,
      date2: undefined,
    });

    expect(result.source).toBe("cache");
    expect(result.resolvedAddress).toBe("Cairo");
  });

  it("should fetch timeline from API if not in cache", async () => {
    (cacheService.getCache as jest.Mock).mockResolvedValue(null);
    (cacheService.setCache as jest.Mock).mockResolvedValue(undefined);

    const mockApiResponse = {
      resolvedAddress: "Paris",
      days: [{ datetime: "2026-01-26", temp: 15, conditions: "Rain" }],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });

    const result = await getTimelineWeather({
      location: "Paris",
      date1: "2026-01-26",
      date2: undefined,
    });

    expect(result.source).toBe("api");
    expect(global.fetch).toHaveBeenCalled();
  });
});
