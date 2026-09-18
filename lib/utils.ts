import { Post } from "@/types";

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
