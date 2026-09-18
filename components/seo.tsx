"use client";

import React from "react";
import { NextSeo } from "next-seo";

type SeoProps = {
  title: string;
  description: string;
  image: string;
};

export default function Seo({ title, description, image }: SeoProps) {
  return (
    <NextSeo
      title={title}
      description={description}
      openGraph={{
        images: [{ url: image }],
      }}
    />
  );
}
