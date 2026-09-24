import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
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

// Cover-image upload for the publish panel: writes the file into
// public/images/uploads/ under a generated name and returns its public URL.
export async function POST(request: Request) {
  if (!(await isAuthorizedApi(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  const directory = path.join(process.cwd(), "public", "images", "uploads");

  try {
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      path.join(directory, name),
      Buffer.from(await file.arrayBuffer()),
    );
  } catch (error) {
    console.error("Failed to save upload", error);
    return NextResponse.json(
      { error: "Could not save the image" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { ok: true, url: `/images/uploads/${name}` },
    { status: 201 },
  );
}
