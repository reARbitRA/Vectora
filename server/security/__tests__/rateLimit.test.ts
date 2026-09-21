import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimiter } from "../rateLimit";

const CONFIG = { windowMs: 60_000, max: 3 };

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it("allows requests up to the budget", () => {
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit("ip-a", CONFIG).allowed).toBe(true);
    }
  });

  it("blocks the request that exceeds the budget", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("ip-b", CONFIG);
    const result = checkRateLimit("ip-b", CONFIG);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("tracks clients independently", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("ip-c", CONFIG);
    expect(checkRateLimit("ip-c", CONFIG).allowed).toBe(false);
    expect(checkRateLimit("ip-d", CONFIG).allowed).toBe(true);
  });

  it("frees the budget again once the window has elapsed", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 3; i++) checkRateLimit("ip-e", CONFIG, t0);
    expect(checkRateLimit("ip-e", CONFIG, t0).allowed).toBe(false);
    // One ms past the window: the first hit has expired.
    expect(checkRateLimit("ip-e", CONFIG, t0 + 60_001).allowed).toBe(true);
  });

  it("uses a sliding window, not a fixed one", () => {
    const t0 = 1_000_000;
    checkRateLimit("ip-f", CONFIG, t0);
    checkRateLimit("ip-f", CONFIG, t0 + 30_000);
    checkRateLimit("ip-f", CONFIG, t0 + 30_000);
    // The hit at t0 is still inside the window here, so this is over budget…
    expect(checkRateLimit("ip-f", CONFIG, t0 + 30_000).allowed).toBe(false);
    // …but once t0 ages out, budget frees up again.
    expect(checkRateLimit("ip-f", CONFIG, t0 + 60_001).allowed).toBe(true);
  });

  it("keeps different limiter scopes isolated (regression: shared bucket key)", () => {
    // Regression test: all middleware instances created from this module
    // used to share one per-IP bucket, so light-endpoint traffic exhausted
    // the AI and GitHub budgets too. Scopes must be independent.
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit("light:1.2.3.4", CONFIG).allowed).toBe(true);
    }
    expect(checkRateLimit("light:1.2.3.4", CONFIG).allowed).toBe(false);
    // A different scope with the same client still has its full budget.
    expect(checkRateLimit("ai:1.2.3.4", CONFIG).allowed).toBe(true);
    expect(checkRateLimit("github:1.2.3.4", CONFIG).allowed).toBe(true);
  });
});
