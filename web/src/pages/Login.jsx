// web/src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import api from "../lib/api";
import {
  mapFieldValidationErrors,
  getGlobalErrorFromAxios,
} from "../lib/errorHelpers";
import GoogleIcon from "../components/icons/GoogleIcon.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function Login() {
  const { t } = useTranslation();
  const [mode, setMode] = useState("owner"); // 'owner' | 'staff'
  const [errBlock, setErrBlock] = useState(null); // { code, email, mode }
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitErr, setSubmitErr] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  // Preselect mode & email via URL params
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const m = p.get("mode");
    const e = p.get("email");
    if (m === "staff" || m === "owner") setMode(m);
    if (e) {
      setForm((prev) => ({ ...prev, email: e }));
    }
  }, []);

  // Google login result handler (same as before)
  useEffect(() => {
    const handler = (ev) => {
      if (ev.data?.type === "google-auth-result") {
        const { payload } = ev.data;
        if (payload?.token) {
          localStorage.setItem("token", payload.token);
          localStorage.setItem("tokenType", "owner");
          location.href = "/";
        } else if (payload?.errors) {
          alert(payload.errors.map((code) => t(`errors.${code}`)).join("\n"));
        } else {
          alert(t("errors.9000"));
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [t]);

  const loginGoogle = () => {
    // open popup to backend redirect endpoint
    window.open(
      `${API}/auth/google/redirect`,
      "google",
      "width=520,height=640"
    );
  };

  // Update form field + clear related errors
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // Clear field-level error
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

    // Clear submit + panel error when user edits fields
    if (submitErr) setSubmitErr("");
    if (errBlock) setErrBlock(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrBlock(null);
    setFieldErrors({});
    setSubmitErr("");

    const email = form.email.trim();
    const password = form.password;
    const endpoint = mode === "owner" ? "/auth/login" : "/staff/login";

    try {
      const res = await api.post(endpoint, { email, password });
      const data = res.data;

      if (data?.success) {
        // backend: { success, message: "LOGIN_SUCCESS", data: { token } }
        const token = data.data?.token ?? data.token;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("tokenType", mode); // 'owner' | 'staff'
          // Shared landing: Orders
          location.href = "/orders";
          return;
        }
      }

      // 2xx but success=false (rare)
      if (data?.message) {
        const key = `errors.${data.message}`;
        const translated = t(key) !== key ? t(key) : data.message;
        setSubmitErr(translated);
      } else {
        setSubmitErr(t("errors.9000") || "Unexpected error");
      }
    } catch (err) {
      // Network or no response
      if (!err.response) {
        setSubmitErr(getGlobalErrorFromAxios(err, t));
        return;
      }

      const { status, data } = err.response;

      // Validation error (422) → field-level errors
      if (status === 422 && data?.errors && typeof data.errors === "object") {
        const fe = mapFieldValidationErrors(data.errors, t);
        setFieldErrors(fe);

        const globalMsg = getGlobalErrorFromAxios(err, t, {
          defaultValidationCode: 1000,
        });
        setSubmitErr(globalMsg);
        return;
      }

      // Non-validation errors with message as code:
      // e.g. ACCOUNT_NOT_FOUND, INVALID_CREDENTIAL, EMAIL_NOT_VERIFIED,
      // STAFF_INACTIVE, INVITE_PENDING, etc.
      if (data?.message) {
        const messageCode = data.message;

        // Owner / staff-specific panel (verify, signup, reset, etc.)
        setErrBlock({
          code: messageCode,
          email,
          mode,
        });
        return;
      }

      // Fallback
      setSubmitErr(getGlobalErrorFromAxios(err, t));
    }
  };

  return (
    <div className="min-h-screen relative bg-gray-50 flex items-center justify-center px-4">
      <LanguageSwitcher className="fixed top-4 right-4" />

      <form
        onSubmit={submit}
        className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8"
      >
        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("owner");
              setErrBlock(null);
              setSubmitErr("");
            }}
            className={`flex-1 py-2 rounded-md border text-sm font-medium transition ${
              mode === "owner"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            {t("login_type_owner")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("staff");
              setErrBlock(null);
              setSubmitErr("");
            }}
            className={`flex-1 py-2 rounded-md border text-sm font-medium transition ${
              mode === "staff"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            {t("login_type_staff")}
          </button>
        </div>

        <h1 className="text-2xl font-semibold mb-2">{t("login")}</h1>

        {/* Error panel for business errors (verify, signup, reset, etc.) */}
        {errBlock && <LoginErrorPanel {...errBlock} t={t} />}

        {/* Generic submit error (validation/global) */}
        {submitErr && !errBlock && (
          <div className="mb-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {submitErr}
          </div>
        )}

        <label className="block text-sm mt-3">{t("email")}</label>
        <input
          name="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          className={`mt-1 border rounded-md w-full p-2 focus:ring-2 focus:ring-black focus:outline-none ${
            fieldErrors.email ? "border-red-500" : ""
          }`}
          placeholder="name@example.com"
        />
        {fieldErrors.email && (
          <div className="mt-1 text-xs text-red-600">{fieldErrors.email}</div>
        )}

        <label className="block text-sm mt-4">{t("password")}</label>
        <input
          name="password"
          type="password"
          required
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          className={`mt-1 border rounded-md w-full p-2 focus:ring-2 focus:ring-black focus:outline-none ${
            fieldErrors.password ? "border-red-500" : ""
          }`}
          placeholder="••••••••"
        />
        {fieldErrors.password && (
          <div className="mt-1 text-xs text-red-600">
            {fieldErrors.password}
          </div>
        )}

        <button
          type="submit"
          className="mt-6 w-full py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
          {t("login")}
        </button>

        {/* Google sign-in (owner only) */}
        {mode === "owner" && (
          <button
            type="button"
            className="mt-3 w-full py-2 border border-gray-300 rounded-md flex items-center justify-center gap-2 text-sm hover:bg-gray-50 transition"
            onClick={loginGoogle}
          >
            <GoogleIcon size={18} />
            {t("sign_in_google")}
          </button>
        )}

        {/* Footer links */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {mode === "owner" ? (
            <>
              {t("create_account")}?{" "}
              <a href="/signup" className="text-blue-600 underline">
                {t("signup")}
              </a>
            </>
          ) : (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setMode("owner");
                setErrBlock(null);
                setSubmitErr("");
              }}
              className="text-blue-600 underline"
            >
              {t("switch_to_owner_login")}
            </a>
          )}
        </div>
      </form>
    </div>
  );
}

/** Inline error box renderer */
function LoginErrorPanel({ code, email, mode, t }) {
  const wrap = (node) => (
    <div className="mb-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
      {node}
    </div>
  );

  // ==== OWNER MODE ====
  if (mode === "owner") {
    // Backend message codes: EMAIL_NOT_VERIFIED, INVALID_CREDENTIAL, ACCOUNT_NOT_FOUND
    if (code === "EMAIL_NOT_VERIFIED") {
      return wrap(
        <>
          {t("login_error_unverified")}{" "}
          <a
            className="underline"
            href={`/verify-email?email=${encodeURIComponent(email)}`}
          >
            {t("verify_now")}
          </a>
        </>
      );
    }
    if (code === "INVALID_CREDENTIAL") {
      return wrap(
        <>
          {t("login_error_bad_password")}{" "}
          <a
            className="underline"
            href={`/reset-password?email=${encodeURIComponent(email)}`}
          >
            {t("reset_password")}
          </a>
        </>
      );
    }
    if (code === "ACCOUNT_NOT_FOUND") {
      return wrap(
        <>
          {t("login_error_no_account")}{" "}
          <a
            className="underline"
            href={`/signup?email=${encodeURIComponent(email)}`}
          >
            {t("create_account")}
          </a>
        </>
      );
    }
    return wrap(t("errors.9000"));
  }

  // ==== STAFF MODE ====
  // Expected message codes for staff backend:
  // ACCOUNT_NOT_FOUND, INVITE_PENDING, STAFF_INACTIVE, INVALID_CREDENTIAL
  if (mode === "staff") {
    if (code === "ACCOUNT_NOT_FOUND") {
      return wrap(
        <>
          {t("login_staff_not_found")} {t("login_staff_contact_owner")}
        </>
      );
    }
    if (code === "INVITE_PENDING") {
      return wrap(
        <>
          {t("login_staff_invite_pending") || t("login_staff_contact_owner")}{" "}
          {t("login_staff_contact_owner")}
        </>
      );
    }
    if (code === "STAFF_INACTIVE") {
      return wrap(
        <>
          {t("login_staff_inactive")} {t("login_staff_contact_owner")}
        </>
      );
    }
    if (code === "INVALID_CREDENTIAL") {
      return wrap(
        <>
          {t("login_staff_bad_password")}{" "}
          <a
            className="underline"
            href={`/staff-reset?email=${encodeURIComponent(email)}`}
          >
            {t("reset_password")}
          </a>
        </>
      );
    }
    return wrap(
      <>
        {t("errors.9000")} {t("login_staff_contact_owner")}
      </>
    );
  }

  // fallback
  return wrap(t("errors.9000"));
}
