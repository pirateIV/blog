// Shared authentication for the author studio: /author, /dashboard,
// /api/publish and /api/drafts all sit behind one gate.
//
// Design:
//   - STUDIO_PASSWORD set      -> pages require a signed session cookie
//                                 (issued by /api/studio-auth), APIs accept
//                                 the cookie or an x-publish-token header.
//   - STUDIO_PASSWORD unset    -> open in dev only; production refuses.
//   - PUBLISH_TOKEN            -> optional script access to the APIs.
//
// Only Web Crypto is used here so the same code runs in the proxy (edge-ish
// runtime) and in Node route handlers. Helpers that need `node:crypto`
// (password comparison at login time) live in the route that uses them.

import "server-only";

export const STUDIO_SESSION_COOKIE = "studio_session";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function getStudioPassword(): string | null {
  const value = process.env.STUDIO_PASSWORD?.trim();
  return value ? value : null;
}

// Pages are open in dev until a password is configured; production always
// requires one (the login page explains how to set it).
export function isStudioPageOpen(): boolean {
  return !getStudioPassword() && process.env.NODE_ENV !== "production";
}

// Constant-time-ish string comparison (no early exit on first difference).
export function constantTimeEqual(a: string, b: string): boolean {
  const encodedA = new TextEncoder().encode(a);
  const encodedB = new TextEncoder().encode(b);
  let diff = encodedA.length ^ encodedB.length;

  for (let i = 0; i < Math.max(encodedA.length, encodedB.length); i++) {
    diff |= (encodedA[i] ?? 0) ^ (encodedB[i] ?? 0);
  }

  return diff === 0;
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Issues "<expiry>.<hmac>" bound to the password. Null when unconfigured. */
export async function signSessionToken(): Promise<string | null> {
  const password = getStudioPassword();
  if (!password) return null;

  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  const mac = await hmacHex(password, `studio-session:${expiresAt}`);
  return `${expiresAt}.${mac}`;
}

export async function verifySessionToken(
  token: string | null | undefined,
): Promise<boolean> {
  if (!token) return false;
  const password = getStudioPassword();
  if (!password) return false;

  const separator = token.indexOf(".");
  if (separator <= 0) return false;

  const expiresAt = token.slice(0, separator);
  const mac = token.slice(separator + 1);
  if (!/^\d+$/.test(expiresAt) || !/^[0-9a-f]{64}$/.test(mac)) return false;
  if (Number(expiresAt) < Date.now()) return false;

  const expected = await hmacHex(password, `studio-session:${expiresAt}`);
  return constantTimeEqual(mac, expected);
}

export function parseCookieHeader(
  header: string | null,
): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;

  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    if (!name) continue;
    try {
      cookies[name] = decodeURIComponent(part.slice(index + 1).trim());
    } catch {
      cookies[name] = part.slice(index + 1).trim();
    }
  }

  return cookies;
}

export async function hasStudioSession(request: Request): Promise<boolean> {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  return verifySessionToken(cookies[STUDIO_SESSION_COOKIE]);
}

/** API authorization: session cookie, script token, or the dev-only open door. */
export async function isAuthorizedApi(request: Request): Promise<boolean> {
  if (await hasStudioSession(request)) return true;

  const token = process.env.PUBLISH_TOKEN;
  const provided = request.headers.get("x-publish-token");
  if (token && provided && constantTimeEqual(provided, token)) return true;

  // No password and no API token configured: open outside production only.
  return (
    !getStudioPassword() && !token && process.env.NODE_ENV !== "production"
  );
}

/**
 * Where to send the user after signing in — only same-site absolute paths,
 * so `?next=//evil.example` can't turn the login into an open redirect.
 */
export function sanitizeNextPath(value: unknown): string {
  if (typeof value !== "string") return "/author";
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return "/author";
  }
  return value;
}
