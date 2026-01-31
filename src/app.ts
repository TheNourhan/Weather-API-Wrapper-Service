import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import weatherRouter from "./routes/weather.route.js";
import cacheRoutes from "./routes/cache.routes.js";
import AppError from "./utils/appError.js";
import { httpStatusText } from "./utils/httpStatusText.js";

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

// 404 handler
app.use((req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404,
    httpStatusText.FAIL,
  );
  next(error);
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: any, req: any, res: any, next: any) => {
  error.statusCode = error.statusCode || 500;
  error.statusText = error.statusText || httpStatusText.ERROR;

  res.status(error.statusCode).json({
    status: error.statusText,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

export default app;
