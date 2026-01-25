import { getCache, setCache } from "../cache/cache.service.js";
import type {
  WeatherData,
  VisualCrossingResponse,
  TimelineParams,
} from "../types/weather.js";
import { WEATHER_API_KEY, WEATHER_API_URL } from "../config/weather.js";
import AppError from "../utils/appError.js";
import { httpStatusText } from "../utils/httpStatusText.js";

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
    throw new AppError(
      `Weather API error: ${response.statusText}`,
      response.status,
      httpStatusText.FAIL,
    );
  }

  const data: VisualCrossingResponse = await response.json();

  // Map API response to our internal type
  const today = data.days[0];
  if (!today) {
    throw new AppError(
      `Weather data not available for city: ${city}`,
      404,
      httpStatusText.FAIL,
    );
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

export async function getTimelineWeather({
  location,
  date1,
  date2,
}: TimelineParams) {
  const normalizedLocation = location.toLowerCase();

  const cacheKey = [
    "weather",
    "timeline",
    normalizedLocation,
    date1 ?? "forecast",
    date2 ?? "",
  ].join(":");

  const cached = await getCache<VisualCrossingResponse>(cacheKey);
  if (cached) {
    return { ...cached, source: "cache" };
  }

  // Build API URL
  let url = `${WEATHER_API_URL}/${encodeURIComponent(location)}`;
  if (date1) url += `/${date1}`;
  if (date2) url += `/${date2}`;
  url += `?unitGroup=metric&key=${WEATHER_API_KEY}&include=days`;

  console.log("Timeline URL:", url);

  // Fetch data
  const response = await fetch(url);

  if (!response.ok) {
    throw new AppError(
      `Weather API error: ${response.statusText}`,
      response.status,
      httpStatusText.FAIL,
    );
  }

  const data: VisualCrossingResponse = await response.json();

  // Save to cache
  await setCache(cacheKey, data);

  return { ...data, source: "api" };
}
