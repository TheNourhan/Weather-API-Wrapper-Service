import { getCache, setCache } from "../cache/cache.service.js";
import type { WeatherData, VisualCrossingResponse } from "../types/weather.js";
import { WEATHER_API_KEY, WEATHER_API_URL } from "../config/weather.js";

export async function getWeather(city: string): Promise<WeatherData> {
  const cacheKey = `weather:${city.toLowerCase()}`;

  // Check cache first
  const cached = await getCache<WeatherData>(cacheKey);
  if (cached) {
    return { ...cached, source: "cache" } as WeatherData & { source: string };
  }

  // Fetch from API
  const url = `${WEATHER_API_URL}/${encodeURIComponent(city)}?unitGroup=metric&key=${WEATHER_API_KEY}&include=days`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data: VisualCrossingResponse = await response.json();

  // Map API response to our internal type
  const today = data.days[0];
  if (!today) {
    throw new Error(`Weather data not available for city: ${city}`);
  }
  const weather: WeatherData = {
    temp: today.temp,
    humidity: today.humidity,
    description: today.conditions,
    city: data.resolvedAddress,
  };

  // Save to cache
  await setCache(cacheKey, weather);

  return { ...weather, source: "api" } as WeatherData & { source: string };
}
