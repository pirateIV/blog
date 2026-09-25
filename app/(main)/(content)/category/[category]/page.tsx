import Image from "next/image";
import { notFound } from "next/navigation";
import Divider from "@/components/layout/divider";
import Sidebar from "@/components/layout/sidebar/sidebar";
import PostCard from "@/components/post-card";
import { descriptions, getBlogData } from "@/data/blog";
import { DEFAULT_COVERS } from "@/lib/default-covers";
import type { PostCategory } from "@/types";

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category } = await params;

  const blogData = getBlogData();
  const blogCategoryData = blogData[category as keyof typeof blogData];
  const description = descriptions[category as keyof typeof blogData];

  if (!blogCategoryData) {
    return notFound();
  }

  return (
    <div className="flex items-center justify-center px-7 lg:px-15">
      <div className="w-full max-w-305">
        {/* Category Header Section */}
        <div className="flex items-center gap-7.5 py-12.5 max-md:flex-col lg:gap-12.5">
          <div className="space-y-2.5">
            <h1 className="font-playfair-display font-semibold text-[40px] capitalize">
              {category}
            </h1>
            <p className="text-lg">{description}</p>
          </div>

          {/* Category Image */}
          <div className="size-full shrink-0 overflow-hidden md:w-[30%]">
            <Image
              src={DEFAULT_COVERS[category as PostCategory]}
              width="366"
              height="203"
              sizes="(min-width: 1200px) max(min(max(100vw - 120px, 1px), 1220px) * 0.3, 1px), (max-width: 809.98px) max(min(max(100vw - 40px, 1px), 1220px), 1px), (min-width: 810px) and (max-width: 1199.98px) max(min(max(100vw - 56px, 1px), 1220px) * 0.3, 1px)"
              className="aspect-366/203 size-full border border-background-dark/30 object-cover"
              alt={`${category} category image`}
              priority
            />
          </div>
        </div>

        {/* Main Content Section */}
        <div className="relative w-full space-y-5 py-12.5">
          <Divider />

          <div className="relative gap-12.5 lg:flex">
            {/* Posts List */}
            <div className="min-h-screen w-full space-y-5 lg:w-[70%]">
              {/* Section Header */}
              <div className="flex flex-col-reverse">
                <h2 className="font-playfair-display font-semibold text-[34px]/[1.2em]">
                  Recent Posts
                </h2>
                <p className="font-medium text-accent-orange text-sm">
                  Stay up-to-date
                </p>
              </div>

              <Divider />

              {/* Posts Grid */}
              <div className="@container">
                {blogCategoryData.map((blog) => (
                  <PostCard
                    key={blog.key}
                    variant="md"
                    blog={blog}
                    category={category}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
