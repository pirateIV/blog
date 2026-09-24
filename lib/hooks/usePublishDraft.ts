"use client";

import { useCallback, useState } from "react";
import {
  clearPublishInfo,
  selectActiveDraft,
  setPublishInfo,
  setSlug,
} from "@/lib/features/slices/draft";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { slugify } from "@/lib/utils";

type PublishStatus =
  | "idle"
  | "publishing"
  | "unpublishing"
  | "success"
  | "error";

export function usePublishDraft() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectActiveDraft);
  const [status, setStatus] = useState<PublishStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  // Set when storage is GitHub: the commit triggers a redeploy, so the
  // public site lags the studio by about a minute.
  const [note, setNote] = useState<string | null>(null);

  const publish = useCallback(async () => {
    if (!draft) return;

    const title = draft.title.trim();
    const description = draft.excerpt.trim();
    // An explicit slug wins, but is still normalized ("My Post" → "my-post").
    const slug = draft.slug.trim() ? slugify(draft.slug) : slugify(title);

    if (!title) {
      setStatus("error");
      setMessage("Add a title first");
      return;
    }
    if (!slug) {
      setStatus("error");
      setMessage("The title must produce a valid URL slug");
      return;
    }
    if (!description) {
      setStatus("error");
      setMessage("Add a short excerpt first");
      return;
    }
    if (!draft.content.trim()) {
      setStatus("error");
      setMessage("Write something before publishing");
      return;
    }

    setStatus("publishing");
    setMessage(null);
    setUrl(null);
    setNote(null);

    // key is "<category>-<slug>", so the previous slug is everything after
    // the first segment — used only to revalidate the old URL on rename.
    const previousSlug = draft.publishedKey?.replace(/^[a-z]+-/, "") ?? null;

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          content: draft.content,
          category: draft.category,
          image: draft.image,
          slug,
          tags: draft.tags,
          previousKey: draft.publishedKey,
          previousSlug,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        key?: string;
        slug?: string;
        url?: string;
        storage?: string;
      };

      if (!response.ok || !data.key || !data.slug) {
        setStatus("error");
        setMessage(data.error ?? "Publishing failed");
        return;
      }

      // Remember where it landed so the next publish can update — or rename —
      // the same file instead of leaving an orphan behind.
      dispatch(setSlug(data.slug));
      dispatch(
        setPublishInfo({
          key: data.key,
          publishedAt: new Date().toISOString(),
        }),
      );

      setStatus("success");
      setMessage(draft.published ? "Post updated" : "Post published");
      setUrl(data.url ?? `/blog/${data.slug}`);
      setNote(
        data.storage === "github"
          ? "Committed to GitHub — Vercel redeploys automatically and the change goes live in about a minute."
          : null,
      );
    } catch (error) {
      console.error("Publish failed", error);
      setStatus("error");
      setMessage("Could not reach /api/publish");
    }
  }, [draft, dispatch]);

  // Removes the published file; the studio draft itself stays untouched.
  const unpublish = useCallback(async () => {
    const key = draft?.publishedKey;
    if (!key) return;

    setStatus("unpublishing");
    setMessage(null);
    setUrl(null);
    setNote(null);

    try {
      const response = await fetch("/api/publish", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        storage?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Unpublishing failed");
        return;
      }

      dispatch(clearPublishInfo());
      setStatus("success");
      setMessage("Post unpublished — the draft is kept");
      setNote(
        data.storage === "github"
          ? "Committed the removal — the post leaves the public site after the next deploy."
          : null,
      );
    } catch (error) {
      console.error("Unpublish failed", error);
      setStatus("error");
      setMessage("Could not reach /api/publish");
    }
  }, [draft, dispatch]);

  const reset = useCallback(() => {
    setStatus("idle");
    setMessage(null);
    setUrl(null);
    setNote(null);
  }, []);

  return { publish, unpublish, reset, status, message, url, note };
}
