import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getStudioPassword,
  hasStudioSession,
  STUDIO_SESSION_COOKIE,
  sanitizeNextPath,
  signSessionToken,
} from "@/lib/studio-auth";
import {
  changeStudioPassword,
  verifyStudioPassword,
} from "@/lib/studio-credentials";

// Forms post here directly (no JS required): wrong password bounces back to
// the login screen, success sets the signed session cookie and continues.
// Verification checks the author's active credential — the password stored
// by the studio's change form when one exists, the STUDIO_PASSWORD default
// otherwise (see lib/studio-credentials).

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

  // Rotate the password — existing sessions only, so this can never be
  // used to gain access, only to change credentials once signed in.
  if (intent === "change-password") {
    if (!(await hasStudioSession(request))) {
      return NextResponse.json(
        { error: "Sign in to change the password" },
        { status: 401 },
      );
    }
    const result = await changeStudioPassword(
      String(form.get("currentPassword") ?? ""),
      String(form.get("newPassword") ?? ""),
    );
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ ok: true });
  }

  const password = getStudioPassword();
  if (!password) {
    // Protection is not configured — send the visitor to the explanation.
    return redirectTo(request.url, "/studio-login?error=config");
  }

  const provided = String(form.get("password") ?? "");
  let valid = false;
  try {
    valid = provided ? await verifyStudioPassword(provided) : false;
  } catch (error) {
    // Store unreachable (GitHub hiccup, rate limit) — not "wrong password".
    console.error("Password verification failed", error);
    return redirectTo(request.url, "/studio-login?error=storage");
  }

  if (valid) {
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
