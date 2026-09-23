import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { PostCategory } from "@/types";

export interface PostFrontmatter {
  title: string;
  slug: string;
  date: Date;
  category: PostCategory;
  image: string;
  description: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface Post {
  /** Filename without extension, e.g. "travel-01". Also the React/list key. */
  key: string;
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
}

const postsDirectory = path.join(process.cwd(), "content");

/** Absolute path of the .mdx file that holds the post with this key. */
export function getPostFile(key: string): string {
  return path.join(postsDirectory, `${key}.mdx`);
}

export function postExists(key: string): boolean {
  return fs.existsSync(getPostFile(key));
}

export function getPostSlugs(): string[] {
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getPostBySlug(key: string): Post {
  const realSlug = key.replace(/\.mdx$/, "");
  const fileContents = fs.readFileSync(getPostFile(realSlug), "utf-8");
  const { data, content } = matter(fileContents);

  return {
    key: realSlug,
    slug: realSlug,
    frontmatter: data as PostFrontmatter,
    content,
  };
}

export function getAllPosts(): Post[] {
  return getPostSlugs().map(getPostBySlug);
}
