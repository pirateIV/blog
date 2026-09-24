import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lusia.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        // The studio and its API are session-gated; keeping crawlers out
        // of them (and the login door) saves crawl budget and keeps the
        // author surface out of search results.
        allow: "/",
        disallow: [
          "/studio",
          "/author",
          "/dashboard",
          "/studio-login",
          "/api/",
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
