"use client";

import { usePathname } from "next/navigation";
import ButtonLink from "../button-link";
import NewsletterSubscription from "./newsletter-subscription";

export default function Footer() {
  const pathname = usePathname();

  const is404Page = pathname !== "/404";

  return (
    <footer>
      {is404Page && <NewsletterSubscription />}
      <div className="px-6 py-12.5">
        <div className="flex items-center justify-center">
          <ButtonLink href="https://instagram.com">
            @LUSIA ON INSTAGRAM
          </ButtonLink>
        </div>
      </div>
      <div className="px-4 py-7.5 md:px-15 md:pt-12.5">
        <div className="mx-auto flex max-w-305 items-center justify-between border-overlay-dark border-t py-7.5 max-md:flex-col max-md:gap-3.75">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Lusia. Theme by Marcframe.
          </p>
          <ButtonLink href="/">Use Template</ButtonLink>
        </div>
      </div>
    </footer>
  );
}
