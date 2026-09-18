import React from "react";
import Image from "next/image";
import Divider from "@/components/layout/divider";
import { data } from "@/data/about";
import Stories from "@/components/posts/stories";

export default function Page() {
  return (
    <div className="max-sm:px-3 px-7 pb-7.5 md:px-7 md:pb-10 lg:px-15">
      <div className="w-full max-w-304 mx-auto space-y-10">
        {/* Hero Banner Section */}
        <section className="relative">
          <div className="aspect-[2/1] md:aspect-[3.6/1]" aria-hidden="true" />
          <div className="absolute top-0 inset-x-0 aspect-[1.4/1] md:aspect-[2.5/1] lg:aspect-[2.7/1] overflow-hidden">
            <Image
              src="/images/portrait.jpg"
              sizes="min(max(100vw - 120px, 1px), 1220px)"
              className="size-full object-cover"
              width="6000"
              height="4000"
              alt="Scenic forest landscape"
              priority
            />
          </div>  
        </section>

        {/* Author Profile Section */}
        <section className="relative flex flex-col items-center justify-center gap-5 text-center">
          <Image
            src="/images/author.png"
            width="800"
            height="800"
            className="rounded-full size-37.5 md:size-45 lg:size-50"
            alt={`${data.author}'s profile picture`}
          />
          <div className="w-full space-y-2.5 md:w-[45%] lg:w-[35%]">
            <h1 className="text-3xl font-semibold">{data.author}</h1>
            <p className="text-lg text-gray-600">{data.about}</p>
          </div>
        </section>

        <Divider />

        {/* Quote Section */}
        <section className="max-w-100 mx-auto px-5 py-7.5 md:px-8 md:py-10 text-center max-sm:p-0">
          <blockquote className="text-2xl text-balance text-gray-700">
            "{data.quote}"
          </blockquote>
        </section>

        <Divider />

        {/* Main Content Section */}
        <section className="space-y-10">
          <div className="max-w-200 mx-auto text-center">
            <p className="leading-relaxed">{data.summary}</p>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Image
              src="/images/about-01.jpg"
              sizes="(max-width: 768px) 100vw, 50vw"
              width="642"
              height="491"
              alt="About page image showcasing place of interest"
              className="rounded-lg"
            />
            <Image
              src="/images/about-02.jpg"
              sizes="(max-width: 768px) 100vw, 50vw"
              width="642"
              height="491"
              alt="About page image showcasing place of interest"
              className="rounded-lg"
            />
          </div>

          {/* Detailed Paragraphs */}
          <div className="max-w-200 mx-auto space-y-6">
            {data.paragraphs.map((paragraph, index) => (
              <p key={index} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Stories Section */}
        <section>
          <Stories />
        </section>
      </div>
    </div>
  );
}
