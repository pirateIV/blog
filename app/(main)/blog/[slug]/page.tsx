import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/post";
import { getMDXSlugKey } from "@/helpers/posts";
import Divider from "@/components/layout/divider";
import DateCategory from "@/components/date-category";
import Sidebar from "@/components/layout/sidebar/sidebar";
import RelatedPosts from "@/components/posts/related-posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(getMDXSlugKey(slug));

  if (!post) return {};

  const { title, description, image } = post.frontmatter;

  return {
    title,
    description,
    openGraph: {
      images: [{ url: image }],
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(({ frontmatter }) => ({ slug: frontmatter.slug }));
}

export default async function Blog({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(getMDXSlugKey(slug));

  if (!post) {
    return notFound();
  }

  const {
    content,
    frontmatter: { title, description, category, image, date },
  } = post;

  return (
    <>
      <div className="px-5 py-7.5 md:px-7 md:pb-10 lg:px-15 lg:pb-12.5">
        <div className="w-full max-w-305 mx-auto">
          {/* Hero Image */}
          <div className="pb-12.5">
            {/* <Image
              src={image}
              width={600}
              height={400}
              className="w-full object-cover aspect-2/1"
              priority
              alt={`Featured image for ${title}`}
            /> */}
          </div>

          <Divider />

          {/* Main Content Area */}
          <div className="relative lg:flex gap-12.5 py-12.5">
            {/* Article Content */}
            <div className="w-full min-h-screen space-y-5 lg:w-[70%]">
              <article className="prose max-w-full text-sm">
                {/* Article Header */}
                <div className="space-y-2.5!">
                  <DateCategory variant="md" category={category} date={date} />
                  <h1 className="text-[40px] mt-0!">{title}</h1>
                  <p className="mt-0!">{description}</p>
                  <Divider />
                </div>

                {/* Article Body */}
                <MDXRemote source={content} />
              </article>
            </div>

            {/* Sidebar */}
            <Sidebar />
          </div>

          <Divider />

          {/* Related Posts */}
          <RelatedPosts slug={slug} category={category} />
        </div>
      </div>
    </>
  );
}
