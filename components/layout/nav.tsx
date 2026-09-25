"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { siteLinks } from "@/data/nav";
import { cx } from "@/utils/cx";
import { Icons } from "../icons";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Any navigation (link click, search submit) dismisses the panels.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, []);

  // Escape closes whichever panel is open.
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, searchOpen]);

  // Plain GET form: without JavaScript the browser navigates to
  // /search?q=... and the server component renders the same results.
  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <nav className="sticky top-0 z-50 bg-white px-5 py-7 md:p-7 lg:px-16 lg:py-8.5">
      <div className="flex items-center justify-center">
        <div className="flex w-full max-w-305 items-center justify-between">
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
                    "font-semibold text-[13px] uppercase",
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
                    <span className="pointer-events-none max-w-0 origin-left font-medium font-montserrat text-xs opacity-0 transition-all group-hover:max-w-fit group-hover:opacity-100">
                      {social.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <li>
              <button
                type="button"
                aria-label={searchOpen ? "Close search" : "Search"}
                aria-expanded={searchOpen}
                aria-controls="site-search"
                onClick={() => {
                  setSearchOpen((open) => !open);
                  setMenuOpen(false);
                }}
                className="inline-flex items-center justify-center rounded-full border p-1.25"
              >
                <Icons.Magnifier size="18" />
              </button>
            </li>
            <li className="inline-flex lg:hidden">
              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="site-mobile-menu"
                onClick={() => {
                  setMenuOpen((open) => !open);
                  setSearchOpen(false);
                }}
                className="inline-flex items-center justify-center rounded-full border p-1.25"
              >
                <Icons.Menu size="18" />
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Search bar — submits to the server-rendered /search page. */}
      {searchOpen && (
        <search
          id="site-search"
          className="flex items-center justify-center pt-6"
        >
          <form
            action="/search"
            onSubmit={submitSearch}
            className="flex w-full max-w-305 items-center gap-3"
          >
            <label htmlFor="site-search-input" className="sr-only">
              Search posts
            </label>
            <input
              id="site-search-input"
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts..."
              autoComplete="off"
              className="w-full border-overlay-dark border-b bg-transparent pb-2 font-semibold text-sm outline-none placeholder:font-normal placeholder:text-neutral-400 focus:border-background-dark"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-background-dark px-4 py-2 font-semibold text-white text-xs uppercase transition hover:opacity-90"
            >
              Search
            </button>
          </form>
        </search>
      )}

      {/* Mobile menu — page links + socials live here below lg. */}
      {menuOpen && (
        <div
          id="site-mobile-menu"
          className="flex items-center justify-center pt-6 lg:hidden"
        >
          <div className="w-full max-w-305">
            <ul className="flex flex-col gap-1">
              {siteLinks.pages.map((page) => (
                <li key={page.text}>
                  <Link
                    href={page.url}
                    className={cx(
                      pathname === page.url && "line-through",
                      "inline-block py-1 font-semibold text-[13px] uppercase",
                    )}
                  >
                    {page.text}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 border-overlay-dark border-t pt-5">
              {siteLinks.socials.map((social) => (
                <li key={social.name} className="inline-flex">
                  <Link
                    href={social.url}
                    className="inline-flex items-center gap-1.5"
                  >
                    <social.icon />
                    <span className="font-medium font-montserrat text-xs">
                      {social.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}
