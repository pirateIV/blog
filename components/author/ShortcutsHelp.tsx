"use client";

import { Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Cheat sheet for the studio's keyboard shortcuts (opened with “?” or the
// keyboard button in the status bar).
const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘ / Ctrl", "S"], label: "Save the draft now" },
  { keys: ["⌘ / Ctrl", "K"], label: "Jump to draft search" },
  { keys: ["?"], label: "Show this list" },
  { keys: ["Esc"], label: "Close this dialog" },
];

export function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop; the dialog element + Esc carry the semantics
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-85 rounded-lg border border-neutral-300 bg-white p-5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-playfair-display font-semibold text-lg">
            <Keyboard className="h-4 w-4" />
            Keyboard shortcuts
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} title="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <dl className="mt-4 flex flex-col gap-2.5">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.label} className="flex items-center gap-3">
              <dt className="flex w-32 shrink-0 gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] dark:border-neutral-600 dark:bg-neutral-800"
                  >
                    {key}
                  </kbd>
                ))}
              </dt>
              <dd className="text-neutral-600 text-sm dark:text-neutral-300">
                {shortcut.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
