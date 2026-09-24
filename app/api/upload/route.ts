import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getStorageMode,
  storageErrorResponse,
  unavailableReason,
  writeFile,
} from "@/lib/content-store";
import { isAuthorizedApi } from "@/lib/studio-auth";

const MAX_BYTES = 5 * 1024 * 1024;
// The extension comes from this map only — never from the request filename.
const ACCEPTED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

// Cover-image upload for the publish panel: stores the file under
// public/images/uploads/ with a generated name and returns its public URL.
// The bytes go through lib/content-store — filesystem in dev, a GitHub
// commit (followed by a redeploy) on an immutable host like Vercel.
export async function POST(request: Request) {
  if (!(await isAuthorizedApi(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storage = getStorageMode();
  if (storage === "unavailable") {
    return NextResponse.json({ error: unavailableReason() }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart form data" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Attach an image as the 'file' field" },
      { status: 400 },
    );
  }

  const extension = ACCEPTED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Only jpg, png, webp, gif or avif images are allowed" },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image is larger than 5MB" },
      { status: 413 },
    );
  }

  // Keep a readable prefix of the original name, but the random suffix
  // decides uniqueness and the extension comes from the type map above,
  // so a crafted filename cannot escape the uploads directory.
  const base =
    file.name
      .replace(/\.[^.]*$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "cover";
  const name = `${base}-${randomBytes(4).toString("hex")}.${extension}`;

  try {
    await writeFile(
      `public/images/uploads/${name}`,
      Buffer.from(await file.arrayBuffer()),
      `upload: images/uploads/${name}`,
    );
  } catch (error) {
    return storageErrorResponse(error, "Upload storage failed");
  }

  return NextResponse.json(
    { ok: true, url: `/images/uploads/${name}`, storage },
    { status: 201 },
  );
}
