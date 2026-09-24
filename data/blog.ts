import { getAllPosts, type PostFrontmatter } from "@/lib/post";
import { sortPostsByDate } from "@/lib/utils";
import type { Post, PostCategory } from "@/types";

// Category blurbs are static copy — everything else below is derived from
// content/*.mdx so a post published from the author studio appears on the
// site without hand-editing this file (or restarting the dev server).
export const descriptions = {
  travel:
    "In our Travel category, we embark on a journey of exploration, sharing personal experiences, tips, and stories from globetrotters passionate about traversing the world's diverse landscapes and cultures.",
  lifestyle:
    "Discover the essence of a traveler's lifestyle in this category, where we delve into personal stories, insights, and recommendations from a seasoned globetrotter's perspective. Explore the world of travel, fashion, cuisine, and more through the lens of a dedicated explorer.",
  destination:
    "Explore the essence of a traveler's lifestyle in our Destination category, where we delve into personal stories, insights, and recommendations from a seasoned globetrotter's perspective. Discover the world of travel, fashion, cuisine, and more through the lens of a dedicated explorer.",
};

function toCard({
  key,
  frontmatter,
}: {
  key: string;
  frontmatter: PostFrontmatter;
}): Post {
  return {
    key,
    slug: frontmatter.slug,
    image: frontmatter.image,
    title: frontmatter.title,
    description: frontmatter.description,
    tags: frontmatter.tags ?? [],
    postDate: new Date(frontmatter.date),
  };
}

// Reads the filesystem on every call — listings, category pages and related
// posts all re-read `content/` per request.
export function getBlogData(): Record<PostCategory, Post[]> {
  const data: Record<PostCategory, Post[]> = {
    travel: [],
    lifestyle: [],
    destination: [],
  };

  for (const post of getAllPosts()) {
    const category = post.frontmatter.category;
    if (!data[category]) continue;
    data[category].push(toCard(post));
  }

  for (const category of Object.keys(data) as PostCategory[]) {
    data[category] = sortPostsByDate(data[category]);
  }

  return data;
}

export function getBlogs(): Post[] {
  const data = getBlogData();
  return sortPostsByDate([
    ...data.travel,
    ...data.lifestyle,
    ...data.destination,
  ]);
}
