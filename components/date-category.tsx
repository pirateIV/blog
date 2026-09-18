import React from "react";
import Link from "next/link";
import { EllipsisVertical } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CardVariants } from "@/types";

type DateCategoryProps = {
  date: Date;
  variant?: CardVariants;
  category: string | undefined;
};

export default function DateCategory({
  date,
  variant = "default",
  category,
}: DateCategoryProps) {
  return (
    <div className="flex items-center *:text-accent-orange gap-0.5 *:text-xs *:font-semibold">
      <span>{formatDate(date)}</span>
      <EllipsisVertical className="size-2.5" />
      {variant === "md" ? (
        <Link href={`/category/${category}`} className="uppercase underline">
          {category}
        </Link>
      ) : (
        <span className="uppercase">{category}</span>
      )}
    </div>
  );
}
