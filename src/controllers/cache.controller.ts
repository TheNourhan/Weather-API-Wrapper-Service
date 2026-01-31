import type { Request, Response, NextFunction } from "express";
import * as cacheService from "../cache/cache.service.js";
import AppError from "../utils/appError.js";
import { httpStatusText } from "../utils/httpStatusText.js";

// Helper function to extract and validate key from params
function getKeyFromParams(params: any): string {
  const key = params.key;
  // Check if key exists and is a non-empty string (trim whitespace)
  if (!key || typeof key !== "string" || key.trim() === "") {
    throw new AppError(
      "Cache key is required and must be a non-empty string",
      400,
      httpStatusText.FAIL,
    );
  }
  return key;
}

export async function getCacheKeysController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pattern = "weather:*" } = req.query;
    const keys = await cacheService.searchKeys(pattern as string);

    res.json({
      status: httpStatusText.SUCCESS,
      data: {
        pattern,
        keys,
        count: keys.length,
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, 500, httpStatusText.ERROR));
  }
}

// Check if a cache key exists
export async function existsCacheController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const key = getKeyFromParams(req.params);
    const exists = await cacheService.existsCache(key);
    res.json({
      status: httpStatusText.SUCCESS,
      data: { exists, key },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError(error.message, 500, httpStatusText.ERROR));
  }
}

// Get TTL for a cache key
export async function getTTLController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const key = getKeyFromParams(req.params);
    const ttl = await cacheService.getTTL(key);

    let status: "active" | "expired" | "no-expiry" | "not-found";

    if (ttl === -2) {
      status = "not-found";
    } else if (ttl === -1) {
      status = "no-expiry";
    } else if (ttl === 0) {
      status = "expired";
    } else {
      status = "active";
    }

    res.json({
      status: httpStatusText.SUCCESS,
      data: {
        key,
        ttl,
        status,
        humanReadable:
          ttl > 0
            ? `${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m ${ttl % 60}s`
            : null,
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError(error.message, 500, httpStatusText.ERROR));
  }
}

// Update TTL for a cache key
export async function updateTTLController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const key = getKeyFromParams(req.params);
    const { ttl } = req.body;

    // Validate input
    if (!ttl || typeof ttl !== "number") {
      return next(
        new AppError("TTL must be a number", 400, httpStatusText.FAIL),
      );
    }

    if (ttl <= 0) {
      return next(
        new AppError("TTL must be greater than 0", 400, httpStatusText.FAIL),
      );
    }

    // Check if key exists
    const exists = await cacheService.existsCache(key);
    if (!exists) {
      return next(
        new AppError("Cache key not found", 404, httpStatusText.FAIL),
      );
    }

    // Update TTL
    const updated = await cacheService.updateTTL(key, ttl);

    res.json({
      status: httpStatusText.SUCCESS,
      data: {
        updated,
        key,
        newTTL: ttl,
        message: updated ? "TTL updated successfully" : "Failed to update TTL",
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError(error.message, 500, httpStatusText.ERROR));
  }
}

// Delete a cache key
export async function deleteCacheController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const key = getKeyFromParams(req.params);
    const deleted = await cacheService.deleteCache(key);

    res.json({
      status: httpStatusText.SUCCESS,
      data: {
        deleted,
        key,
        message: deleted
          ? "Cache entry deleted successfully"
          : "Cache entry not found",
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError(error.message, 500, httpStatusText.ERROR));
  }
}

// Get full cache entry info (exists + value + ttl)
export async function getCacheInfoController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const key = getKeyFromParams(req.params);

    // Get all info in parallel
    const [exists, value, ttl] = await Promise.all([
      cacheService.existsCache(key),
      cacheService.getCache(key),
      cacheService.getTTL(key),
    ]);

    res.json({
      status: httpStatusText.SUCCESS,
      data: {
        key,
        exists,
        value,
        ttl,
        size: value ? JSON.stringify(value).length : 0,
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError(error.message, 500, httpStatusText.ERROR));
  }
}

export async function getCacheStatsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const stats = await cacheService.getCacheStats();
    res.json({
      status: httpStatusText.SUCCESS,
      data: stats,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500, httpStatusText.ERROR));
  }
}
