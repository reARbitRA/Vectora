import crypto from "crypto";
import type { Request, Response } from "express";

/**
 * Server-side session store for GitHub OAuth tokens.
 *
 * Previously the GitHub access token was handed to the browser and kept in
 * `localStorage.github_token`, then echoed back by the client to
 * `/api/github/sync`. That exposed a full-privilege `repo` token to any
 * successful XSS payload and let any client present any token to the sync
 * endpoint (confused deputy).
 *
 * Now: the callback page stores the token server-side under an opaque
 * session id, delivered as an HTTP-only, SameSite cookie. The browser never
 * sees the token; `/api/github/sync` authenticates via the session cookie.
 *
 * In-memory by design for this milestone (single instance). Swap the Map
 * for Redis/DB when scaling out; the interface is deliberately tiny.
 */

export const SESSION_COOKIE_NAME = "vectora_session";

interface Session {
  id: string;
  githubToken: string;
  createdAt: number;
  expiresAt: number;
}

const sessions = new Map<string, Session>();

/** Test seam. */
export function resetSessionStore(): void {
  sessions.clear();
}

/** Test seam / diagnostics. */
export function activeSessionCount(): number {
  return sessions.size;
}

function sweep(now: number): void {
  for (const [id, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(id);
  }
}

export function createSession(githubToken: string, ttlMs: number): string {
  const id = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  sweep(now);
  sessions.set(id, {
    id,
    githubToken,
    createdAt: now,
    expiresAt: now + ttlMs,
  });
  return id;
}

export function getSession(
  sessionId: string | undefined,
  now: number = Date.now(),
): Session | null {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt <= now) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

export function destroySession(sessionId: string | undefined): void {
  if (sessionId) sessions.delete(sessionId);
}

/** Parse a single cookie value out of the `Cookie` header (no dependency needed). */
export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return undefined;
}

export function sessionFromRequest(req: Request): Session | null {
  return getSession(readCookie(req, SESSION_COOKIE_NAME));
}

/** Attach the session cookie to a response. HTTP-only by default. */
export function setSessionCookie(
  res: Response,
  sessionId: string,
  ttlMs: number,
): void {
  res.setHeader(
    "Set-Cookie",
    [
      `${SESSION_COOKIE_NAME}=${sessionId}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${Math.floor(ttlMs / 1000)}`,
      // Secure cookies require HTTPS; enable automatically when not developing locally.
      process.env.NODE_ENV === "production" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; "),
  );
}

export function clearSessionCookie(res: Response): void {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
}

/**
 * Best-effort origin check for cookie-authenticated state-changing routes.
 * Browsers always send `Origin` on cross-site fetches; when present it must
 * match the request host, otherwise the request is treated as cross-site and
 * rejected. (Same-site requests may omit the header and are allowed.)
 */
export function originMatchesHost(req: Request): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = req.headers.host;
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
