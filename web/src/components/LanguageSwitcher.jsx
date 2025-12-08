import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
  };

  const Btn = ({ code, label }) => {
    const active = lang === code;

    return (
      <button
        onClick={() => changeLang(code)}
        aria-pressed={active}
        className={[
          "relative inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-medium transition-all",
          "border border-slate-700/70 backdrop-blur-sm",
          active
            ? "bg-slate-950 text-slate-100 shadow-[0_0_10px_rgba(99,102,241,0.35)] border-indigo-500/60"
            : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full bg-slate-900/60 p-1 border border-slate-800/80 backdrop-blur-sm",
        className,
      ].join(" ")}
    >
      <Btn code="en" label="EN" />
      <Btn code="th" label="TH" />
    </div>
  );
}
