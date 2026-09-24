import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [new URL("https://images.unsplash.com/**")],
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
