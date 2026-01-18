import dotenv from "dotenv";
dotenv.config();

export const WEATHER_API_KEY = process.env.WEATHER_API_KEY!;
export const WEATHER_API_URL = process.env.WEATHER_API_URL!;

if (!WEATHER_API_KEY || !WEATHER_API_URL) {
  throw new Error("Missing WEATHER_API_KEY or WEATHER_API_URL in .env file!");
}
