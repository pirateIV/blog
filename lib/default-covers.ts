import type { PostCategory } from "@/types";

// Known-good covers for when a publish or a category header arrives with no
// image of its own. The old `/images/${category}.jpg` fallback pointed at
// template art that was never shipped, so every use of it rendered a broken
// image. These are verified-live Unsplash assets — each one already used by
// a published post of that category.
export const DEFAULT_COVERS: Record<PostCategory, string> = {
  travel:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80",
  lifestyle:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
  destination:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
};
