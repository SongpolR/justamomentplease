// web/src/components/ThemeSwitcher.jsx
import React, { useEffect, useState } from "react";

const STORAGE_KEY = "theme"; // 'light' | 'dark'

function applyTheme(value) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.theme = value;

  if (value === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore storage errors
  }
}

export default function ThemeSwitcher({ className = "" }) {
  const [theme, setTheme] = useState("dark");

  // Initialize from localStorage or system preference
  useEffect(() => {
    let initial = "dark";

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        initial = stored;
      } else if (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        initial = "dark";
      } else {
        initial = "light";
      }
    } catch {
      initial = "dark";
    }

    setTheme(initial);
    applyTheme(initial);
  }, []);

  const setThemeAndApply = (value) => {
    setTheme(value);
    applyTheme(value);
  };

  const isDark = theme === "dark";

  return (
    <div
      className={[
        "inline-flex items-center rounded-full border border-slate-800/80 bg-slate-900/70 px-1 py-0.5 text-[11px] font-medium text-slate-300 backdrop-blur-sm",
        "shadow-sm shadow-slate-950/60",
        className,
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => setThemeAndApply("light")}
        aria-pressed={!isDark}
        className={[
          "inline-flex items-center gap-1 rounded-full px-2 py-1 transition-all",
          !isDark
            ? "bg-slate-50 text-slate-900 shadow-[0_0_8px_rgba(148,163,184,0.6)]"
            : "text-slate-400 hover:text-slate-100",
        ].join(" ")}
      >
        <span aria-hidden="true">☀️</span>
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => setThemeAndApply("dark")}
        aria-pressed={isDark}
        className={[
          "ml-1 inline-flex items-center gap-1 rounded-full px-2 py-1 transition-all",
          isDark
            ? "bg-slate-950 text-slate-50 shadow-[0_0_10px_rgba(99,102,241,0.6)]"
            : "text-slate-400 hover:text-slate-100",
        ].join(" ")}
      >
        <span aria-hidden="true">🌙</span>
        <span>Dark</span>
      </button>
    </div>
  );
}
