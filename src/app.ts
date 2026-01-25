import express from "express";
import weatherRouter from "./routes/weather.route.js";

const app = express();

app.use(express.json());
app.use(weatherRouter);

// Health check route
app.get("/", (req, res) => {
  res.send("Weather API Wrapper is running!");
});

export default app;
