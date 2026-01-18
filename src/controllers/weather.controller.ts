import type { Request, Response } from "express";
import { getWeather } from "../services/weather.service.js";

export async function getWeatherController(req: Request, res: Response) {
  const city = req.params.city as string;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const weather = await getWeather(city);
    res.json(weather);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
