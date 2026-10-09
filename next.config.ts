import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    // Covers are pasted freely in the author studio, so any https host must
    // pass the optimizer's allowlist — an unconfigured host makes next/image
    // throw during render, which takes down every page listing that post
    // (home, blog, category, search), not just the post itself.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    // The studio moved: keep old /author links (bookmarks, history) working.
    return [{ source: "/author", destination: "/studio", permanent: false }];
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  // markdown plugins
});

export default withMDX(nextConfig);
