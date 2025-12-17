// web/src/components/layout/AuthLayout.jsx
import React from "react";
import AppShell from "./AppShell.jsx";
import ThemeSwitcher from "../ThemeSwitcher.jsx";
import LanguageSwitcher from "../LanguageSwitcher.jsx";
import { useTranslation } from "react-i18next";

/**
 * AuthLayout:
 * - Uses AppShell with glow + toolbar (Theme + Language)
 * - Shows brand row "ViPa · Virtual Pager"
 * - Renders a card with header (title + subtitle + optional right-side slot)
 * - Children are the form content (fields, errors, buttons, footer)
 */
export default function AuthLayout({
  title,
  subtitle,
  headerRight = null, // e.g. mode toggle buttons
  children,
}) {
  const { t } = useTranslation("");
  return (
    <AppShell
      withGlow
      toolbar={
        <>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </>
      }
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-3 flex items-center gap-3">
          <div className="relative h-8 w-8 shrink-0">
            <span
              aria-hidden="true"
              className="animate-pulse-ring absolute inset-0 rounded-full border border-indigo-400/60 dark:border-indigo-300/50"
            />
            <img
              src="/app-icon.svg"
              alt="App Icon"
              width={32}
              height={32}
              className="relative h-8 w-8 rounded-full bg-indigo-600 dark:bg-indigo-500 dark:ring-slate-700"
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-base font-medium sm:text-lg text-slate-500 dark:text-slate-400">
              <span>{t("app_name")}</span> — <span>{t("full_app_name")}</span>
            </h1>
          </div>
        </div>

        {/* Card */}
        <section
          className={[
            "app-card-surface relative overflow-hidden rounded-2xl border shadow-xl backdrop-blur-sm",
            "dark:shadow-2xl",
            "p-6 sm:p-7",
          ].join(" ")}
        >
          {/* Inner glow only in dark mode */}
          <div className="pointer-events-none absolute inset-x-0 -top-24 hidden h-40 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.28),_transparent_60%)] dark:block" />

          <div className="relative">
            {/* Header row */}
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
                {subtitle && (
                  <p className="app-text-muted text-xs">{subtitle}</p>
                )}
              </div>
              {headerRight && <div>{headerRight}</div>}
            </div>

            {/* Auth content (form, errors, etc.) */}
            {children}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
