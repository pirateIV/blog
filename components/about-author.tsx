import Image from "next/image";
import { SidebarItem } from "./layout/sidebar/sidebar-item";

export default function AboutAuthor() {
  return (
    <SidebarItem>
      <h3 className="font-playfair-display font-semibold text-lg">About me</h3>
      <div className="size-35">
        <Image
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&h=800&q=80"
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
      {/* The template's signature.png never shipped with the download — a
          text flourish stands in until there's a real signature graphic. */}
      <span className="font-playfair-display text-neutral-700 italic">
        — Lusia
      </span>
    </SidebarItem>
  );
}
