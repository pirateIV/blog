import React from "react";
import { PostCategory } from "@/types";
import { blogData } from "@/data/blog";
import { getRelatedPosts } from "@/utils/blog-posts-filter";
import PostsSection from "./posts-section";

type RelatedPostsProps = {
  category: PostCategory;
  slug: string;
};

export default function RelatedPosts({ category, slug }: RelatedPostsProps) {
  const relatedPosts = getRelatedPosts(blogData, {
    category: category,
    slug: slug,
    limit: 4,
    shuffle: true,
  });

  return (
    <PostsSection
      title="Related posts"
      category={category}
      data={relatedPosts}
    />
  );
}
