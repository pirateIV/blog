"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { getDrafts } from "@/lib/features/selectors";
import { loadDraft } from "@/lib/features/slices/draft";
import { Draft, DraftSaveState } from "@/types";
import { STORAGE_KEY } from "@/lib/draft";

const EMPTY_DRAFT: Draft = {
  title: "My First Markdown Post",
  excerpt: "A quick tour of Markdown for bloggers — write once, format anywhere.",
  content: "You type simple symbols, and they turn into headings, lists, links, and more...",
  published: false,
  tags: ["markdown", "writing", "beginners"],
  updatedAt: new Date().toISOString(),
};

// Helper function to normalize text formatting quirks from the Milkdown rendering engine
function normalizeMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, "\n")      // Normalize line endings
    .replace(/\s+\n/g, "\n")      // Strip trailing whitespace at the end of lines
    .trim();                     // Remove wrapping gaps
}

export function useDraftStorage() {
  const draft = useAppSelector(getDrafts);
  const dispatch = useAppDispatch();

  const hasLoadedRef = useRef(false);
  const lastSavedRef = useRef<string | null>(null);
  const draftRef = useRef(draft);
  
  // Synchronously update the ref to keep timers clear of closure bugs
  draftRef.current = draft;

  const [saveState, setSaveState] = useState<DraftSaveState>("loading");
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // 1. Initial Storage Hydration on Mount
  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    let loaded: Draft;

    if (raw) {
      try {
        loaded = JSON.parse(raw) as Draft;
        dispatch(loadDraft(loaded));
      } catch (error) {
        window.localStorage.removeItem(STORAGE_KEY);
        loaded = EMPTY_DRAFT;
        dispatch(loadDraft(loaded));
      }
    } else {
      loaded = EMPTY_DRAFT;
      dispatch(loadDraft(loaded));
    }

    lastSavedRef.current = JSON.stringify(loaded);
    setSaveState("saved");
    hasLoadedRef.current = true;
    setIsHydrated(true);
  }, [dispatch]);

  // 2. Persistent Save Functionality
  const persistDraft = useCallback((toSave: Draft): boolean => {
    // Add current time right before saving to disk
    const draftWithTimestamp = {
      ...toSave,
      updatedAt: new Date().toISOString(),
    };
    
    const serialized = JSON.stringify(draftWithTimestamp);

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
      persistDraft(draftRef.current);
    }, 30_000);

    return () => clearInterval(intervalId);
  }, [persistDraft]);

  // 4. Force Window Unload Synchronous Flushes
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      const saved = persistDraft(draftRef.current);
      if (!saved) {
        event.preventDefault();
        event.returnValue = true;
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [persistDraft]);

  const handleSaveNow = useCallback(() => {
    persistDraft(draftRef.current);
  }, [persistDraft]);

  // CRITICAL FIX: Explicitly compare content fields and skip dynamic dynamic timestamp checks
  const hasUnsavedChanges = useMemo(() => {
    if (!isHydrated || !lastSavedRef.current) return false;
    
    try {
      const parsedLastSaved = JSON.parse(lastSavedRef.current) as Draft;
      
      return (
        draft.title !== parsedLastSaved.title ||
        draft.excerpt !== parsedLastSaved.excerpt ||
        draft.published !== parsedLastSaved.published ||
        JSON.stringify(draft.tags) !== JSON.stringify(parsedLastSaved.tags) ||
        normalizeMarkdown(draft.content) !== normalizeMarkdown(parsedLastSaved.content)
      );
    } catch {
      return JSON.stringify(draft) !== lastSavedRef.current;
    }
    // saveState is included even though it isn't read in the body: persistDraft
    // mutates lastSavedRef (a plain ref, invisible to useMemo) exactly when it
    // sets saveState to "saved"/"error". Without this, a completed autosave or
    // manual save doesn't get reflected here until the next edit touches draft.
  }, [draft, isHydrated, saveState]);

  return {
    draft,
    saveState,
    isHydrated,
    hasUnsavedChanges,
    onSaveNow: handleSaveNow,
  };
}