import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function Dashboard() {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const [shop, setShop] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // ---------- Fetch Shop & Staff ----------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [shopRes, staffRes] = await Promise.all([
          fetch(`${API}/shop`, { headers }),
          fetch(`${API}/staff`, { headers }),
        ]);
        if (shopRes.ok) setShop(await shopRes.json());
        if (staffRes.ok) setStaffs(await staffRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ---------- Logout ----------
  const logout = () => {
    localStorage.clear();
    location.href = "/login";
  };

  // ---------- Invite Staff ----------
  const inviteStaff = async () => {
    setMessage(null);
    setError(null);
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      setError(t("invalid_email"));
      return;
    }

    try {
      const r = await fetch(`${API}/staff/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newEmail, name: newName }),
      });

      if (r.ok) {
        setMessage(t("invite_sent"));
        setNewEmail("");
        setNewName("");
      } else {
        const data = await r.json().catch(() => ({}));
        setError(data.message || t("errors.1999"));
      }
    } catch {
      setError(t("errors.1999"));
    }
  };

  // ---------- Resend Invite ----------
  const resendInvite = async (email) => {
    setMessage(null);
    try {
      const r = await fetch(`${API}/staff/invite/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      if (r.ok) setMessage(t("invite_resent"));
    } catch {
      setError(t("errors.1999"));
    }
  };

  // ---------- Reset Password ----------
  const resetStaffPassword = async (email) => {
    setMessage(null);
    try {
      const r = await fetch(`${API}/staff/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (r.ok) setMessage(t("reset_link_sent"));
    } catch {
      setError(t("errors.1999"));
    }
  };

  // ---------- Deactivate Staff ----------
  const deactivateStaff = async (id) => {
    if (!confirm(t("confirm_deactivate"))) return;
    setMessage(null);
    try {
      const r = await fetch(`${API}/staff/${id}/deactivate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        setStaffs((prev) =>
          prev.map((s) => (s.id === id ? { ...s, is_active: 0 } : s))
        );
        setMessage(t("staff_deactivated"));
      }
    } catch {
      setError(t("errors.1999"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <button
        onClick={logout}
        className="absolute top-4 right-4 text-sm underline text-gray-600 hover:text-black"
      >
        {t("logout")}
      </button>

      <h1 className="text-2xl font-bold">{t("owner_dashboard")}</h1>
      {shop && (
        <div className="mt-2 text-gray-700">
          <div>
            <strong>{t("shop_name")}:</strong> {shop.name}
          </div>
          {shop.logo_url && (
            <img
              src={shop.logo_url}
              alt="shop logo"
              className="mt-2 w-24 h-24 object-contain rounded"
            />
          )}
        </div>
      )}

      {/* Messages */}
      {message && (
        <div className="mt-4 bg-green-50 border border-green-300 text-green-800 p-3 rounded">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-300 text-red-800 p-3 rounded">
          {error}
        </div>
      )}

      {/* Invite Staff */}
      <div className="mt-6 bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold">{t("invite_staff")}</h2>
        <div className="mt-3 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            className="border p-2 rounded flex-1"
            placeholder={t("staff_name")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="email"
            className="border p-2 rounded flex-1"
            placeholder={t("staff_email")}
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <button
            onClick={inviteStaff}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            {t("send_invite")}
          </button>
        </div>
      </div>

      {/* Staff List */}
      <div className="mt-8 bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold">{t("staff_list")}</h2>
        <div className="overflow-x-auto mt-3">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">{t("name")}</th>
                <th className="border px-3 py-2 text-left">{t("email")}</th>
                <th className="border px-3 py-2">{t("status")}</th>
                <th className="border px-3 py-2 text-center">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {staffs.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{s.name || "-"}</td>
                  <td className="border px-3 py-2">{s.email}</td>
                  <td className="border px-3 py-2 text-center">
                    {s.is_active ? (
                      <span className="text-green-600">{t("active")}</span>
                    ) : (
                      <span className="text-red-600">{t("inactive")}</span>
                    )}
                  </td>
                  <td className="border px-3 py-2 text-center space-x-2">
                    {!s.is_active && (
                      <button
                        onClick={() => resendInvite(s.email)}
                        className="text-xs underline text-blue-600"
                      >
                        {t("resend_invite")}
                      </button>
                    )}
                    {s.is_active && (
                      <button
                        onClick={() => resetStaffPassword(s.email)}
                        className="text-xs underline text-blue-600"
                      >
                        {t("reset_password")}
                      </button>
                    )}
                    <button
                      onClick={() => deactivateStaff(s.id)}
                      className="text-xs underline text-red-600"
                    >
                      {t("deactivate")}
                    </button>
                  </td>
                </tr>
              ))}
              {staffs.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-3 text-gray-500">
                    {t("no_staff")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
