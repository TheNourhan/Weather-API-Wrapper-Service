import express from "express";
import dotenv from "dotenv";
import { getRedisClient } from "./cache/redis.client.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
  process.on("SIGTERM", async () => {
    console.log("\nSIGTERM received. Shutting down...");

    server.close(async () => {
      await redis.quit();
      console.log("Redis disconnected. Server closed.");
      process.exit(0);
    });
  });

  process.on("SIGINT", async () => {
    console.log("\n\nSIGINT received (Ctrl+C). Shutting down...");

    server.close(async () => {
      await redis.quit();
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
