import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import Divider from "@/components/layout/divider";
import { blogData, descriptions } from "@/data/blog";
import PostCard from "@/components/post-card";
import Sidebar from "@/components/layout/sidebar/sidebar";

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category } = await params;

  const blogCategoryData = blogData[category as keyof typeof blogData];
  const description = descriptions[category as keyof typeof blogData];

  if (!blogCategoryData) {
    return notFound();
  }

  return (
    <div className="flex items-center justify-center px-7 lg:px-15">
      <div className="max-w-305 w-full">
        {/* Category Header Section */}
        <div className="flex items-center gap-7.5 py-12.5 lg:gap-12.5 max-md:flex-col">
          <div className="space-y-2.5">
            <h1 className="capitalize font-playfair-display text-[40px] font-semibold">
              {category}
            </h1>
            <p className="text-lg">{description}</p>
          </div>

          {/* Category Image */}
          <div className="size-full overflow-hidden md:w-[30%] shrink-0">
            <Image
              src={`/images/${category}.jpg`}
              width="366"
              height="203"
              sizes="(min-width: 1200px) max(min(max(100vw - 120px, 1px), 1220px) * 0.3, 1px), (max-width: 809.98px) max(min(max(100vw - 40px, 1px), 1220px), 1px), (min-width: 810px) and (max-width: 1199.98px) max(min(max(100vw - 56px, 1px), 1220px) * 0.3, 1px)"
              className="size-full aspect-[366/203] object-cover border border-background-dark/30"
              alt={`${category} category image`}
              priority
            />
          </div>
        </div>

        {/* Main Content Section */}
        <div className="relative space-y-5 py-12.5 w-full">
          <Divider />

          <div className="relative lg:flex gap-12.5">
            {/* Posts List */}
            <div className="w-full min-h-screen space-y-5 lg:w-[70%]">
              {/* Section Header */}
              <div className="flex flex-col-reverse">
                <h2 className="text-[34px]/[1.2em] font-semibold font-playfair-display">
                  Recent Posts
                </h2>
                <p className="text-sm font-medium text-accent-orange">
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
