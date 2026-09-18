import Link from "next/link";
import Image from "next/image";

import { cx } from "@/utils/cx";
import { blogs } from "@/data/blog";
import { getCategory } from "@/helpers/posts";
import { getStories } from "@/utils/blog-posts-filter";
import RecentPosts from "@/components/posts/recent-posts";
import ButtonLink from "@/components/button-link";
import DateCategory from "@/components/date-category";

export default function Home() {
  const posts = getStories(blogs, { limit: 6 });
  return (
    <div className="max-w-305 mx-auto @container">
      {/* <PostsSection data={posts} /> */}
      <div className="grid grid-cols-4 gap-5">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="flex flex-col items-center text-center"
          >
            <Image
              src={post.image}
              className="flex-1 object-cover"
              sizes="calc(280px * 1.15)"
              width="576"
              height="1024"
              alt={post.title}
            />
            <DateCategory
              variant="default"
              category={getCategory(post.key)}
              date={post.postDate}
            />
            <Link
              href={`/blog/${post.slug}`}
              className={cx(
                "mt-2 inline-block font-semibold font-playfair-display hover:underline hover:decoration-background-dark/50 text-lg/[1.2em]md:text-xl/[1.2em] lg:text-[22px]/[1.2em]"
              )}
            >
              {post.title}
            </Link>
          </div>
        ))}
      </div>
      <RecentPosts />
      <ButtonLink href="/blog">More Posts</ButtonLink>
    </div>
  );
}
