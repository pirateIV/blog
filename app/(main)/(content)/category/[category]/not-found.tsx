import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="px-15 py-40 text-center">
      <h1 className="text-4xl font-playfair-display mb-5 font-semibold">
        This is not the page you're looking for
      </h1>

      <Link href="/" className="font-medium hover:underline">
        Go to Home
      </Link>
    </div>
  );
}
