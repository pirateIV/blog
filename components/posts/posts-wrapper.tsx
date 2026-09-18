import React from "react";
import { cx } from "@/utils/cx";
import { CardVariants } from "@/types";

export default function PostsWrapper({
  children,
  variant,
  className,
  ...props
}: {
  className?: string;
  variant: CardVariants;
} & React.PropsWithChildren) {
  return (
    <div
      className={cx(
        "grid gap-5",
        variant !== "md" ? "md:grid-cols-2 lg:grid-cols-4" : "@container",
        className
      )}
    >
      {children}
    </div>
  );
}
