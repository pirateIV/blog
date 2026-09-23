import { getBlogs } from "@/data/blog";

export function getPostSlugs(): string[] {
  return getBlogs().map(({ slug }) => slug);
}

// Slug → .mdx filename. Returns null for URLs that aren't published posts
// (mistyped links, posts deleted or renamed) so callers can 404 instead of
// crashing the page with a thrown error.
export function getMDXSlugKey(s: string): string | null {
  return getBlogs().find(({ slug }) => slug === s)?.key ?? null;
}

export function getPostsByKey(keys: string[]) {
  return getBlogs().filter(({ key }) => keys.includes(key));
}

export function getCategory(key: string) {
  return key.split("-")[0];
}
