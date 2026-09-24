"use client";

import { useEffect } from "react";

// Applies the studio's stored dark-mode choice on load, so the theme the
// author picks in the dashboard sticks when they visit the public site.
// Fresh visitors (no stored choice) keep the default light theme.
const STORAGE_KEY = "studio-theme";

export function ThemeBoot() {
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);
  return null;
}
