import type { Metadata } from "next";
import ButtonLink from "@/components/button-link";
import PostCard from "@/components/post-card";
import { getBlogs } from "@/data/blog";
import { getCategory } from "@/helpers/posts";

export const metadata: Metadata = {
  title: "Search",
  description: "Search posts on Lusia.",
};

// Frontmatter search: title, description, tags and category. The page is a
// server component, so results are in the HTML (shareable URLs, works
// without JS from the nav's GET form).
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const needle = query.toLowerCase();

  const results = query
    ? getBlogs().filter((post) => {
        const haystack = [
          post.title,
          post.description ?? "",
          ...(post.tags ?? []),
        ];
        return (
          haystack.some((value) => value.toLowerCase().includes(needle)) ||
          getCategory(post.key).includes(needle)
        );
      })
    : [];

  return (
    <div className="flex items-start justify-center px-5 pt-7.5 pb-15 md:px-7 md:pt-10 md:pb-20 lg:px-15 lg:pt-12.5 lg:pb-25">
      <div className="w-full max-w-305">
        <h1 className="font-playfair-display font-semibold text-[40px]">
          Search
        </h1>
        <p className="mt-2 text-neutral-600 text-sm">
          {query
            ? results.length > 0
              ? `${results.length} post${results.length === 1 ? "" : "s"} matched "${query}".`
              : `No posts matched "${query}".`
            : "Type a keyword, tag or category in the search bar above."}
        </p>

        {results.length > 0 && (
          <div className="mt-7.5 grid grid-cols-[minmax(100px,1fr)] gap-5 md:grid-cols-[repeat(2,minmax(100px,1fr))] lg:grid-cols-[repeat(3,minmax(100px,1fr))]">
            {results.map((blog) => (
              <PostCard
                key={blog.key}
                blog={blog}
                category={getCategory(blog.key)}
              />
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="mt-7.5">
            <ButtonLink href="/blog">Browse all posts</ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}
