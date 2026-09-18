"use client";

import React from "react";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/utils/cx";

type ActiveLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  nextLinkProps?: Omit<LinkProps, "href">;
};

export default function ActiveLink({
  href,
  className,
  activeClassName = "",
  children,
  ...props
}: ActiveLinkProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href) || pathname.includes(href);

  return (
    <Link
      href={href}
      className={cx(className, isActive && activeClassName)}
      {...props}
    >
      {children}
    </Link>
  );
}
