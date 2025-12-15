// web/src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../lib/api.js";
import {
  mapFieldValidationErrors,
  getGlobalErrorFromAxios,
} from "../lib/errorHelpers.js";
import { useToast } from "../components/ToastProvider";
import { Link } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout.jsx";

export default function ForgotPassword() {
  const { t } = useTranslation("auth");
  const params = new URLSearchParams(location.search);
  const initialEmail = params.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const clearErrors = () => {
    if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
  };

  const submit = async (e) => {
    e.preventDefault();
    clearErrors();
    if (!email) return;

    setSubmitting(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      const data = res.data;

      if (data?.success) {
        showToast({ type: "success", message: t("reset_request_success") });
        return;
      }
    } catch (err) {
      if (err?.response) {
        const { status, data } = err.response;
        if (status === 422 && data?.errors && typeof data.errors === "object") {
          const fe = mapFieldValidationErrors(data.errors, t);
          setFieldErrors(fe);
          return;
        }
      }
      showToast({ type: "error", message: getGlobalErrorFromAxios(err, t) });
    } finally {
      setSubmitting(false);
    }
  };

  const emailError = fieldErrors.email;

  return (
    <AuthLayout
      title={t("reset_request_title")}
      subtitle={t("reset_request_intro")}
    >
      {/* Form */}
      <form onSubmit={submit}>
        <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-300">
          {t("common:email")}
        </label>

        <input
          type="email"
          className={[
            "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-slate-100",
            "dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-offset-slate-900",
            emailError
              ? "border-red-400 focus:ring-red-400"
              : "border-slate-300",
          ].join(" ")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearErrors();
          }}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        {emailError && (
          <div className="mt-1 text-xs text-red-600 dark:text-red-300">
            {emailError}
          </div>
        )}

        <button
          type="submit"
          disabled={!email || submitting}
          className="
                  mt-4 inline-flex w-full items-center justify-center
                  rounded-full px-4 py-2 text-sm font-semibold
                  bg-indigo-500 text-white shadow-md shadow-indigo-500/35
                  transition
                  hover:-translate-y-[1px] hover:bg-indigo-400
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300
                  active:translate-y-0 active:scale-[0.98]
                  disabled:cursor-not-allowed disabled:opacity-60
                "
        >
          {submitting
            ? t("common:loading") || "Loading..."
            : t("reset_request_submit")}
        </button>

        <div className="mt-5 flex items-center justify-center text-sm">
          <Link
            className="text-slate-600 underline underline-offset-4 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
            to="/login"
          >
            {t("common:back_to_login")}
          </Link>
        </div>
      </form>
      <div>
        <p className="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
          {t("reset_request_security_hint") ||
            "For security, we’ll respond the same way whether the email exists or not."}
        </p>
      </div>
    </AuthLayout>
  );
}
