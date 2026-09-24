import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  deleteFile,
  getStorageMode,
  readFile,
  storageErrorResponse,
  unavailableReason,
  writeFile,
} from "@/lib/content-store";
import { isAuthorizedApi } from "@/lib/studio-auth";

const CATEGORIES = ["travel", "lifestyle", "destination"] as const;
// Lowercase letters and single dashes only — this is also what keeps
// `key`/filenames free of path traversal ("../" can't match).
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_TITLE = 200;
const MAX_DESCRIPTION = 400;

type PublishBody = {
  title?: unknown;
  description?: unknown;
  content?: unknown;
  category?: unknown;
  image?: unknown;
  slug?: unknown;
  tags?: unknown;
  previousKey?: unknown;
  previousSlug?: unknown;
  overwrite?: unknown;
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

// Publish endpoint: writes content/<category>-<slug>.mdx with the
// frontmatter PostFrontmatter expects, then revalidates the routes that
// list it. The write goes through lib/content-store — straight to the
// filesystem in development, or as a GitHub commit on an immutable host
// (Vercel), which triggers the redeploy that makes the post public.
// Access requires a studio session (login page), an x-publish-token
// matching PUBLISH_TOKEN, or a dev server with neither secret configured.
export async function POST(request: Request) {
  if (!(await isAuthorizedApi(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storage = getStorageMode();
  if (storage === "unavailable") {
    return NextResponse.json({ error: unavailableReason() }, { status: 503 });
  }

  let body: PublishBody;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const category =
    typeof body.category === "string" &&
    (CATEGORIES as readonly string[]).includes(body.category)
      ? (body.category as (typeof CATEGORIES)[number])
      : null;
  const image =
    typeof body.image === "string" && body.image.trim()
      ? body.image.trim()
      : "";
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const previousKey =
    typeof body.previousKey === "string" &&
    body.previousKey &&
    SLUG_PATTERN.test(body.previousKey)
      ? body.previousKey
      : null;
  const previousSlug =
    typeof body.previousSlug === "string" &&
    body.previousSlug &&
    SLUG_PATTERN.test(body.previousSlug)
      ? body.previousSlug
      : null;
  const overwrite = body.overwrite === true;

  if (!title) return badRequest("A title is required");
  if (title.length > MAX_TITLE) return badRequest("Title is too long");
  if (!description) return badRequest("An excerpt is required");
  if (description.length > MAX_DESCRIPTION)
    return badRequest("Excerpt is too long");
  if (!content.trim()) return badRequest("The post body is empty");
  if (!category) return badRequest("Unknown category");
  if (!slug) return badRequest("A slug is required");
  if (!SLUG_PATTERN.test(slug)) {
    return badRequest(
      "Slug may only contain lowercase letters, numbers and dashes",
    );
  }

  const key = `${category}-${slug}`;
  const willRename = Boolean(previousKey && previousKey !== key);
  const ownsTarget = previousKey === key;
  const targetPath = `content/${key}.mdx`;

  try {
    const existing = await readFile(targetPath);

    // The target URL is taken by a *different* post (first publish colliding,
    // or a rename onto an existing slug) — require an explicit overwrite.
    if (existing && !ownsTarget && !overwrite) {
      return NextResponse.json(
        { error: `A post already uses /blog/${slug}` },
        { status: 409 },
      );
    }

    // Keep the original publish date across updates — including renames,
    // where the date lives in the file we're moving away from. Only first
    // publishes stamp today.
    let date = new Date().toISOString().slice(0, 10);
    const dateSource =
      existing ??
      (previousKey ? await readFile(`content/${previousKey}.mdx`) : null);
    if (dateSource) {
      const parsed = matter(dateSource.contents);
      if (typeof parsed.data.date === "string") date = parsed.data.date;
    }

    const frontmatter = {
      title,
      slug,
      date,
      category,
      image: image || `/images/${category}.jpg`,
      description,
      ...(tags.length ? { tags } : {}),
    };

    await writeFile(
      targetPath,
      matter.stringify(`\n${content}\n`, frontmatter),
      `${existing ? "update" : "publish"}: ${key}`,
    );

    // Renaming: drop the file that used to hold this draft. The write above
    // already succeeded, so a failure here must not fail the whole publish.
    if (willRename && previousKey) {
      const previousPath = `content/${previousKey}.mdx`;
      try {
        if (await readFile(previousPath)) {
          await deleteFile(previousPath, `unpublish (renamed): ${previousKey}`);
        }
      } catch (error) {
        console.error("Could not remove previous post file", error);
      }
    }
  } catch (error) {
    return storageErrorResponse(error, "Publish storage failed");
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/category/${category}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }

  return NextResponse.json(
    { ok: true, key, slug, url: `/blog/${slug}`, storage },
    { status: willRename ? 200 : 201 },
  );
}

type DeleteBody = {
  key?: unknown;
};

// Unpublish: removes content/<key>.mdx so the post leaves the public site.
// The studio draft — and its publishedKey — is cleared separately by the
// caller; republishing simply writes the file again.
export async function DELETE(request: Request) {
  if (!(await isAuthorizedApi(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storage = getStorageMode();
  if (storage === "unavailable") {
    return NextResponse.json({ error: unavailableReason() }, { status: 503 });
  }

  let body: DeleteBody;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const key = typeof body.key === "string" ? body.key : "";
  const separator = key.indexOf("-");
  const category = separator > 0 ? key.slice(0, separator) : "";
  const slug = separator > 0 ? key.slice(separator + 1) : "";

  // Same shape as POST: category in front, slug behind — both must match
  // the safe pattern, so "../" can never reach the filesystem or repo.
  if (
    !SLUG_PATTERN.test(key) ||
    !(CATEGORIES as readonly string[]).includes(category) ||
    !SLUG_PATTERN.test(slug)
  ) {
    return badRequest("Unknown post key");
  }

  try {
    const filePath = `content/${key}.mdx`;
    if (!(await readFile(filePath))) {
      return NextResponse.json(
        { error: "Post does not exist" },
        { status: 404 },
      );
    }
    await deleteFile(filePath, `unpublish: ${key}`);
  } catch (error) {
    return storageErrorResponse(error, "Unpublish storage failed");
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/category/${category}`);

  return NextResponse.json({ ok: true, key, storage });
}
