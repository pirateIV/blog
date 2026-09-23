import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ButtonLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group h-9 w-fit flex items-center gap-2.5 px-3.75 py-2.5 rounded-[100px] bg-background-dark text-white hover:gap-1.25 hover:p-0 hover:bg-transparent transition-all duration-300"
    >
      <span className="font-semibold text-xs transition-all duration-300 uppercase group-hover:px-3.75 group-hover:py-2.5 group-hover:bg-background-dark group-hover:rounded-[100px]">
        {children}
      </span>
      <span className="transition-all duration-300 group-hover:px-3.75 group-hover:py-2.5 group-hover:bg-background-dark group-hover:rounded-[100px]">
        <ArrowUpRight size={16} />
      </span>
    </Link>
  );
}
