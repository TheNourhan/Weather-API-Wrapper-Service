# [Weather-API-Wrapper-Service](https://roadmap.sh/backend/project-ideas#3-weather-api-wrapper-service)

A simple Node.js/Express API wrapper for any external weather service. 
It caches weather data in Redis to reduce API calls and improve response times.

## High Level System Overview
<p align="center">
  <img src="assets/System-Overview-Weather-API-Wrapper-Service.png" alt="Weather API Logo" />
</p>

- Client calls our API
- Our API:
    1. checks Redis cache
    2. if data exists → return it
    3. else → call external Weather API
    4. save response in cache (with expiration)
    5. return response to client

## Tech Stack
- TypeScript
- Node.js (v22.20.0), NPM (11.7.0)
- Express
- Redis (in-memory cache)

## Installation
1. Clone the repo:
```bash
git clone https://github.com/TheNourhan/Weather-API-Wrapper-Service.git
cd Weather-API-Wrapper-Service
```
2. Install dependencies:
```bash
npm install
```
3. Create a .env file:
```bash
PORT=3000
REDIS_URL=redis://localhost:6379
WEATHER_API_KEY=<your-api-key>
```
4. Run in development:
```bash
npm run dev
```

## Linting & Formatting
This project uses **ESLint** and **Prettier** to ensure code quality and consistent formatting.
### Run ESLint
- Check for linting errors:
```bash
npm run lint
```
- Automatically fix linting issues:
```bash
npm run lint:fix
```
### Format Code with Prettier
- Format all source files:
```bash
npm run format
```