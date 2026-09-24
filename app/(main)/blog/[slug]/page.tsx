import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import DateCategory from "@/components/date-category";
import Divider from "@/components/layout/divider";
import Sidebar from "@/components/layout/sidebar/sidebar";
import RelatedPosts from "@/components/posts/related-posts";
import TagChips from "@/components/tag-chips";
import { getMDXSlugKey } from "@/helpers/posts";
import { getAllPosts, getPostBySlug } from "@/lib/post";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const key = getMDXSlugKey(slug);
  if (!key) return {};

  const { title, description, image } = getPostBySlug(key).frontmatter;

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
  const key = getMDXSlugKey(slug);

  // Unknown slug — typo, deleted, or renamed away — must be a real 404,
  // not a 500 thrown out of the slug lookup.
  if (!key) {
    return notFound();
  }

  const post = getPostBySlug(key);

  const {
    content,
    frontmatter: { title, description, category, date, tags },
  } = post;

  return (
    <div className="px-5 py-7.5 md:px-7 md:pb-10 lg:px-15 lg:pb-12.5">
      <div className="mx-auto w-full max-w-305">
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
        <div className="relative gap-12.5 py-12.5 lg:flex">
          {/* Article Content */}
          <div className="min-h-screen w-full space-y-5 lg:w-[70%]">
            <article className="prose max-w-full text-sm">
              {/* Article Header */}
              <div className="space-y-2.5!">
                <DateCategory variant="md" category={category} date={date} />
                <h1 className="mt-0! text-[40px]">{title}</h1>
                <p className="mt-0!">{description}</p>
                <TagChips tags={tags} />
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
  );
}
