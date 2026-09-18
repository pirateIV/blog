import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/nav";
import Footer from "@/components/layout/footer";
import Divider from "@/components/layout/divider";

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
    <html lang="en">
      <body
        className={`relative ${montserrat.className} ${playfairDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
