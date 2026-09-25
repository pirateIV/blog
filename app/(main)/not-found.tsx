import type { Metadata } from "next";
import Image from "next/image";
import ButtonLink from "@/components/button-link";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-y-7.5">
      <Image
        src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"
        width="800"
        height="600"
        sizes="800px"
        alt="A road leading off into the mountains"
      />
      <h3 className="text-[40px]">Something's wrong here</h3>
      <p>
        It looks like nothing was found at this location. The page you were
        looking for does not exist or was loading incorrectly.
      </p>
      <ButtonLink href="/">RETURN TO HOMEPAGE</ButtonLink>
    </div>
  );
}
