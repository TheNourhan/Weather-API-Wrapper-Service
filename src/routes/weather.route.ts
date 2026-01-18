import { Router } from "express";
import { getWeatherController } from "../controllers/weather.controller.js";

const router = Router();

router.get("/weather/:city", getWeatherController);

export default router;
