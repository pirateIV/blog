import Image from "next/image";
import Divider from "@/components/layout/divider";
import Stories from "@/components/posts/stories";
import { data } from "@/data/about";

export default function Page() {
  return (
    <div className="px-7 pb-7.5 max-sm:px-3 md:px-7 md:pb-10 lg:px-15">
      <div className="mx-auto w-full max-w-304 space-y-10">
        {/* Hero Banner Section */}
        <section className="relative">
          <div className="aspect-2/1 md:aspect-[3.6/1]" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 aspect-[1.4/1] overflow-hidden md:aspect-2.5/1 lg:aspect-[2.7/1]">
            <Image
              src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1800&q=80"
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
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&h=800&q=80"
            width="800"
            height="800"
            className="size-37.5 rounded-full md:size-45 lg:size-50"
            alt={`${data.author}'s profile picture`}
          />
          <div className="w-full space-y-2.5 md:w-[45%] lg:w-[35%]">
            <h1 className="font-semibold text-3xl">{data.author}</h1>
            <p className="text-gray-600 text-lg">{data.about}</p>
          </div>
        </section>

        <Divider />

        {/* Quote Section */}
        <section className="mx-auto max-w-100 px-5 py-7.5 text-center max-sm:p-0 md:px-8 md:py-10">
          <blockquote className="text-balance text-2xl text-gray-700">
            "{data.quote}"
          </blockquote>
        </section>

        <Divider />

        {/* Main Content Section */}
        <section className="space-y-10">
          <div className="mx-auto max-w-200 text-center">
            <p className="leading-relaxed">{data.summary}</p>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Image
              src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80"
              sizes="(max-width: 768px) 100vw, 50vw"
              width="642"
              height="491"
              alt="About page image showcasing place of interest"
              className="rounded-lg"
            />
            <Image
              src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80"
              sizes="(max-width: 768px) 100vw, 50vw"
              width="642"
              height="491"
              alt="About page image showcasing place of interest"
              className="rounded-lg"
            />
          </div>

          {/* Detailed Paragraphs */}
          <div className="mx-auto max-w-200 space-y-6">
            {data.paragraphs.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed">
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
