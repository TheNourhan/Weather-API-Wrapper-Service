import type { Request, Response } from "express";
import { getWeather } from "../services/weather.service.js";
import { httpStatusText } from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";

export async function getWeatherController(req: Request, res: Response) {
  const city = req.params.city as string;

  if (!city) {
    throw new AppError("City is required", 400, httpStatusText.FAIL);
  }

  try {
    const weather = await getWeather(city);
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: weather,
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        status: err.statusText,
        message: err.message,
      });
    }

    // unknown error
    return res.status(500).json({
      status: httpStatusText.ERROR,
      message: "Internal Server Error",
    });
  }
}
