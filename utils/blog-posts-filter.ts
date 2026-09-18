import { blogs } from "@/data/blog";
import { Post, PostCategory } from "@/types";

// interface Posts {
//   posts: Record<PostCategory, Post[]>;
// }

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getRelatedPosts = (
  posts: Record<PostCategory, Post[]>,
  {
    category,
    limit,
    slug,
    shuffle = false,
  }: {
    category: PostCategory;
    slug: string;
    limit?: number;
    shuffle?: boolean;
  }
) => {
  const categoryPosts = posts[category];
  if (!categoryPosts) return [];

  let filteredPosts = categoryPosts.filter((post) => {
    return post.slug !== slug;
  });

  if (shuffle) {
    filteredPosts = shuffleArray(filteredPosts);
  }

  return typeof limit === "number"
    ? filteredPosts.slice(0, limit)
    : filteredPosts;
};

export const getStories = (
  posts: Post[],
  { shuffle = false, limit = 4 }: { shuffle?: boolean; limit?: number }
) => {
  let filteredPosts = posts;

  if (shuffle) {
    filteredPosts = shuffleArray(posts);
  }

  filteredPosts = filteredPosts.slice(0, limit);
  return filteredPosts;
};

export const getRecentPosts = (posts: Post[], limit = 4) => {
  return posts
    .sort(
      (a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime()
    )
    .slice(0, limit);
};
