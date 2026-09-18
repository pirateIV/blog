"use client";

import React from "react";
import NewsletterSubscription from "./newsletter-subscription";
import { usePathname } from "next/navigation";
import ButtonLink from "../button-link";

export default function Footer() {
  const pathname = usePathname();

  const is404Page = pathname !== "/404";

  console.log(pathname, is404Page);

  return (
    <footer>
      {is404Page && <NewsletterSubscription />}
      <div className="py-12.5 px-6">
        <div className="flex items-center justify-center">
          <ButtonLink href="https://instagram.com">
            @LUSIA ON INSTAGRAM
          </ButtonLink>
        </div>
      </div>
      <div className="px-4 py-7.5 md:pt-12.5 md:px-15">
        <div className="max-w-305 mx-auto flex items-center justify-between py-7.5 border-t border-overlay-dark max-md:gap-3.75 max-md:flex-col">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Lusia. Theme by Marcframe.
          </p>
          <ButtonLink href="/">Use Template</ButtonLink>
        </div>
      </div>
    </footer>
  );
}
