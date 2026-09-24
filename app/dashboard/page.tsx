import { redirect } from "next/navigation";

// The legacy single-draft dashboard editor is retired — the multi-draft
// studio owns drafts now. Keep the URL alive so bookmarks still land
// somewhere sensible (proxy.ts still gates this path).
export default function Page() {
  redirect("/author");
}
