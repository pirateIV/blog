import { cookies } from "next/headers";
import {
  getStudioPassword,
  STUDIO_SESSION_COOKIE,
  sanitizeNextPath,
  verifySessionToken,
} from "@/lib/studio-auth";

export const metadata = {
  title: "Studio login",
};

// Plain HTML form -> /api/studio-auth. Works without JavaScript, which keeps
// the gate independent of the client bundle.
export default async function StudioLogin({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = sanitizeNextPath(params.next);
  const password = getStudioPassword();

  const store = await cookies();
  const signedIn = await verifySessionToken(
    store.get(STUDIO_SESSION_COOKIE)?.value,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-5 dark:bg-neutral-950">
      <div className="w-full max-w-95 rounded-lg border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="font-playfair-display font-semibold text-2xl">
          Author studio
        </h1>
        <p className="mt-1 text-neutral-500 text-sm">
          Drafts, the editor and publishing tools live behind this door.
        </p>

        {!password && (
          <div className="mt-5 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-800 text-sm dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
            <p className="font-semibold">Protection is switched off</p>
            <p className="mt-1 text-xs">Set a password to require sign-in:</p>
            <code className="mt-2 block rounded bg-white/70 px-2 py-1 text-xs dark:bg-black/40">
              STUDIO_PASSWORD=your-password
            </code>
            <p className="mt-2 text-xs">
              Put it in <code>.env.local</code> and restart the server (on
              production, redeploy).
            </p>
          </div>
        )}

        {password && signedIn && (
          <div className="mt-5 flex flex-col gap-3">
            <p className="text-sm">You are signed in.</p>
            <div className="flex items-center gap-2">
              <a
                href={next}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground text-sm transition-all hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Continue to the studio
              </a>
              <form method="POST" action="/api/studio-auth">
                <input type="hidden" name="intent" value="logout" />
                <input type="hidden" name="next" value="/" />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 font-medium text-sm shadow-xs transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        )}

        {password && !signedIn && (
          <form
            method="POST"
            action="/api/studio-auth"
            className="mt-5 flex flex-col gap-3"
          >
            <input type="hidden" name="next" value={next} />
            <label className="flex flex-col gap-1.5 font-semibold text-xs">
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </label>

            {params.error === "password" && (
              <p className="text-red-500 text-xs">
                Wrong password — try again.
              </p>
            )}

            {params.error === "storage" && (
              <p className="text-red-500 text-xs">
                Couldn&apos;t reach the password store — try again in a minute.
              </p>
            )}

            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground text-sm transition-all hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Sign in
            </button>
            <p className="text-[11px] text-neutral-500">
              Stays signed in for 30 days on this browser.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
