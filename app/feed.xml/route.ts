import { getAllPosts } from "@/lib/post";

// RSS 2.0 feed at /feed.xml — same request-time read of content/*.mdx as
// the blog listings, so new posts appear as soon as they are published.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lusia.vercel.app";

const XML_ESCAPES: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  "'": "&apos;",
  '"': "&quot;",
};

function esc(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => XML_ESCAPES[char] ?? char);
}

export async function GET() {
  const items = getAllPosts()
    .filter((post) => post.frontmatter.slug)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime(),
    )
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.frontmatter.slug}`;
      const pubDate = new Date(post.frontmatter.date).toUTCString();
      return [
        "    <item>",
        `      <title>${esc(post.frontmatter.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <description>${esc(post.frontmatter.description)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>Lusia — Personal Blog &amp; Magazine</title>",
    `    <link>${SITE_URL}/blog</link>`,
    `    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>`,
    "    <description>Latest posts from Lusia.</description>",
    "    <language>en</language>",
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
