import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function Login() {
  const { t } = useTranslation();

  const submit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const r = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) {
      alert(t("invalid_login"));
      return;
    }
    const { token } = await r.json();
    localStorage.setItem("token", token);
    location.href = "/";
  };

  return (
    <div className="min-h-screen relative">
      <LanguageSwitcher className="fixed top-4 right-4" />
      <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow w-80">
          <h1 className="text-xl font-semibold">{t("login")}</h1>
          <input
            name="email"
            type="email"
            className="mt-4 w-full border p-2 rounded"
            placeholder={t("email")}
            required
          />
          <input
            name="password"
            type="password"
            className="mt-2 w-full border p-2 rounded"
            placeholder={t("password")}
            required
          />
          <button className="mt-3 w-full bg-black text-white rounded py-2">
            {t("login")}
          </button>

          <div className="mt-4 text-center text-sm">
            {t("create_account")}?{" "}
            <a className="text-blue-600 underline" href="/signup">
              {t("signup")}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
