import ButtonLink from "../button-link";
import NewsletterSubscription from "./newsletter-subscription";

// The newsletter renders on every route; the 404 pages opt out via their
// [data-not-found] root (see globals.css) — no pathname guessing here,
// the App Router never exposes "/404" anyway.
export default function Footer() {
  return (
    <footer>
      <NewsletterSubscription />
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
