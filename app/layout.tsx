import type { Metadata } from "next";
import { Inter, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

import { StudioShortcut } from "@/components/studio-shortcut";
import { ThemeBoot } from "@/components/theme-boot";
import { cn } from "@/lib/utils";
import StoreProvider from "./StoreProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: ["400", "500", "600"],
});

// Absolute base for metadata URLs (canonical, OG, sitemap). Override with
// NEXT_PUBLIC_SITE_URL in production (Vercel → Environment Variables).
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lusia.vercel.app",
  ),
  title: "Lusia - Personal Blog & Magazine Website",
  description: "Next.js Template for Personal Blog & Magazine Website",
  openGraph: {
    type: "website",
    title: "Lusia - Personal Blog & Magazine Website",
    description: "Next.js Template for Personal Blog & Magazine Website",
    url: "https://lusia.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lusia - Personal Blog & Magazine Website",
    description: "Next.js Template for Personal Blog & Magazine Website",
  },
  // Discoverability: /feed.xml (see app/feed.xml/route.ts) and sitemap
  // (app/sitemap.ts) are both resolved against metadataBase above.
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "font-sans antialiased",
        inter.variable,
        montserrat.className,
        montserrat.variable,
        playfairDisplay.variable,
      )}
    >
      <body className={cn("relative")}>
        <StoreProvider>
          {/* Zero-DOM helpers: stored theme + the author's secret door. */}
          <ThemeBoot />
          <StudioShortcut />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
