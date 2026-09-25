import Link from "next/link";

export default function NotFound() {
  return (
    <div data-not-found className="px-15 py-40 text-center">
      <h1 className="mb-5 font-playfair-display font-semibold text-4xl">
        This is not the page you're looking for
      </h1>

      <Link href="/" className="font-medium hover:underline">
        Go to Home
      </Link>
    </div>
  );
}
