import { NextResponse } from "next/server";
import {
  readFile,
  StorageError,
  storageErrorResponse,
  writeFile,
} from "@/lib/content-store";

// Public newsletter opt-in. Addresses accumulate in
// .studio/subscribers.json through the same content store the studio
// publishes with: local files in dev, a GitHub commit on Vercel — so the
// author reads them from the working tree / repo without any third-party
// service. NOTE: with GitHub storage the list is committed to the
// repository (the .studio/ gitignore only covers local commits) — keep the
// repo private if these addresses must not be public.
//
// The honeypot field gets a fake success so bots never learn they were
// filtered; each accepted address is at most one commit (deduped).

const SUBSCRIBERS_PATH = ".studio/subscribers.json";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;

type Subscriber = { email: string; at?: string };

async function readSubscribers(): Promise<Subscriber[]> {
  const snapshot = await readFile(SUBSCRIBERS_PATH);
  if (!snapshot?.contents.trim()) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(snapshot.contents);
  } catch (error) {
    // Never overwrite a list we could not read — fail loudly instead.
    console.error("[subscribe] subscribers file is not valid JSON", error);
    throw new StorageError("The subscriber list is unreadable", 500);
  }
  if (!Array.isArray(parsed)) {
    throw new StorageError("The subscriber list is unreadable", 500);
  }

  return parsed.filter(
    (entry): entry is Subscriber =>
      typeof entry === "object" &&
      entry !== null &&
      typeof (entry as Subscriber).email === "string",
  );
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let rawEmail: unknown;
    let honeypot: unknown;

    if (contentType.includes("application/json")) {
      const payload = (await request.json().catch(() => null)) as {
        email?: unknown;
        honeypot?: unknown;
      } | null;
      rawEmail = payload?.email;
      honeypot = payload?.honeypot;
    } else {
      // No-JS fallback: the plain HTML form posts urlencoded.
      const form = await request.formData().catch(() => null);
      rawEmail = form?.get("email");
      honeypot = form?.get("honeypot");
    }

    // Bot filled the hidden field — pretend everything worked.
    if (typeof honeypot === "string" && honeypot.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const email = String(rawEmail ?? "")
      .trim()
      .toLowerCase();
    if (
      !email ||
      email.length > MAX_EMAIL_LENGTH ||
      !EMAIL_PATTERN.test(email)
    ) {
      throw new StorageError("Please enter a valid email address", 400);
    }

    const subscribers = await readSubscribers();
    const alreadySubscribed = subscribers.some(
      (entry) => entry.email === email,
    );
    if (!alreadySubscribed) {
      subscribers.push({ email, at: new Date().toISOString() });
      await writeFile(
        SUBSCRIBERS_PATH,
        `${JSON.stringify(subscribers, null, 2)}\n`,
        "Add newsletter subscriber",
      );
    }

    return NextResponse.json(
      { ok: true, alreadySubscribed },
      { status: alreadySubscribed ? 200 : 201 },
    );
  } catch (error) {
    return storageErrorResponse(error, "[subscribe] save failed");
  }
}
