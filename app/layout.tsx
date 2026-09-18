import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Inter } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";

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

export const metadata: Metadata = {
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
  icons: {
    icon: "/images/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body
        className={`relative ${montserrat.className} ${playfairDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
