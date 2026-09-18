import path from "path";
import fs from "fs";
import matter from "gray-matter";
import { PostCategory } from "@/types";

export interface PostFrontmatter {
  title: string;
  slug: string;
  date: Date;
  category: PostCategory;
  image: string;
  description: string;
  [key: string]: any;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
}

const postsDirectory = path.join(process.cwd(), "content");

export function getPostSlugs(): string[] {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.mdx$/, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    frontmatter: data as PostFrontmatter,
    content,
  };
}

export function getAllPosts(): Post[] {
  return getPostSlugs().map(getPostBySlug);
}
