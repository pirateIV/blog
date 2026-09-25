"use client";

import ButtonLink from "@/components/button-link";

// Rendered when loading a post throws (storage hiccup, runtime crash).
// Next passes `reset` — it re-runs the failed render without a full page
// load, so "Try again" is a real retry, not a suggestion.
export default function PostError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-y-7.5 px-5 py-24 text-center">
      <h1 className="font-playfair-display font-semibold text-[40px]">
        Something went wrong
      </h1>
      <p>
        This post could not be loaded. Trying again usually fixes it. If it
        keeps happening, the page may be mid-update — head back home in the
        meantime.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="h-9 rounded-[100px] bg-background-dark px-3.75 font-semibold text-white text-xs uppercase transition hover:opacity-90"
        >
          Try again
        </button>
        <ButtonLink href="/">RETURN TO HOMEPAGE</ButtonLink>
      </div>
    </div>
  );
}
