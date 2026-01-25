import type { NextFunction, Request, Response } from "express";
import { getWeather, getTimelineWeather } from "../services/weather.service.js";
import { httpStatusText } from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import { normalizeParam } from "../utils/normalizeParam.js";

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

export async function getTimelineWeatherController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { location: rawLocation, date1, date2 } = req.params;

    if (!rawLocation || Array.isArray(rawLocation)) {
      throw new AppError("Location is required", 400, httpStatusText.FAIL);
    }

    const location = rawLocation;

    const weather = await getTimelineWeather({
      location,
      date1: normalizeParam(date1),
      date2: normalizeParam(date2),
    });

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: weather,
    });
  } catch (err) {
    next(err);
  }
}
