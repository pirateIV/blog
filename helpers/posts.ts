import { blogs } from "@/data/blog";

export function getPostSlugs(): string[] {
  return blogs.map(({ slug }) => slug);
}

export function getMDXSlugKey(s: string) {
  const match = blogs.find(({ slug }) => slug === s);
  if (!match) throw new Error(`Not blog key found for slug: ${s}`);
  return match.key;
}

export function getPostsByKey(keys: string[]) {
  return blogs.filter(({ key }) => keys.includes(key));
}

export function getCategory(key: string) {
  return key.split("-")[0];
}
