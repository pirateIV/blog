import React from "react";

export default function PostHeader({ title }: { title: string }) {
  return (
    <div className="flex flex-col-reverse">
      <h2 className="text-[34px] font-bold">{title}</h2>
      <p className="text-sm text-accent-orange font-semibold">
        Stay up-to-date
      </p>
    </div>
  );
}
