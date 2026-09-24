import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getStudioPassword,
  STUDIO_SESSION_COOKIE,
  sanitizeNextPath,
  signSessionToken,
} from "@/lib/studio-auth";

// Forms post here directly (no JS required): wrong password bounces back to
// the login screen, success sets the signed session cookie and continues.
async function passwordMatches(
  provided: string,
  expected: string,
): Promise<boolean> {
  // Compare digests so the comparison is length-independent.
  const a = createHash("sha256").update(provided, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

function redirectTo(base: string, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, base), 303);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const intent = form.get("intent");
  const next = sanitizeNextPath(form.get("next"));
  const store = await cookies();

  if (intent === "logout") {
    store.delete(STUDIO_SESSION_COOKIE);
    return redirectTo(request.url, next);
  }

  const password = getStudioPassword();
  if (!password) {
    // Protection is not configured — send the visitor to the explanation.
    return redirectTo(request.url, "/studio-login?error=config");
  }

  const provided = String(form.get("password") ?? "");
  if (provided && (await passwordMatches(provided, password))) {
    const token = await signSessionToken();
    if (token) {
      store.set(STUDIO_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
      return redirectTo(request.url, next);
    }
  }

  // Small delay to slow down password guessing.
  await new Promise((resolve) => setTimeout(resolve, 400));
  const error = new URLSearchParams({ error: "password", next });
  return redirectTo(request.url, `/studio-login?${error.toString()}`);
}
