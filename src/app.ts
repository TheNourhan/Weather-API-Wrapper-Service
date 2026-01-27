import express from "express";
import weatherRouter from "./routes/weather.route.js";
import cacheRoutes from "./routes/cache.routes.js";

const app = express();

app.use(express.json());
app.use(weatherRouter);
app.use("/api/cache", cacheRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("Weather API Wrapper is running!");
});

export default app;
