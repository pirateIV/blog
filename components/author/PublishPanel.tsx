"use client";

import { ExternalLink, Plus, Upload, X } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  selectActiveDraft,
  setCategory,
  setImage,
  setSlug,
  setTags,
} from "@/lib/features/slices/draft";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { usePublishDraft } from "@/lib/hooks/usePublishDraft";
import { formatRelativeTime, slugify } from "@/lib/utils";
import type { PostCategory } from "@/types";

const CATEGORIES: PostCategory[] = ["travel", "lifestyle", "destination"];

function Label({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-xs">{children}</span>;
}

// Right rail: the metadata that becomes frontmatter, plus the publish action
// that writes content/<category>-<slug>.mdx through /api/publish.
export function PublishPanel() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectActiveDraft);
  const { publish, unpublish, status, message, url, note } = usePublishDraft();
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!draft) return null;

  const effectiveSlug =
    (draft.slug.trim() ? slugify(draft.slug) : slugify(draft.title)) ||
    "your-post-link";
  const canPublish = Boolean(
    draft.title.trim() &&
      draft.excerpt.trim() &&
      draft.content.trim() &&
      slugify(draft.slug.trim() || draft.title),
  );
  const busy =
    status === "publishing" || status === "unpublishing" || uploading;

  // Narrowed by the `if (!draft) return null` guard above; `current` keeps
  // that narrowing inside these closures.
  const current = draft;

  function addTag() {
    const tag = tagInput.trim().replace(/^#/, "");
    if (!tag || current.tags.includes(tag)) return;
    dispatch(setTags([...current.tags, tag]));
    setTagInput("");
  }

  function removeTag(tag: string) {
    dispatch(setTags(current.tags.filter((item) => item !== tag)));
  }

  async function uploadCover(file: File) {
    setUploading(true);
    setUploadError(null);
    setUploadNote(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
        storage?: string;
      };
      if (!response.ok || !data.url) {
        setUploadError(data.error ?? "Upload failed");
        return;
      }
      dispatch(setImage(data.url));
      setUploadNote(
        data.storage === "github"
          ? "Committed to the repo — the image appears once the site redeploys (~1 min)."
          : null,
      );
    } catch {
      setUploadError("Could not reach /api/upload");
    } finally {
      setUploading(false);
      // Allow re-picking the same file after a failed attempt.
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-neutral-300 border-l bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">Publishing</h2>
        <span
          className={`rounded-full px-2 py-0.5 font-medium text-[11px] ${
            draft.published
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
          }`}
        >
          {draft.published ? "Published" : "Draft"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>URL slug</Label>
        <Input
          aria-label="URL slug"
          value={draft.slug}
          placeholder={effectiveSlug}
          onChange={(e) => dispatch(setSlug(e.target.value))}
        />
        <span className="truncate text-[11px] text-neutral-500">
          /blog/{effectiveSlug}
        </span>
      </div>

      <label className="flex flex-col gap-1.5">
        <Label>Category</Label>
        <select
          value={draft.category}
          onChange={(e) =>
            dispatch(setCategory(e.target.value as PostCategory))
          }
          className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-1.5">
        <Label>Cover image</Label>
        <Input
          aria-label="Cover image"
          value={draft.image}
          placeholder={`/images/${draft.category}.jpg`}
          onChange={(e) => dispatch(setImage(e.target.value))}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadCover(file);
          }}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload />
            {uploading ? "Uploading…" : "Upload image"}
          </Button>
          {draft.image && (
            // biome-ignore lint/performance/noImgElement: cover preview only; next/image rejects arbitrary user-supplied URLs
            <img
              src={draft.image}
              alt={`Cover preview for ${draft.title || "this draft"}`}
              className="h-8 w-14 rounded-md border border-neutral-300 object-cover dark:border-neutral-700"
            />
          )}
        </div>
        {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
        {uploadNote && !uploadError && (
          <p className="text-neutral-500 text-xs">{uploadNote}</p>
        )}
        <span className="text-[11px] text-neutral-500">
          Paste a URL or upload a JPG, PNG, WebP, GIF or AVIF up to 5MB. Leave
          empty to use the category default.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Tags</Label>
        {draft.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {draft.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => removeTag(tag)}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-2 py-0.5 text-[11px] hover:border-red-300 hover:text-red-500 dark:border-neutral-700 dark:bg-neutral-900"
                title={`Remove ${tag}`}
              >
                #{tag}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Input
            value={tagInput}
            placeholder="Add a tag"
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={addTag}
            title="Add tag"
          >
            <Plus />
          </Button>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2 border-neutral-300 border-t pt-4 dark:border-neutral-800">
        <Button onClick={() => publish()} disabled={!canPublish || busy}>
          {status === "publishing"
            ? "Publishing…"
            : draft.published
              ? "Update post"
              : "Publish post"}
        </Button>

        {draft.publishedKey && (
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() => {
              if (
                window.confirm(
                  "Remove this post from the public site? Your draft stays in the studio.",
                )
              ) {
                unpublish();
              }
            }}
          >
            {status === "unpublishing" ? "Unpublishing…" : "Unpublish"}
          </Button>
        )}

        {status === "error" && message && (
          <p className="text-red-500 text-xs">{message}</p>
        )}

        {status === "success" && message && (
          <p className="text-emerald-600 text-xs dark:text-emerald-400">
            {message}{" "}
            {url && (
              <Link
                href={url}
                target="_blank"
                className="inline-flex items-center gap-1 underline"
              >
                View <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </p>
        )}

        {status === "success" && note && (
          <p className="text-neutral-500 text-xs">{note}</p>
        )}

        <p
          className="text-[11px] text-neutral-500"
          // "Published just now" would otherwise mismatch the server render.
          suppressHydrationWarning
        >
          {draft.published && draft.publishedAt
            ? `Published ${formatRelativeTime(draft.publishedAt)} · updates rewrite the same file`
            : "Writes a .mdx file into content/"}
        </p>
      </div>
    </aside>
  );
}
