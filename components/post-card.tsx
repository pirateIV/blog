import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cva, VariantProps } from "class-variance-authority";
import { cx } from "@/utils/cx";
import { Post } from "@/types";
import DateCategory from "./date-category";

const postCardVariants = cva(
  "group w-full flex gap-2.5 text-[10px] not-[p]:font-semibold",
  {
    variants: {
      variant: {
        default: "flex-col",
        md: "flex-col @2xl:flex-row @2xl:[flex-flow:row] @2xl:items-center",
        sm: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface PostCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof postCardVariants> {
  blog: Post;
  className?: string;
  category?: string;
}

export default function PostCard({
  blog,
  className,
  category,
  variant = "default",
  ...props
}: PostCardProps) {
  return (
    <div
      className={cx(
        postCardVariants({ variant, className }),
        variant !== "sm" && "py-3.75"
      )}
      {...props}
    >
      <div
        className={cx(
          "relative aspect-[1.2/1] shrink-0 overflow-hidden",
          variant === "md" && "@2xl:aspect-[1.7/1] @2xl:w-62.5 h-full",
          variant === "sm" && "size-25"
        )}
      >
        <Image
          src={blog.image}
          sizes={
            variant === "default"
              ? "calc(min(314px,100vw))"
              : variant === "md"
              ? "287.5px"
              : "115px"
          }
          className={cx(
            "size-full object-cover scale-[115%]",
            "transition-transform duration-500 group-hover:scale-100"
          )}
          priority
          fill
          alt=""
        />
      </div>
      <div
        className={cx(
          "flex flex-col gap-2.5",
          variant === "md" && "@2xl:px-3.75 @2xl:py-5"
        )}
      >
        <DateCategory
          variant={variant}
          category={category}
          date={blog.postDate}
        />
        <Link
          href={`/blog/${blog.slug}`}
          className={cx(
            "inline-block font-playfair-display underline hover:decoration-background-dark/50 text-lg/[1.2em]",
            variant !== "sm" && "md:text-xl/[1.2em] lg:text-[22px]/[1.2em]"
          )}
        >
          {blog.title}
        </Link>
        {variant !== "sm" && (
          <p className="text-sm font-normal">{blog.description}</p>
        )}
      </div>
    </div>
  );
}
