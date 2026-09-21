import { describe, it, expect, beforeEach } from "vitest";
import {
  createSession,
  getSession,
  destroySession,
  readCookie,
  originMatchesHost,
  resetSessionStore,
} from "../sessions";

describe("session store", () => {
  beforeEach(() => {
    resetSessionStore();
  });

  it("stores the token server-side under an opaque id", () => {
    const id = createSession("gho_secrettoken", 60_000);
    expect(id).not.toContain("gho_secrettoken");
    expect(getSession(id)?.githubToken).toBe("gho_secrettoken");
  });

  it("returns null for unknown or missing ids", () => {
    expect(getSession(undefined)).toBeNull();
    expect(getSession("nope")).toBeNull();
  });

  it("expires sessions after the TTL", () => {
    const id = createSession("tok", 1_000);
    expect(getSession(id, Date.now() + 2_000)).toBeNull();
  });

  it("destroys sessions on demand", () => {
    const id = createSession("tok", 60_000);
    destroySession(id);
    expect(getSession(id)).toBeNull();
  });
});

describe("readCookie", () => {
  const mkReq = (cookie?: string) => ({
    headers: cookie ? { cookie } : {},
  }) as any;

  it("parses the target cookie out of a multi-cookie header", () => {
    const req = mkReq("a=1; vectora_session=abc123; b=2");
    expect(readCookie(req, "vectora_session")).toBe("abc123");
  });

  it("returns undefined when absent", () => {
    expect(readCookie(mkReq("a=1"), "vectora_session")).toBeUndefined();
    expect(readCookie(mkReq(undefined), "vectora_session")).toBeUndefined();
  });

  it("decodes URI-encoded values", () => {
    const req = mkReq("vectora_session=x%20y");
    expect(readCookie(req, "vectora_session")).toBe("x y");
  });
});

describe("originMatchesHost", () => {
  const mkReq = (origin?: string, host?: string) => ({
    headers: {
      ...(origin ? { origin } : {}),
      ...(host ? { host } : {}),
    },
  }) as any;

  it("allows same-origin requests", () => {
    expect(originMatchesHost(mkReq("https://app.example.com", "app.example.com"))).toBe(true);
  });

  it("rejects cross-origin requests", () => {
    expect(originMatchesHost(mkReq("https://evil.example", "app.example.com"))).toBe(false);
  });

  it("allows requests without an Origin header (same-site navigations)", () => {
    expect(originMatchesHost(mkReq(undefined, "app.example.com"))).toBe(true);
  });

  it("rejects malformed origins", () => {
    expect(originMatchesHost(mkReq("not-a-url", "app.example.com"))).toBe(false);
  });
});
