import { describe, it, expect, beforeEach } from "vitest";
import { issueOAuthState, validateOAuthState, resetOAuthStateStore } from "../oauthState";

describe("OAuth state store", () => {
  beforeEach(() => {
    resetOAuthStateStore();
  });

  it("accepts a freshly issued state", () => {
    const state = issueOAuthState(60_000);
    expect(validateOAuthState(state)).toEqual({ valid: true });
  });

  it("rejects missing or malformed states", () => {
    expect(validateOAuthState(undefined).reason).toBe("missing");
    expect(validateOAuthState("").reason).toBe("missing");
    expect(validateOAuthState(12345).reason).toBe("missing");
    expect(validateOAuthState("forged-value").reason).toBe("unknown");
  });

  it("is single-use: a replayed state is rejected", () => {
    const state = issueOAuthState(60_000);
    expect(validateOAuthState(state).valid).toBe(true);
    expect(validateOAuthState(state).valid).toBe(false);
    expect(validateOAuthState(state).reason).toBe("unknown");
  });

  it("expires states after the TTL", () => {
    // Issue with a 1ms TTL, then validate with a clock that has advanced
    // past expiry (relative to the real clock used at issue time).
    const state = issueOAuthState(1);
    expect(validateOAuthState(state, Date.now() + 5).reason).toBe("expired");
  });
});
