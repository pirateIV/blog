import type { MetadataRoute } from "next";
import { descriptions } from "@/data/blog";
import { getAllPosts } from "@/lib/post";

// Sitemap mirrors the site's request-time listings: content/*.mdx is read
// on every hit, so a freshly published post shows up without a redeploy.
export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lusia.vercel.app";

  const posts = getAllPosts()
    .filter((post) => post.frontmatter.slug)
    .map((post) => ({
      url: `${site}/blog/${post.frontmatter.slug}`,
      lastModified: new Date(post.frontmatter.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  // Category landing pages, keyed off the same copy map the site renders.
  const categories = Object.keys(descriptions).map((category) => ({
    url: `${site}/category/${category}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    { url: `${site}/`, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${site}/blog`, changeFrequency: "weekly" as const, priority: 0.9 },
    ...categories,
    ...posts,
  ];
}
