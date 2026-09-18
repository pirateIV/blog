import React from "react";
import Link from "next/link";
import { EllipsisVertical } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Post } from "@/types";
import Image from "next/image";
import { cx } from "@/utils/cx";

type BlogPostCardProps = {
  blog: Post;
  className?: string;
  category?: string;
  imageSize?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export default function BlogPostCard({
  blog,
  category,
  imageSize,
  className,
  ...props
}: BlogPostCardProps) {
  // Generate post through the "postId" prop
  return (
    <div
      className={cx(
        "group flex flex-col text-[10px] gap-2.5 py-3.75 not-[p]:font-semibold w-full",
        className
      )}
      {...props}
    >
      <div className="relative aspect-[1.2/1] @3xl:aspect-[1.7/1] shrink-0 overflow-hidden @3xl:w-62.5">
        <Image
          src={blog.image}
          sizes={imageSize || "calc(min(314px,100vw))"}
          className="size-full object-cover scale-[115%] group-hover:scale-100 transition-transform duration-500"
          priority
          fill
          alt=""
        />
      </div>
      <div className="flex flex-col gap-2.5" data-content>
        <div className="flex items-center text-accent-orange gap-0.5">
          <span>{formatDate(blog.postDate)}</span>
          <EllipsisVertical className="size-2.5" />
          <span className="uppercase">{category}</span>
        </div>
        <Link
          href={`/blog/${blog.slug}`}
          className="text-[22px]/[1.2em] font-playfair-display inline-block hover:underline"
        >
          {blog.title}
        </Link>
        <p className="text-sm font-normal">{blog.description}</p>
      </div>
    </div>
  );
}
