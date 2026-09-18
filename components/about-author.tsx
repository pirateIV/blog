import React from "react";
import Image from "next/image";
import { SidebarItem } from "./layout/sidebar/sidebar-item";

export default function AboutAuthor() {
  return (
    <SidebarItem>
      <h3 className="font-semibold text-lg font-playfair-display">About me</h3>
      <div className="size-35">
        <Image
          src="/images/author.png"
          className="rounded-full"
          width="800"
          height="800"
          alt="author's profile image"
        />
      </div>
      <h3 className="font-semibold text-lg">Lusia BierHoff</h3>
      <p className="text-sm">
        I'm a traveler, wanderer, explorer, and adventurer of life's great
        journey.
      </p>
      <Image
        src="/images/signature.png"
        className="object-cover"
        width="120"
        height="43"
        alt="signature"
      />
    </SidebarItem>
  );
}
