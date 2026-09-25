import Image from "next/image";
import Link from "next/link";
import ButtonLink from "@/components/button-link";
import DateCategory from "@/components/date-category";
import RecentPosts from "@/components/posts/recent-posts";
import { getBlogs } from "@/data/blog";
import { getCategory } from "@/helpers/posts";
import { getStories } from "@/utils/blog-posts-filter";
import { cx } from "@/utils/cx";

export default function Home() {
  const posts = getStories(getBlogs(), { limit: 6 });
  return (
    <div className="@container mx-auto max-w-305 px-5 pt-7.5 pb-15 md:px-7 md:pt-10 md:pb-20 lg:px-15 lg:pt-12.5 lg:pb-25">
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
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
                "mt-2 inline-block font-playfair-display font-semibold text-lg/[1.2em] hover:underline hover:decoration-background-dark/50 md:text-xl/[1.2em] lg:text-[22px]/[1.2em]",
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
