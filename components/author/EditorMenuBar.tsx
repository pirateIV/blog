"use client";

import copy from "copy-text-to-clipboard";
import {
  Clipboard,
  ClipboardCheck,
  Download,
  Edit,
  Eye,
  Keyboard,
  Moon,
  Save,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { selectActiveDraft } from "@/lib/features/slices/draft";

import { useAppSelector } from "@/lib/hooks";
import type { DraftSaveState } from "@/types";
import { Button } from "../ui/button";

type EditorMenuBarProps = {
  showPreview: boolean;
  onTogglePreview: () => void;
  saveState: DraftSaveState;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onShowShortcuts: () => void;
};

function slugify(title: string) {
  return title.trim().toLowerCase().replaceAll(/\s+/g, "-") || "untitled";
}

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function getWordCount(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function EditorMenuBar({
  showPreview,
  onTogglePreview,
  saveState,
  hasUnsavedChanges,
  onSave,
  onShowShortcuts,
}: EditorMenuBarProps) {
  // Read straight from the store: this component must not mount a second
  // useDraftStorage instance (that would add its own timers and listeners).
  const draft = useAppSelector(selectActiveDraft);
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Sync the icon with the applied theme after mount (SSR can't know it).
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function handleCopy() {
    copy(draft?.content ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    downloadMarkdown(`${slugify(draft?.title ?? "")}.md`, draft?.content ?? "");
  }

  function handleThemeToggle() {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      // Persisted so the choice survives reloads — ThemeBoot re-applies it
      // on the public site too.
      localStorage.setItem("studio-theme", next ? "dark" : "light");
      return next;
    });
  }

  const wordCount = getWordCount(draft?.content ?? "");
  // Rough reading time at 200 wpm — a small nudge toward scannable posts.
  const readingTime =
    wordCount > 0
      ? ` · ${Math.max(1, Math.round(wordCount / 200))} min read`
      : "";

  const statusText =
    saveState === "saving"
      ? "Saving…"
      : saveState === "error"
        ? "Save failed"
        : hasUnsavedChanges
          ? "Unsaved changes"
          : "Saved";

  const statusColor =
    saveState === "error"
      ? "text-red-500"
      : hasUnsavedChanges && saveState !== "saving"
        ? "text-amber-500"
        : "text-neutral-500";

  return (
    <div className="flex w-full shrink-0 items-center gap-1 border-sidebar border-t bg-neutral-100 p-2 dark:bg-neutral-900">
      {/* Icon displays an action clue context: Edit layout while showing preview, Eye layout while writing */}
      <Button
        variant="ghost"
        onClick={onTogglePreview}
        title={showPreview ? "Back to editor" : "Show preview"}
      >
        {showPreview ? <Edit /> : <Eye />}
      </Button>

      <Button variant="ghost" onClick={handleCopy} title="Copy markdown">
        {copied ? <ClipboardCheck /> : <Clipboard />}
      </Button>

      <Button
        variant="ghost"
        onClick={onSave}
        disabled={saveState === "saving"}
        title="Save now (⌘ / Ctrl+S)"
      >
        <Save />
      </Button>

      <Button variant="ghost" onClick={handleDownload} title="Download .md">
        <Download />
      </Button>

      <Button variant="ghost" onClick={handleThemeToggle} title="Toggle theme">
        {isDark ? <Sun /> : <Moon />}
      </Button>

      <div className="ml-auto flex items-center gap-3 pr-2 text-xs">
        <span className="text-neutral-500">
          {wordCount} words{readingTime}
        </span>
        <span className={statusColor}>{statusText}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onShowShortcuts}
          title="Keyboard shortcuts (?)"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
