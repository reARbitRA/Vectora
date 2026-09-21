import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, type ChildProcess } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Integration tests: boot the real server (tsx server.ts) on a scratch port
 * with the AI key and GitHub credentials withheld, then exercise the
 * security-relevant behavior: health, auth gates, session enforcement,
 * OAuth state validation, and rate limiting.
 */

// Random port per run avoids collisions with orphaned servers from failed runs.
const PORT = 4100 + Math.floor(Math.random() * 2000);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

let server: ChildProcess;
let serverOutput = "";

async function waitForServer(timeoutMs = 30_000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    if (server.exitCode !== null) {
      throw new Error(`Server exited early (code ${server.exitCode}). Output:\n${serverOutput}`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server did not become ready in time. Output:\n${serverOutput}`);
}

beforeAll(async () => {
  server = spawn("npx", ["tsx", "server.ts"], {
    cwd: path.resolve(__dirname, "../.."),
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: "production",
      // Withhold credentials so endpoints take their "unconfigured" paths.
      GEMINI_API_KEY: "",
      GITHUB_CLIENT_ID: "test-client-id",
      GITHUB_CLIENT_SECRET: "test-client-secret",
      // Tight light-endpoint budget so the rate-limit test is fast; the
      // github budget is raised because this suite itself makes ~11 calls
      // to that group while validating the OAuth flow.
      RATE_LIMIT_LIGHT_MAX: "8",
      RATE_LIMIT_GITHUB_MAX: "30",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout?.on("data", (d) => (serverOutput += d.toString()));
  server.stderr?.on("data", (d) => (serverOutput += d.toString()));
  await waitForServer();
}, 60_000);

afterAll(() => {
  server?.kill("SIGTERM");
});

describe("GET /api/health", () => {
  it("reports ok with AI unconfigured", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.aiConfigured).toBe(false);
  });
});

describe("AI endpoints without GEMINI_API_KEY", () => {
  it("return 503 with isOffline", async () => {
    const res = await fetch(`${BASE_URL}/api/generate-svg`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "a circle" }),
    });
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.isOffline).toBe(true);
  });
});

describe("GitHub session enforcement", () => {
  it("rejects /api/github/sync without a session cookie (401)", async () => {
    const res = await fetch(`${BASE_URL}/api/github/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo: "a/b", path: "x.svg", content: "<svg/>" }),
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/not authenticated/i);
  });

  it("ignores client-provided tokens in the body (token is not accepted from clients)", async () => {
    const res = await fetch(`${BASE_URL}/api/github/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "gho_forged_token",
        repo: "a/b",
        path: "x.svg",
        content: "<svg/>",
      }),
    });
    expect(res.status).toBe(401);
  });

  it("rejects cross-origin sync requests even with a session-shaped cookie", async () => {
    const res = await fetch(`${BASE_URL}/api/github/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://evil.example",
        Cookie: "vectora_session=forged",
      },
      body: JSON.stringify({ repo: "a/b", path: "x.svg", content: "<svg/>" }),
    });
    // Forged session id does not exist → 401 (never reaches GitHub).
    expect(res.status).toBe(401);
  });

  it("reports disconnected status and allows logout", async () => {
    const status = await fetch(`${BASE_URL}/api/auth/github/status`);
    expect(status.status).toBe(200);
    expect((await status.json()).connected).toBe(false);

    const logout = await fetch(`${BASE_URL}/api/auth/github/logout`, { method: "POST" });
    expect(logout.status).toBe(200);
    expect((await logout.json()).success).toBe(true);
  });
});

describe("OAuth state (CSRF) validation", () => {
  it("issues an authorize URL containing a state parameter", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/github/url`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toContain("https://github.com/login/oauth/authorize");
    expect(body.url).toMatch(/state=[a-f0-9]{48}/);
    // The state itself is not leaked to the client response anymore.
    expect(body.state).toBeUndefined();
  });

  it("rejects the callback with a missing or forged state (403)", async () => {
    const missing = await fetch(`${BASE_URL}/api/auth/github/callback?code=abc`);
    expect(missing.status).toBe(403);

    const forged = await fetch(
      `${BASE_URL}/api/auth/github/callback?code=abc&state=forgedstate`,
    );
    expect(forged.status).toBe(403);
  });

  it("consumes a valid state and rejects replay (no network call needed)", async () => {
    const urlRes = await fetch(`${BASE_URL}/api/auth/github/url`);
    const { url } = await urlRes.json();
    const state = new URL(url).searchParams.get("state")!;

    // First use: state validates, then the code exchange fails (fake code) —
    // we only assert that we get PAST state validation (i.e., not a 403).
    const first = await fetch(`${BASE_URL}/api/auth/github/callback?code=fake&state=${state}`);
    expect(first.status).not.toBe(403);

    // Replay: the consumed state must now be rejected.
    const replay = await fetch(`${BASE_URL}/api/auth/github/callback?code=fake&state=${state}`);
    expect(replay.status).toBe(403);
  });
});

describe("rate limiting", () => {
  it("returns 429 with Retry-After once the budget is exhausted", async () => {
    // The light budget is 8/min in this test run; /api/health was hit a few
    // times above, so hammer it until the limiter trips.
    let saw429 = false;
    let lastStatus = 0;
    for (let i = 0; i < 20 && !saw429; i++) {
      const res = await fetch(`${BASE_URL}/api/health`);
      lastStatus = res.status;
      if (res.status === 429) {
        saw429 = true;
        expect(res.headers.get("retry-after")).toBeTruthy();
        const body = await res.json();
        expect(body.error).toMatch(/rate limit/i);
      }
    }
    expect(saw429, `expected a 429 before running out of attempts (last: ${lastStatus})`).toBe(true);
  });
});
