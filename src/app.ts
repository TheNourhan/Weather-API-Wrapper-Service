// src/app.ts
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import weatherRouter from "./routes/weather.route.js";
import cacheRoutes from "./routes/cache.routes.js";

const app = express();

// Load Swagger YAML
const swaggerDocument = YAML.load(
  path.join(process.cwd(), "src", "config", "swagger.yaml"),
);

// Middleware
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use(weatherRouter);
app.use("/api/cache", cacheRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Weather API Wrapper is running!");
});

export default app;
