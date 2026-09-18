import React from "react";
import { blogs } from "@/data/blog";
import { getRecentPosts } from "@/utils/blog-posts-filter";
import PostsSection from "./posts-section";

export default function RecentPosts() {
  const recentPosts = getRecentPosts(blogs);
  return <PostsSection title="Recent Posts" data={recentPosts} variant="md" />;
}
