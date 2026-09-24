import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAuthorizedApi } from "@/lib/studio-auth";

// Server-side backup of the studio's drafts. The client keeps localStorage as
// its working copy and mirrors every save here, restoring from this file when
// localStorage comes up empty (cleared browser data, new machine).
//
// POST is an alias for PUT because `navigator.sendBeacon` — used when the tab
// is closing — can only POST.

const BACKUP_DIR = path.join(process.cwd(), ".studio");
const BACKUP_FILE = path.join(BACKUP_DIR, "drafts.json");
const MAX_BYTES = 2_000_000; // drafts are small; anything bigger is wrong

async function authorize(request: Request): Promise<NextResponse | null> {
  if (await isAuthorizedApi(request)) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function isValidBackup(
  body: unknown,
): body is { drafts: unknown[]; activeDraftId: string } {
  if (!body || typeof body !== "object") return false;
  const candidate = body as { drafts?: unknown; activeDraftId?: unknown };
  return (
    Array.isArray(candidate.drafts) &&
    candidate.drafts.length > 0 &&
    typeof candidate.activeDraftId === "string" &&
    candidate.activeDraftId.length > 0
  );
}

async function readBackup(): Promise<string | null> {
  try {
    return await fs.promises.readFile(BACKUP_FILE, "utf8");
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const denied = await authorize(request);
  if (denied) return denied;

  const backup = await readBackup();
  if (!backup) {
    return NextResponse.json({ error: "No backup yet" }, { status: 404 });
  }

  return new NextResponse(backup, {
    headers: { "Content-Type": "application/json" },
  });
}

async function saveBackup(request: Request): Promise<NextResponse> {
  const denied = await authorize(request);
  if (denied) return denied;

  const raw = await request.text();
  if (raw.length > MAX_BYTES) {
    return NextResponse.json({ error: "Backup too large" }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidBackup(parsed)) {
    return NextResponse.json(
      { error: "Expected { drafts: [...], activeDraftId }" },
      { status: 400 },
    );
  }

  try {
    await fs.promises.mkdir(BACKUP_DIR, { recursive: true });
    // Write to a temp file first so a crash mid-save can't truncate the
    // existing backup.
    const temp = `${BACKUP_FILE}.tmp`;
    await fs.promises.writeFile(temp, JSON.stringify(parsed, null, 2), "utf8");
    await fs.promises.rename(temp, BACKUP_FILE);
  } catch (error) {
    console.error("Draft backup failed", error);
    return NextResponse.json(
      { error: "Could not write backup" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}

export async function PUT(request: Request) {
  return saveBackup(request);
}

export async function POST(request: Request) {
  return saveBackup(request);
}
