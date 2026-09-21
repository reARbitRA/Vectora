import crypto from "crypto";

/**
 * Server-side store for OAuth 2.0 `state` tokens (CSRF protection).
 *
 * Previously the server generated a `state` value but never validated it
 * on callback, which left the GitHub OAuth flow open to CSRF and
 * confused-deputy attacks. This module issues single-use states with a
 * bounded lifetime and validates + consumes them during the callback.
 *
 * Storage is in-memory: acceptable for a single-instance deployment and
 * strictly better than no validation. Multi-instance deployments should
 * back this with a shared store.
 */

interface PendingState {
  issuedAt: number;
  expiresAt: number;
}

const pending = new Map<string, PendingState>();

/** Test seam. */
export function resetOAuthStateStore(): void {
  pending.clear();
}

export function issueOAuthState(ttlMs: number): string {
  const state = crypto.randomBytes(24).toString("hex");
  const now = Date.now();
  pending.set(state, { issuedAt: now, expiresAt: now + ttlMs });

  // Opportunistic cleanup so the map cannot grow unbounded.
  for (const [key, entry] of pending) {
    if (entry.expiresAt <= now) pending.delete(key);
  }
  return state;
}

export interface StateValidation {
  valid: boolean;
  reason?: "missing" | "unknown" | "expired";
}

/**
 * Validate and consume a state token. States are single-use: a replayed
 * value is rejected even if it has not expired yet.
 */
export function validateOAuthState(
  state: unknown,
  now: number = Date.now(),
): StateValidation {
  if (typeof state !== "string" || state.length === 0) {
    return { valid: false, reason: "missing" };
  }
  const entry = pending.get(state);
  if (!entry) {
    return { valid: false, reason: "unknown" };
  }
  pending.delete(state);
  if (entry.expiresAt <= now) {
    return { valid: false, reason: "expired" };
  }
  return { valid: true };
}
