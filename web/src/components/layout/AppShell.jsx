// web/src/components/layout/AppShell.jsx
import React from "react";

/**
 * AppShell
 * - Provides global background using CSS variables (light/dark)
 * - Optional dark-mode glow effect (safe, non-overflow)
 * - Optional top-right toolbar (ThemeSwitcher + LanguageSwitcher)
 * - Centers content by default unless overridden
 */
export default function AppShell({
  children,
  toolbar = null,
  withGlow = false,
  className = "",
  contentClassName = "",
}) {
  return (
    <div
      className={[
        "app-shell-bg relative min-h-screen text-slate-900 dark:text-slate-100",
        className,
      ].join(" ")}
    >
      {/* Glow (only visible in dark mode, safe/contained) */}
      {withGlow && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-300 dark:opacity-60">
          <div className="absolute -top-20 left-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-emerald-400/15 blur-2xl" />
        </div>
      )}

      {/* Toolbar (top-right) */}
      {toolbar && (
        <div className="fixed right-4 top-4 z-20 flex items-center gap-2">
          {toolbar}
        </div>
      )}

      {/* Main content area */}
      <main
        className={[
          "relative z-10 flex min-h-screen items-center justify-center px-4 py-8",
          contentClassName,
        ].join(" ")}
      >
        {children}
      </main>
    </div>
  );
}
