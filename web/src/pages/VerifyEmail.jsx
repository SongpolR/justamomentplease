// web/src/pages/VerifyEmail.jsx
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import api from "../lib/api";
import {
  mapFieldValidationErrors,
  getGlobalErrorFromAxios,
} from "../lib/errorHelpers";
import { Link } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import AuthLayout from "../components/layout/AuthLayout.jsx";

export default function VerifyEmail() {
  const { t } = useTranslation("auth");
  const params = new URLSearchParams(location.search);
  const initialEmail = params.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [fieldErrors, setFieldErrors] = useState({});
  const { showToast } = useToast();

  const canSubmit = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  const updateEmail = (value) => {
    setEmail(value);

    // Clear field error
    setFieldErrors((prev) => {
      if (!prev.email) return prev;
      const next = { ...prev };
      delete next.email;
      return next;
    });
  };

  const resend = async () => {
    setFieldErrors({});

    try {
      const res = await api.post("/auth/resend-verification", {
        email: email.trim(),
      });

      const data = res.data;

      if (data?.success) {
        showToast({ type: "success", message: t("link_sent") });
        return;
      }
    } catch (err) {
      if (!err.response) {
        showToast({ type: "error", message: getGlobalErrorFromAxios(err, t) });
        return;
      }

      const { status: httpStatus, data } = err.response;

      // Validation error: 422 with field errors
      if (
        httpStatus === 422 &&
        data?.errors &&
        typeof data.errors === "object"
      ) {
        const fe = mapFieldValidationErrors(data.errors, t);
        setFieldErrors(fe);

        const globalMsg = getGlobalErrorFromAxios(err, t, {
          defaultValidationCode: 1000,
        });
        if (globalMsg) {
          showToast({ type: "error", message: globalMsg });
        }
        return;
      }

      // Non-validation error with message as code / string
      if (data?.message) {
        showToast({ type: "error", message: data.message });
        return;
      }

      showToast({ type: "error", message: getGlobalErrorFromAxios(err, t) });
    }
  };

  const subtitle = t("verify_email_desc");

  return (
    <AuthLayout title={t("verify_email_title")} subtitle={subtitle}>
      {/* Email field */}
      <label className="mt-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
        {t("common:email_address")}
      </label>
      <input
        type="email"
        className={[
          "mt-1 w-full rounded-lg border p-2.5 text-sm",
          "bg-white text-slate-900 placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-slate-100",
          "dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500",
          "dark:focus:ring-offset-slate-900",
          fieldErrors.email
            ? "border-red-500 focus:ring-red-500"
            : "border-slate-300 dark:border-slate-700",
        ].join(" ")}
        value={email}
        onChange={(e) => updateEmail(e.target.value)}
        placeholder="you@example.com"
      />
      {fieldErrors.email && (
        <div className="mt-1 text-xs text-red-500 dark:text-red-400">
          {fieldErrors.email}
        </div>
      )}

      {/* Resend button */}
      <button
        onClick={resend}
        disabled={!canSubmit}
        className={[
          "mt-4 flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/40 transition",
          "bg-indigo-500 hover:-translate-y-[1px] hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 active:translate-y-0 active:scale-[0.99]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-indigo-500",
        ].join(" ")}
      >
        {t("resend_link")}
      </button>

      {/* Footer actions */}
      <div className="mt-6 flex flex-row gap-2 text-xs text-slate-500 justify-between dark:text-slate-400">
        <a
          className="underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
          href="mailto:"
        >
          {t("open_email_app")}
        </a>
        <Link
          className="underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
          to="/login"
        >
          {t("common:back_to_login")}
        </Link>
      </div>
    </AuthLayout>
  );
}
