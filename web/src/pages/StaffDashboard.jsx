// web/src/pages/StaffDashboard.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function StaffDashboard() {
  const { t } = useTranslation();

  const logout = () => {
    localStorage.clear();
    location.href = "/login?mode=staff";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <button
        onClick={logout}
        className="absolute top-4 right-4 text-sm underline text-gray-600 hover:text-black"
      >
        {t("logout")}
      </button>

      <h1 className="text-2xl font-bold">
        {t("staff_dashboard") || "Staff Dashboard"}
      </h1>

      <div className="mt-4 grid gap-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold">
            {t("welcome_staff") || "Welcome"}
          </h2>
          <p className="text-gray-600 mt-1">
            {t("staff_dashboard_intro") ||
              "This is your workspace. In the next step, you will be able to create orders, mark them ready, and see live updates."}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-medium">{t("coming_soon") || "Coming soon"}</h3>
          <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
            <li>
              {t("feature_create_order") || "Create new order with one tap"}
            </li>
            <li>{t("feature_mark_ready") || "Mark orders ready & done"}</li>
            <li>
              {t("feature_live_updates") || "Live queue updates (Socket.IO)"}
            </li>
            <li>
              {t("feature_sound_vibration") ||
                "Customer sound & vibration alerts"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
