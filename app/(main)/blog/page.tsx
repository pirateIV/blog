import React from "react";
import { blogs } from "@/data/blog";
import { getCategory } from "@/helpers/posts";
import PostCard from "@/components/post-card";

export default function Blogs() {
  return (
    <div className="flex items-center justify-center pt-7.5 px-5 pb-15 md:pt-10 md:px-7 md:pb-20 lg:pt-12.5 lg:px-15 lg:pb-25">
      <div className="max-w-305 w-full">
        <div className="grid grid-cols-[minmax(100px,1fr)] md:grid-cols-[repeat(2,minmax(100px,1fr))] lg:grid-cols-[repeat(3,minmax(100px,1fr))] gap-5">
          {blogs.map((blog) => (
            <PostCard
              key={blog.key}
              category={getCategory(blog.key)}
              blog={blog}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
