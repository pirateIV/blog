import React from "react";
import PostsSection from "./posts-section";
import { getStories } from "@/utils/blog-posts-filter";
import { blogs } from "@/data/blog";

export default function Stories() {
  const stories = getStories(blogs, { shuffle: true, limit: 4 });
  return <PostsSection title="Read My Stories" data={stories} />;
}
