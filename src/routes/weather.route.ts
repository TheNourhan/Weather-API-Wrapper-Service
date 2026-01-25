import { Router } from "express";
import {
  getTimelineWeatherController,
  getWeatherController,
} from "../controllers/weather.controller.js";

const router = Router();

router.get("/weather/:city", getWeatherController);

router.get("/weather/timeline/:location", getTimelineWeatherController);

router.get("/weather/timeline/:location/:date1", getTimelineWeatherController);

router.get(
  "/weather/timeline/:location/:date1/:date2",
  getTimelineWeatherController,
);

export default router;
