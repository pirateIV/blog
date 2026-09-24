import { type NextRequest, NextResponse } from "next/server";
import {
  hasStudioSession,
  isAuthorizedApi,
  isStudioPageOpen,
} from "@/lib/studio-auth";

// Gate for the author studio. Pages redirect to the login screen; API routes
// answer 401 so the publish, backup and upload endpoints can't be reached
// anonymously.
export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (await isAuthorizedApi(request)) return NextResponse.next();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if ((await hasStudioSession(request)) || isStudioPageOpen()) {
    return NextResponse.next();
  }

  const next = encodeURIComponent(`${pathname}${search}`);
  return NextResponse.redirect(
    new URL(`/studio-login?next=${next}`, request.url),
  );
}

export const config = {
  matcher: [
    "/studio/:path*",
    // Legacy studio URLs: gated here too, then bounced to /studio by the
    // session pass (or the next.config redirect once signed in).
    "/author/:path*",
    "/dashboard/:path*",
    "/api/publish",
    "/api/drafts",
    "/api/upload",
  ],
};
