import React from "react";
import PostCard from "../post-card";
import { getCategory, getPostsByKey } from "@/helpers/posts";
import { SidebarItem } from "../layout/sidebar/sidebar-item";

const trendingPosts = getPostsByKey([
  "travel-06",
  "travel-07",
  "lifestyle-02",
  "destination-05",
]);

export default function TrendingPosts() {
  return (
    <SidebarItem>
      <h3 className="text-xl font-semibold">Trending Posts</h3>
      {trendingPosts.map((post) => (
        <PostCard
          key={post.key}
          variant="sm"
          category={getCategory(post.key)}
          blog={post}
        />
      ))}
    </SidebarItem>
  );
}
