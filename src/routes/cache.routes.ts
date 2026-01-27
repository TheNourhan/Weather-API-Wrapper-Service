import { Router } from "express";
import {
  existsCacheController,
  getTTLController,
  updateTTLController,
  deleteCacheController,
  getCacheInfoController,
  getCacheKeysController,
  getCacheStatsController,
} from "../controllers/cache.controller.js";

const router = Router();

router.get("/stats", getCacheStatsController);
router.get("/:key/exists", existsCacheController);
router.get("/:key/ttl", getTTLController);
router.put("/:key/ttl", updateTTLController);
router.delete("/:key", deleteCacheController);
router.get("/:key", getCacheInfoController);
router.get("/keys/search", getCacheKeysController);

export default router;
