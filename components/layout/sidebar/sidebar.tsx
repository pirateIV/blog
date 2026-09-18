import React from "react";
import TrendingPosts from "@/components/posts/trending-posts";
import BlogCategories from "@/components/blog-categories";
import AboutAuthor from "@/components/about-author";

export default function Sidebar() {
  return (
    <div className="self-start space-y-12.5 lg:w-[30%] lg:sticky lg:top-25">
      <AboutAuthor />
      <TrendingPosts />
      <BlogCategories />
    </div>
  );
}
