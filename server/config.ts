/**
 * Centralized server configuration.
 *
 * All tunables that were previously hard-coded (port, payload limits,
 * rate limits, session lifetimes) are sourced from here. Environment
 * variables always win so deployments can adapt without code changes.
 */

export interface ServerConfig {
  /** TCP port the HTTP server binds to. */
  port: number;
  /** Maximum JSON body size accepted by the API. */
  jsonBodyLimit: string;
  /** Rate limits keyed by endpoint group. */
  rateLimits: {
    /** Expensive AI generation endpoints. */
    ai: RateLimitConfig;
    /** GitHub OAuth / sync endpoints. */
    github: RateLimitConfig;
    /** Cheap read-only endpoints (health, diagnostics). */
    light: RateLimitConfig;
  };
  /** Lifetime of a pending OAuth `state` token (ms). */
  oauthStateTtlMs: number;
  /** Lifetime of a server-side session (ms). */
  sessionTtlMs: number;
  /** Upper bound for any SVG string accepted or produced by the API. */
  maxSvgBytes: number;
  /** Upper bound for the estimated number of elements in an SVG document. */
  maxSvgElements: number;
}

export interface RateLimitConfig {
  /** Sliding window length in milliseconds. */
  windowMs: number;
  /** Maximum requests per window per client. */
  max: number;
}

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadConfig(): ServerConfig {
  return {
    port: num(process.env.PORT, 3000),
    jsonBodyLimit: process.env.JSON_BODY_LIMIT || "10mb",
    rateLimits: {
      ai: {
        windowMs: num(process.env.RATE_LIMIT_AI_WINDOW_MS, 60_000),
        max: num(process.env.RATE_LIMIT_AI_MAX, 20),
      },
      github: {
        windowMs: num(process.env.RATE_LIMIT_GITHUB_WINDOW_MS, 60_000),
        max: num(process.env.RATE_LIMIT_GITHUB_MAX, 10),
      },
      light: {
        windowMs: num(process.env.RATE_LIMIT_LIGHT_WINDOW_MS, 60_000),
        max: num(process.env.RATE_LIMIT_LIGHT_MAX, 120),
      },
    },
    oauthStateTtlMs: num(process.env.OAUTH_STATE_TTL_MS, 10 * 60_000),
    sessionTtlMs: num(process.env.SESSION_TTL_MS, 12 * 60 * 60_000),
    maxSvgBytes: num(process.env.MAX_SVG_BYTES, 2_000_000),
    maxSvgElements: num(process.env.MAX_SVG_ELEMENTS, 20_000),
  };
}
