"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Clipboard, Download, Edit, Eye, Moon, Sun, ClipboardCheck, Save } from "lucide-react";
import copy from "copy-text-to-clipboard";

import { useAppSelector } from "@/lib/hooks";
import { getDrafts } from "@/lib/features/selectors";
import { DraftSaveState } from "@/types";

type EditorMenuBarProps = {
  showPreview: boolean;
  onTogglePreview: () => void;
  saveState: DraftSaveState;
  hasUnsavedChanges: boolean;
  onSave: () => void;
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
}: EditorMenuBarProps) {
  const draft = useAppSelector(getDrafts);
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

  function handleCopy() {
    copy(draft.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    downloadMarkdown(`${slugify(draft.title)}.md`, draft.content);
  }

  function handleThemeToggle() {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }

  const wordCount = getWordCount(draft.content);

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
    <div className="p-2 bg-neutral-100 dark:bg-neutral-900 w-full shrink-0 border-t border-sidebar flex items-center gap-1">
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
        title="Save now"
      >
        <Save />
      </Button>

      <Button variant="ghost" onClick={handleDownload} title="Download .md">
        <Download />
      </Button>

      <Button variant="ghost" onClick={handleThemeToggle} title="Toggle theme">
        {isDark ? <Sun /> : <Moon />}
      </Button>

      <div className="ml-auto flex items-center gap-3 text-xs pr-2">
        <span className="text-neutral-500">{wordCount} words</span>
        <span className={statusColor}>{statusText}</span>
      </div>
    </div>
  );
}
