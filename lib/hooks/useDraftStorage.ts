"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  selectActiveDraft,
  createBlankDraft,
  hydrateDrafts,
  DraftItem,
} from "@/lib/features/slices/draft";
import type { DraftSaveState, Draft, PostCategory } from "@/types";
import { STORAGE_KEY } from "@/lib/draft";

type PersistedState = {
  drafts: DraftItem[];
  activeDraftId: string;
};

// Seed content for the very first visit, when there is nothing in storage.
// Publishing fields fall back to createBlankDraft's defaults.
const FIRST_RUN_TEMPLATE: Partial<DraftItem> = {
  title: "My First Markdown Post",
  excerpt:
    "A quick tour of Markdown for bloggers — write once, format anywhere.",
  content:
    "You type simple symbols, and they turn into headings, lists, links, and more...",
  published: false,
  tags: ["markdown", "writing", "beginners"],
  updatedAt: new Date().toISOString(),
};

// A draft that satisfies the type checker if selectActiveDraft ever returns
// null. In practice the slice always keeps at least one draft in its list,
// so this should never actually be what the user sees.
const FALLBACK_DRAFT: DraftItem = createBlankDraft();

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asTags(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((tag): tag is string => typeof tag === "string")
    : [];
}

const CATEGORIES: PostCategory[] = ["travel", "lifestyle", "destination"];

function asCategory(value: unknown): PostCategory {
  return CATEGORIES.includes(value as PostCategory)
    ? (value as PostCategory)
    : "travel";
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

// Storage may hold drafts written by an older build (or by hand), so every
// field is checked before it reaches the store. Drafts saved before the
// publishing fields existed simply get their defaults.
function sanitizeDraft(value: unknown): DraftItem | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Partial<DraftItem>;
  if (typeof raw.id !== "string" || !raw.id) return null;

  return {
    id: raw.id,
    title: asString(raw.title),
    excerpt: asString(raw.excerpt),
    content: asString(raw.content),
    published: raw.published === true,
    tags: asTags(raw.tags),
    updatedAt: asString(raw.updatedAt, new Date().toISOString()),
    slug: asString(raw.slug),
    category: asCategory(raw.category),
    image: asString(raw.image),
    publishedKey: asNullableString(raw.publishedKey),
    publishedAt: asNullableString(raw.publishedAt),
  };
}

// Reads storage, returning null when it is missing or unusable (in which
// case the caller starts from a template). Handles both today's
// `{ drafts, activeDraftId }` payload and the pre-multi-draft shape that
// stored one draft object directly, so existing work is migrated instead
// of being thrown away.
function readPersistedState(): PersistedState | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (parsed && typeof parsed === "object" && "drafts" in parsed) {
      const source = parsed as PersistedState;
      if (!Array.isArray(source.drafts)) throw new Error("Malformed drafts");

      const drafts = source.drafts
        .map(sanitizeDraft)
        .filter((draft): draft is DraftItem => draft !== null);

      if (drafts.length === 0) throw new Error("Empty drafts array");

      const activeDraftId = drafts.some(
        (draft) => draft.id === source.activeDraftId,
      )
        ? source.activeDraftId
        : drafts[0].id;

      return { drafts, activeDraftId };
    }

    // Legacy single-draft payload: { title, slug, excerpt, content, ... }.
    const legacy = parsed as Partial<Draft>;
    if (
      typeof legacy.title === "string" &&
      typeof legacy.content === "string"
    ) {
      const draft = createBlankDraft({
        title: legacy.title,
        excerpt: asString(legacy.excerpt),
        content: legacy.content,
        published: legacy.published === true,
        tags: asTags(legacy.tags),
        updatedAt: asString(legacy.updatedAt),
      });
      return { drafts: [draft], activeDraftId: draft.id };
    }

    throw new Error("Unrecognized draft payload");
  } catch (error) {
    console.error("Discarding unreadable draft storage", error);
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

// Helper function to normalize text formatting quirks from the Milkdown rendering engine
function normalizeMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\s+\n/g, "\n") // Strip trailing whitespace at the end of lines
    .trim(); // Remove wrapping gaps
}

export function useDraftStorage() {
  const draft = useAppSelector(selectActiveDraft) ?? FALLBACK_DRAFT;
  const drafts = useAppSelector((state) => state.draftState.drafts);
  const activeDraftId = useAppSelector((state) => state.draftState.activeDraftId);
  const dispatch = useAppDispatch();

  const hasLoadedRef = useRef(false);
  const lastSavedRef = useRef<string | null>(null);
  const stateRef = useRef<PersistedState>({ drafts, activeDraftId });

  // Synchronously update the ref to keep timers clear of closure bugs
  stateRef.current = { drafts, activeDraftId };

  const [saveState, setSaveState] = useState<DraftSaveState>("loading");
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // 1. Initial Storage Hydration on Mount — restores the whole drafts
  // list (up to whatever was persisted), not just the active one.
  useEffect(() => {
    const restored =
      readPersistedState() ??
      (() => {
        const fresh = createBlankDraft(FIRST_RUN_TEMPLATE);
        return { drafts: [fresh], activeDraftId: fresh.id };
      })();

    // Refresh the ref here, not just on the next render: any flush that
    // runs before React re-renders (StrictMode's immediate unmount pass)
    // must see the restored data instead of the slice's placeholder.
    stateRef.current = restored;
    dispatch(hydrateDrafts(restored));

    lastSavedRef.current = JSON.stringify(restored);
    setSaveState("saved");
    hasLoadedRef.current = true;
    setIsHydrated(true);
  }, [dispatch]);

  // 2. Persistent Save Functionality — saves the entire drafts list
  // plus which one is active.
  const persistDraft = useCallback((toSave: PersistedState): boolean => {
    const serialized = JSON.stringify(toSave);

    if (serialized === lastSavedRef.current) {
      return true;
    }

    try {
      setSaveState("saving");
      window.localStorage.setItem(STORAGE_KEY, serialized);
      lastSavedRef.current = serialized;
      setSaveState("saved");
      return true;
    } catch (error) {
      console.error("Failed to save draft", error);
      setSaveState("error");
      return false;
    }
  }, []);

  // 3. 30s Fixed Autosave Cadence
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!hasLoadedRef.current) return;
      persistDraft(stateRef.current);
    }, 30_000);

    return () => clearInterval(intervalId);
  }, [persistDraft]);

  // 4. Force Window Unload Synchronous Flushes
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      const saved = persistDraft(stateRef.current);
      if (!saved) {
        event.preventDefault();
        event.returnValue = true;
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [persistDraft]);

  // 5. Flush as soon as the draft list changes shape — creating, deleting
  // or switching drafts. Field edits stay on the 30s cadence above; these
  // structural changes are rare and losing them would be costly (a deleted
  // or newly opened draft surviving a crash).
  // `isHydrated` gates the first run: until hydration has re-rendered, the
  // ref still holds the slice's placeholder state, which would otherwise
  // overwrite whatever storage held. activeDraftId and drafts.length are
  // read deliberately — they are what triggers this effect, and the guards
  // below protect the "always one active draft" invariant. persistDraft
  // itself no-ops when nothing changed.
  useEffect(() => {
    if (!isHydrated) return;
    if (!activeDraftId || drafts.length === 0) return;
    persistDraft(stateRef.current);
  }, [isHydrated, activeDraftId, drafts.length, persistDraft]);

  // Flush when the editor unmounts (client-side navigation away).
  useEffect(() => {
    return () => {
      if (!hasLoadedRef.current) return;
      persistDraft(stateRef.current);
    };
  }, [persistDraft]);

  const handleSaveNow = useCallback(() => {
    persistDraft(stateRef.current);
  }, [persistDraft]);

  // CRITICAL FIX: Explicitly compare content fields and skip dynamic dynamic timestamp checks.
  // Compares every draft by id against its last-saved counterpart, plus which
  // draft is active, so switching drafts or editing any one of them (not
  // just the active one) is reflected here.
  const hasUnsavedChanges = useMemo(() => {
    if (!isHydrated || !lastSavedRef.current) return false;

    try {
      const parsedLastSaved = JSON.parse(lastSavedRef.current) as PersistedState;

      if (parsedLastSaved.activeDraftId !== activeDraftId) return true;
      if (parsedLastSaved.drafts.length !== drafts.length) return true;

      return drafts.some((current) => {
        const saved = parsedLastSaved.drafts.find((d) => d.id === current.id);
        if (!saved) return true;

        return (
          current.title !== saved.title ||
          current.excerpt !== saved.excerpt ||
          current.published !== saved.published ||
          JSON.stringify(current.tags) !== JSON.stringify(saved.tags) ||
          normalizeMarkdown(current.content) !== normalizeMarkdown(saved.content)
        );
      });
    } catch {
      return true;
    }
    // saveState is included even though it isn't read in the body: persistDraft
    // mutates lastSavedRef (a plain ref, invisible to useMemo) exactly when it
    // sets saveState to "saved"/"error". Without this, a completed autosave or
    // manual save doesn't get reflected here until the next edit touches draft.
  }, [drafts, activeDraftId, isHydrated, saveState]);

  return {
    draft,
    saveState,
    isHydrated,
    hasUnsavedChanges,
    onSaveNow: handleSaveNow,
  };
}
