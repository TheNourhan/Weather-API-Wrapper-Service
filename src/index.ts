import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { getRedisClient } from "./cache/redis.client.js";
import weatherRouter from "./routes/weather.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(weatherRouter);

async function startServer() {
  // Connect to Redis
  const redis = getRedisClient();
  await redis.connect();

  app.get("/", (req, res) => {
    res.send("Weather API Wrapper is running!");
  });

  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // Graceful (Docker/K8s/shutdown)
  function shutdownHandler(signal: string) {
    return async () => {
      console.log(`\n\n${signal} received. Shutting down...`);
      server.close(async () => {
        await redis.quit();
        console.log("Redis disconnected. Server closed.");
        process.exit(0);
      });
    };
  }

  process.on("SIGINT", shutdownHandler("SIGINT"));
  process.on("SIGTERM", shutdownHandler("SIGTERM"));
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
