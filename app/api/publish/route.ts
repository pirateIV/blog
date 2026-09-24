import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getPostFile, postExists } from "@/lib/post";
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

// Dev-only publish endpoint: writes content/<category>-<slug>.mdx with the
// frontmatter PostFrontmatter expects, then revalidates the routes that
// list it. Access requires a studio session (login page), an x-publish-token
// matching PUBLISH_TOKEN, or a dev server with neither secret configured.
export async function POST(request: Request) {
  if (!(await isAuthorizedApi(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  const file = getPostFile(key);
  const willRename = Boolean(previousKey && previousKey !== key);
  const ownsTarget = previousKey === key;

  // The target URL is taken by a *different* post (first publish colliding,
  // or a rename onto an existing slug) — require an explicit overwrite.
  if (postExists(key) && !ownsTarget && !overwrite) {
    return NextResponse.json(
      { error: `A post already uses /blog/${slug}` },
      { status: 409 },
    );
  }

  // Keep the original publish date across updates — including renames, where
  // the date lives in the file we're moving away from. Only first publishes
  // stamp today.
  let date = new Date().toISOString().slice(0, 10);
  const dateSource = postExists(key)
    ? file
    : previousKey && postExists(previousKey)
      ? getPostFile(previousKey)
      : null;
  if (dateSource) {
    const existing = matter(fs.readFileSync(dateSource, "utf-8"));
    if (typeof existing.data.date === "string") date = existing.data.date;
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

  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      matter.stringify(`\n${content}\n`, frontmatter),
      "utf-8",
    );
  } catch (error) {
    console.error("Failed to write post", error);
    return NextResponse.json(
      { error: "Could not write the post file" },
      { status: 500 },
    );
  }

  // Renaming: drop the file that used to hold this draft. The write above
  // already succeeded, so a failure here must not fail the whole publish.
  if (willRename && previousKey && postExists(previousKey)) {
    try {
      fs.rmSync(getPostFile(previousKey));
    } catch (error) {
      console.error("Could not remove previous post file", error);
    }
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/category/${category}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }

  return NextResponse.json(
    { ok: true, key, slug, url: `/blog/${slug}` },
    { status: willRename ? 200 : 201 },
  );
}
