import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";

  const Btn = ({ code, label }) => (
    <button
      onClick={() => i18n.changeLanguage(code)}
      className={`px-2 py-1 text-xs border rounded ${
        lang === code ? "bg-black text-white" : "bg-white text-black"
      }`}
      aria-pressed={lang === code}
    >
      {label}
    </button>
  );

  return (
    <div className={`flex gap-2 ${className}`}>
      <Btn code="en" label="EN" />
      <Btn code="th" label="TH" />
    </div>
  );
}
