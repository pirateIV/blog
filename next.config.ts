import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [new URL("https://images.unsplash.com/**")],
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  // markdown plugins
});

export default withMDX(nextConfig);
