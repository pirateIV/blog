import React from "react";
import PostCard from "../post-card";
import { CardVariants, Post } from "@/types";
import { getCategory } from "@/helpers/posts";
import PostHeader from "./post-header";
import PostsWrapper from "./posts-wrapper";

export default function PostsSection({
  title,
  data,
  category,
  variant = "default",
}: {
  title?: string;
  data: Post[];
  category?: string;
  variant?: CardVariants;
}) {
  return (
    <div className="pt-12.5 pb-25">
      {title && <PostHeader title={title} />}

      <PostsWrapper variant={variant}>
        {data?.map((blog) => (
          <React.Fragment key={blog.key}>
            <PostCard
              variant={variant}
              category={category ? category : getCategory(blog.key)}
              blog={blog}
            />
          </React.Fragment>
        ))}
      </PostsWrapper>
    </div>
  );
}
