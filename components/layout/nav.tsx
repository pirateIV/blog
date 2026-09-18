"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { siteLinks } from "@/data/nav";
import { Icons } from "../icons";
import { usePathname } from "next/navigation";
import { cx } from "@/utils/cx";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="px-5 py-7 sticky top-0 bg-white z-50 md:p-7 lg:px-16 lg:py-8.5">
      <div className="flex items-center justify-center">
        <div className="max-w-305 w-full flex items-center justify-between">
          <Link href="/">
            <div>
              <Image
                src="/logo.svg"
                width="83"
                height="24"
                sizes="83.48px"
                alt="logo"
                priority
              />
            </div>
          </Link>

          <ul className="hidden flex-nowrap items-center gap-7.5 transition-all lg:flex">
            {siteLinks.pages.map((page) => (
              <li key={page.text}>
                <Link
                  href={page.url}
                  className={cx(
                    pathname === page.url && "line-through",
                    "font-semibold uppercase text-[13px]"
                  )}
                >
                  {page.text}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="flex items-center gap-2.5">
            <ul className="hidden items-center gap-2.5 lg:flex">
              {siteLinks.socials.map((social) => (
                <li
                  key={social.name}
                  className="inline-flex items-center justify-center"
                >
                  <Link
                    href={social.url}
                    className="group inline-flex items-center gap-1"
                  >
                    <social.icon />
                    <span className="font-montserrat text-xs font-medium max-w-0 opacity-0 group-hover:max-w-fit group-hover:opacity-100 transition-all origin-left pointer-events-none">
                      {social.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <li>
              <button className="inline-flex items-center justify-center border p-1.25 rounded-full">
                <Icons.Magnifier size="18" />
              </button>
            </li>
            <li className="inline-flex lg:hidden">
              <button className="inline-flex items-center justify-center border p-1.25 rounded-full">
                <Icons.Menu size="18" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
