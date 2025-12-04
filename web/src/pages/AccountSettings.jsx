// web/src/pages/AccountSettings.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";

export default function AccountSettings() {
  const { t } = useTranslation("account");
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const role = localStorage.getItem("tokenType") || "staff"; // fallback

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
    navigate("/login", { replace: true });
  };

  return (
    <div className="mt-4 max-w-xl">
      {/* Logout Confirmation Modal */}
      <ConfirmModal
        open={showLogoutConfirm}
        title={t("common:logout_confirm_title")}
        message={t("common:logout_confirm_message")}
        cancelLabel={t("common:cancel")}
        confirmLabel={t("common:logout")}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
      />

      <h1 className="text-2xl font-bold mb-2">
        {t("account_settings_title") || "Account Settings"}
      </h1>

      <div className="bg-white rounded-xl shadow p-4 text-sm text-gray-700">
        <div className="mb-2">
          <strong>{t("account_role") || "Role"}:</strong>{" "}
          {role === "owner"
            ? t("role_owner") || "Owner"
            : t("role_staff") || "Staff"}
        </div>

        <p className="text-gray-600 mb-4">
          {t("account_settings_intro") ||
            "Here you can manage your personal account settings. Password change and additional options will be added soon."}
        </p>

        <div className="flex flex-col gap-2 mt-2">
          <button
            type="button"
            className="inline-flex items-center justify-center border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() =>
              alert("Change password flow will be implemented in a later step.")
            }
          >
            {t("change_password") || "Change password (coming soon)"}
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center bg-red-500 text-white rounded-md px-3 py-2 text-sm hover:bg-gray-900"
            onClick={() => setShowLogoutConfirm(true)}
          >
            {t("common:logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
