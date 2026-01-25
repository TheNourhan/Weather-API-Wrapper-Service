import dotenv from "dotenv";
dotenv.config();

import { getRedisClient } from "./cache/redis.client.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  // Connect to Redis
  const redis = getRedisClient();
  await redis.connect();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // Graceful shutdown (Docker/K8s/shutdown)
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

// Only start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

export default app;
