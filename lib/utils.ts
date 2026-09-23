import { Post } from "@/types";

export { cn } from "cn"

export function slugify(title: string): string {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || ""
  );
}

export function sortPostsByDate(blogsArray: Post[]): Post[] {
  return [...blogsArray].sort(
    (a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime()
  );
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// "just now" / "5 min ago" / "2 hr ago" — used for draft rows and the
// publish panel's last-updated line.
export function formatRelativeTime(iso: string): string {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return "just now";

  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  return new Date(time).toLocaleDateString();
}
