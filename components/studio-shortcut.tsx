"use client";

import { useEffect } from "react";

// The author's secret door. Type “studio” anywhere on the public site —
// outside inputs — and the studio opens. There is no UI and no trace:
// knowing the sequence is the whole “key”. It only *routes*; the password
// gate still does the real guarding, so a stranger who stumbles on it
// just lands on the login screen.
const SEQUENCE = "studio";
const IDLE_RESET_MS = 1200;

export function StudioShortcut() {
  useEffect(() => {
    let buffer = "";
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    function resetIdle() {
      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        buffer = "";
      }, IDLE_RESET_MS);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, select, [contenteditable='true'], [contenteditable='']",
        )
      ) {
        return; // never hijack typing — search boxes, comments, the editor
      }

      // Already in the studio ecosystem — nothing to open.
      const path = window.location.pathname;
      if (
        path === "/studio" ||
        path.startsWith("/studio/") ||
        path.startsWith("/studio-login")
      ) {
        return;
      }

      if (event.key.length !== 1) return; // letters/digits only

      buffer = `${buffer}${event.key.toLowerCase()}`.slice(-SEQUENCE.length);
      resetIdle();

      if (buffer === SEQUENCE) {
        buffer = "";
        if (resetTimer) clearTimeout(resetTimer);
        window.location.assign("/studio");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  return null;
}
