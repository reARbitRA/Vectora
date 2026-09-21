import type { Request, Response, NextFunction } from "express";
import type { RateLimitConfig } from "../config";

/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Scope note: this protects a single process. It is the correct first
 * line of defense for abuse of the expensive AI endpoints; a Redis-backed
 * limiter is the follow-up for multi-instance deployments.
 *
 * Keys are derived from `req.ip` (falls back to a raw socket address) and
 * optionally suffixed with an authenticated identity later on.
 */

interface WindowState {
  /** Timestamps (ms) of requests inside the current window. */
  hits: number[];
}

const buckets = new Map<string, WindowState>();

/** Test seam: clear all tracked windows. */
export function resetRateLimiter(): void {
  buckets.clear();
}

function clientKey(req: Request): string {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function prune(state: WindowState, now: number, windowMs: number): void {
  // Drop timestamps older than the window.
  while (state.hits.length > 0 && now - state.hits[0] > windowMs) {
    state.hits.shift();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  { windowMs, max }: RateLimitConfig,
  now: number = Date.now(),
): RateLimitResult {
  let state = buckets.get(key);
  if (!state) {
    state = { hits: [] };
    buckets.set(key, state);
  }
  prune(state, now, windowMs);

  if (state.hits.length >= max) {
    const oldest = state.hits[0];
    const retryAfterMs = windowMs - (now - oldest);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  state.hits.push(now);
  return {
    allowed: true,
    remaining: max - state.hits.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Express middleware factory. Responds with 429 + `Retry-After` when the
 * caller exceeds the configured budget.
 *
 * @param scope unique namespace for this limiter (e.g. "ai", "github")
 */
export function rateLimit(scope: string, config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = checkRateLimit(`${scope}:${clientKey(req)}`, config);
    res.setHeader("X-RateLimit-Limit", config.max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, result.remaining));
    if (!result.allowed) {
      res.setHeader("Retry-After", String(result.retryAfterSeconds));
      res.status(429).json({
        error: "Rate limit exceeded. Please slow down and retry shortly.",
        retryAfterSeconds: result.retryAfterSeconds,
      });
      return;
    }
    next();
  };
}
