import React from "react";
import { Metadata } from "next";
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
        src="/images/404.avif"
        width="800"
        height="600"
        sizes="800px"
        alt="404 image illustration"
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
