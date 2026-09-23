"use client";

import { useCallback, useState } from "react";
import {
  selectActiveDraft,
  setPublishInfo,
  setSlug,
} from "@/lib/features/slices/draft";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { slugify } from "@/lib/utils";

type PublishStatus = "idle" | "publishing" | "success" | "error";

export function usePublishDraft() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectActiveDraft);
  const [status, setStatus] = useState<PublishStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

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

    // key is "<category>-<slug>", so the previous slug is everything after
    // the first segment — used only to revalidate the old URL on rename.
    const previousSlug = draft.publishedKey?.replace(/^[a-z]+-/, "") ?? null;
    const token = process.env.NEXT_PUBLIC_PUBLISH_TOKEN;

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-publish-token": token } : {}),
        },
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
    } catch (error) {
      console.error("Publish failed", error);
      setStatus("error");
      setMessage("Could not reach /api/publish");
    }
  }, [draft, dispatch]);

  const reset = useCallback(() => {
    setStatus("idle");
    setMessage(null);
    setUrl(null);
  }, []);

  return { publish, reset, status, message, url };
}
