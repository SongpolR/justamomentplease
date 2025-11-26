// web/src/pages/ShopSettings.jsx
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import api from "../lib/api";
import {
  mapFieldValidationErrors,
  getGlobalErrorFromAxios,
} from "../lib/errorHelpers";
import EditIcon from "../components/icons/EditIcon.jsx";
import CancelIcon from "../components/icons/CancelIcon.jsx";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_W = 1024;
const MAX_H = 1024;

const SOUND_KEYS = ["ding", "bell", "chime", "ping", "beep"];

const TIMEZONES = [
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "America/New_York",
];

export default function ShopSettings() {
  const { t } = useTranslation();

  const [shop, setShop] = useState(null);
  const [shopName, setShopName] = useState("");
  const [isEditingShop, setIsEditingShop] = useState(false);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoMeta, setLogoMeta] = useState({ w: null, h: null, error: "" });

  const logoInputRef = useRef(null);

  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState(null); // success/info
  const [error, setError] = useState(null); // global error

  // Separate field errors for shop form vs invite form
  const [shopFieldErrors, setShopFieldErrors] = useState({});
  const [inviteFieldErrors, setInviteFieldErrors] = useState({});

  const [savingShop, setSavingShop] = useState(false);
  const [inviting, setInviting] = useState(false);

  const [soundKey, setSoundKey] = useState("ding");
  const [timezone, setTimezone] = useState("Asia/Bangkok");

  // Fetch shop + staff
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [shopRes, staffRes] = await Promise.all([
          api.get("/shop"),
          api.get("/staff"),
        ]);

        if (shopRes.data) {
          // robust: support both wrapped and plain shop responses
          const s = shopRes.data.data?.shop ?? shopRes.data;
          setShop(s);
          setShopName(s.name || "");
          setLogoPreview(s.logo_url || null);
          setSoundKey(s.sound_key || "ding");
          setTimezone(
            s.timezone ||
              Intl.DateTimeFormat().resolvedOptions().timeZone ||
              "Asia/Bangkok"
          );
        }

        if (staffRes.data) setStaffs(staffRes.data);
      } catch (err) {
        console.error(err);
        setError(getGlobalErrorFromAxios(err, t));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [t]);

  // ---- Shop editing helpers ----
  const startEditShop = () => {
    setIsEditingShop(true);
    setMessage(null);
    setError(null);
  };

  const cancelEditShop = () => {
    setIsEditingShop(false);
    setShopName(shop?.name || "");
    setLogoFile(null);
    setLogoPreview(shop?.logo_url || null);
    setLogoMeta({ w: null, h: null, error: "" });
    setSoundKey(shop?.sound_key || "ding");
    setTimezone(
      shop?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "Asia/Bangkok"
    );
    setShopFieldErrors({});
    setError(null);
    setMessage(null);
  };

  const updateShopName = (value) => {
    setShopName(value);
    setShopFieldErrors((prev) => {
      if (!prev.name) return prev;
      const next = { ...prev };
      delete next.name;
      return next;
    });
    if (error) setError(null);
    if (message) setMessage(null);
  };

  const handleLogoClick = () => {
    if (!isEditingShop) return;
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  };

  const handleLogoChange = (file) => {
    setLogoFile(file || null);
    setLogoMeta({ w: null, h: null, error: "" });
    setShopFieldErrors((prev) => {
      if (!prev.logo) return prev;
      const next = { ...prev };
      delete next.logo;
      return next;
    });
    setError(null);
    setMessage(null);

    if (!file) {
      // revert to original shop logo if any
      setLogoPreview(shop?.logo_url || null);
      return;
    }

    // Basic type/size checks
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const msg = t("invalid_image_file");
      setLogoMeta({ w: null, h: null, error: msg });
      setShopFieldErrors((prev) => ({ ...prev, logo: msg }));
      setLogoPreview(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      const msg = t("logo_too_big");
      setLogoMeta({ w: null, h: null, error: msg });
      setShopFieldErrors((prev) => ({ ...prev, logo: msg }));
      setLogoPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setLogoPreview(url);

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w > MAX_W || h > MAX_H) {
        const msg = t("logo_too_large_resolution");
        setLogoMeta({ w, h, error: msg });
        setShopFieldErrors((prev) => ({ ...prev, logo: msg }));
      } else {
        setLogoMeta({ w, h, error: "" });
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      const msg = t("invalid_image_file");
      setLogoMeta({ w: null, h: null, error: msg });
      setShopFieldErrors((prev) => ({ ...prev, logo: msg }));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const saveShop = async () => {
    if (!isShopDirty()) return;

    setSavingShop(true);
    setMessage(null);
    setError(null);
    setShopFieldErrors({});

    const trimmedName = shopName.trim();

    if (!trimmedName) {
      const msg = t("errors.1001") || t("shop_name_required");
      setShopFieldErrors({ name: msg });
      setError(msg);
      setSavingShop(false);
      return;
    }

    if (logoMeta.error) {
      setError(logoMeta.error);
      setShopFieldErrors((prev) => ({ ...prev, logo: logoMeta.error }));
      setSavingShop(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", trimmedName);
      fd.append("sound_key", soundKey);
      fd.append("timezone", timezone);
      if (logoFile) {
        fd.append("logo", logoFile);
      }

      const res = await api.post("/shop", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;

      if (data?.success) {
        const updated = data.data?.shop ?? data.data ?? shop ?? {};
        const updatedShop = {
          ...updated,
          name: updated.name ?? trimmedName,
          logo_url: updated.logo_url ?? shop?.logo_url ?? null,
          sound_key: updated.sound_key ?? soundKey,
          timezone:
            updated.timezone ??
            timezone ??
            Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        setShop(updatedShop);
        setShopName(updatedShop.name || trimmedName);
        setLogoPreview(updatedShop.logo_url || logoPreview);
        setLogoFile(null);
        setLogoMeta({ w: null, h: null, error: "" });
        setSoundKey(updatedShop.sound_key || "ding");
        setTimezone(
          updatedShop.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone ||
            "Asia/Bangkok"
        );

        const msgKey = data.message ? `errors.${data.message}` : null;
        if (msgKey && t(msgKey) !== msgKey) {
          setMessage(t(msgKey));
        } else {
          setMessage(t("shop_saved") || "Shop updated");
        }

        setIsEditingShop(false);
        setSavingShop(false);
        return;
      }

      // 2xx but success=false
      if (data?.message) {
        const key = `errors.${data.message}`;
        const translated = t(key) !== key ? t(key) : data.message;
        setError(translated);
      } else {
        setError(t("errors.9000") || "Unexpected error");
      }
    } catch (err) {
      if (!err.response) {
        setError(getGlobalErrorFromAxios(err, t));
        setSavingShop(false);
        return;
      }

      const { status, data } = err.response;

      // Validation errors from backend (422)
      if (status === 422 && data?.errors && typeof data.errors === "object") {
        const fe = mapFieldValidationErrors(data.errors, t);
        setShopFieldErrors(fe);

        const globalMsg = getGlobalErrorFromAxios(err, t, {
          defaultValidationCode: 1000,
        });
        setError(globalMsg);
        setSavingShop(false);
        return;
      }

      if (data?.message) {
        const msg = getGlobalErrorFromAxios(err, t);
        setError(msg);
      } else {
        setError(getGlobalErrorFromAxios(err, t));
      }
    } finally {
      setSavingShop(false);
    }
  };

  // ---- Invite Staff helpers ----
  const updateNewName = (value) => {
    setNewName(value);
    setInviteFieldErrors((prev) => {
      if (!prev.name) return prev;
      const next = { ...prev };
      delete next.name;
      return next;
    });
    if (error) setError(null);
    if (message) setMessage(null);
  };

  const updateNewEmail = (value) => {
    setNewEmail(value);
    setInviteFieldErrors((prev) => {
      if (!prev.email) return prev;
      const next = { ...prev };
      delete next.email;
      return next;
    });
    if (error) setError(null);
    if (message) setMessage(null);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setMessage(null);
    setError(null);
    setInviteFieldErrors({});
    setInviting(true);

    // optional quick client-side check
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      const msg = t("invalid_email");
      setInviteFieldErrors((prev) => ({ ...prev, email: msg }));
      setError(t("errors.1000") || msg);
      setInviting(false);
      return;
    }

    try {
      const res = await api.post("/staff/invite", {
        email: newEmail.trim(),
        name: newName.trim() || null,
      });

      const data = res.data;

      if (data?.success) {
        if (data.message === "INVITE_SENT") {
          setMessage(t("invite_sent"));
        } else if (data.message === "STAFF_ALREADY_EXISTS") {
          setMessage(t("staff_already_exists") || t("invite_sent"));
        } else {
          setMessage(t("invite_sent"));
        }
        setNewEmail("");
        setNewName("");
        setInviting(false);
        return;
      }

      if (data?.message) {
        const key = `errors.${data.message}`;
        const translated = t(key) !== key ? t(key) : data.message;
        setError(translated);
      } else {
        setError(t("errors.9000") || "Unexpected error");
      }
    } catch (err) {
      if (!err.response) {
        setError(getGlobalErrorFromAxios(err, t));
        setInviting(false);
        return;
      }

      const { status, data } = err.response;

      if (status === 422 && data?.errors && typeof data.errors === "object") {
        const fe = mapFieldValidationErrors(data.errors, t);
        setInviteFieldErrors(fe);

        const globalMsg = getGlobalErrorFromAxios(err, t, {
          defaultValidationCode: 1000,
        });
        setError(globalMsg);
        setInviting(false);
        return;
      }

      if (data?.message) {
        const msg = getGlobalErrorFromAxios(err, t);
        setError(msg);
      } else {
        setError(getGlobalErrorFromAxios(err, t));
      }
    } finally {
      setInviting(false);
    }
  };

  const resendInvite = async (email) => {
    setMessage(null);
    setError(null);

    try {
      const res = await api.post("/staff/invite/resend", { email });
      const data = res.data;

      if (data?.success) {
        setMessage(t("invite_resent"));
        return;
      }

      if (data?.message) {
        const key = `errors.${data.message}`;
        const translated = t(key) !== key ? t(key) : data.message;
        setError(translated);
      } else {
        setError(t("errors.9000") || "Unexpected error");
      }
    } catch (err) {
      setError(getGlobalErrorFromAxios(err, t));
    }
  };

  const resetStaffPassword = async (email) => {
    setMessage(null);
    setError(null);

    try {
      const res = await api.post("/staff/forgot", { email });
      const data = res.data;

      if (data?.success) {
        setMessage(t("reset_link_sent"));
        return;
      }

      if (data?.message) {
        const key = `errors.${data.message}`;
        const translated = t(key) !== key ? t(key) : data.message;
        setError(translated);
      } else {
        setError(t("errors.9000") || "Unexpected error");
      }
    } catch (err) {
      setError(getGlobalErrorFromAxios(err, t));
    }
  };

  const deactivateStaff = async (id) => {
    if (!confirm(t("confirm_deactivate"))) return;
    setMessage(null);
    setError(null);

    try {
      const res = await api.post(`/staff/${id}/deactivate`);
      const data = res.data;

      if (data?.success) {
        setStaffs((prev) =>
          prev.map((s) =>
            s.kind === "staff" && s.id === id ? { ...s, is_active: 0 } : s
          )
        );
        setMessage(t("staff_deactivated"));
        return;
      }

      if (data?.message) {
        const key = `errors.${data.message}`;
        const translated = t(key) !== key ? t(key) : data.message;
        setError(translated);
      } else {
        setError(t("errors.9000") || "Unexpected error");
      }
    } catch (err) {
      setError(getGlobalErrorFromAxios(err, t));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-600">
        {t("loading")}
      </div>
    );
  }

  const getBaseTimezone = () =>
    shop?.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "Asia/Bangkok";

  const isShopDirty = () => {
    if (!shop) return false;

    const baseName = (shop.name || "").trim();
    const currentName = (shopName || "").trim();

    const baseSound = shop.sound_key || "ding";
    const baseTimezone = getBaseTimezone();

    return (
      currentName !== baseName ||
      !!logoFile || // any new logo selected
      soundKey !== baseSound ||
      timezone !== baseTimezone
    );
  };

  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold">
        {t("shop_settings_title") || t("owner_dashboard")}
      </h1>

      {/* Shop info + editing */}
      {shop && (
        <div className="mt-4 bg-white rounded-xl shadow p-4">
          {/* Shop name row */}
          <div className="mb-4">
            <div className="flex flex-row items-center">
              <label className="text-xs font-medium text-gray-500 mr-1">
                {t("shop_name")}
              </label>
              {isEditingShop ? (
                <button
                  type="button"
                  onClick={cancelEditShop}
                  title={t("cancel")}
                  className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-black transition"
                >
                  <CancelIcon size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startEditShop}
                  title={t("edit")}
                  className="p-2 rounded-md hover:bg-gray-100 text-blue-600 hover:text-black transition"
                >
                  <EditIcon size={18} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isEditingShop ? (
                <div className="flex-1">
                  <input
                    type="text"
                    className={`border rounded p-2 ${
                      shopFieldErrors.name ? "border-red-500" : ""
                    }`}
                    value={shopName}
                    onChange={(e) => updateShopName(e.target.value)}
                  />

                  {shopFieldErrors.name && (
                    <div className="mt-1 text-xs text-red-600">
                      {shopFieldErrors.name}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 text-gray-800 font-medium">
                  {shop.name}
                </div>
              )}
            </div>
          </div>

          {/* Logo row */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              {t("shop_logo")}
            </label>

            <div className="flex items-start gap-4">
              <div
                className="relative w-24 h-24 border rounded overflow-hidden flex items-center justify-center bg-gray-50 cursor-pointer"
                onClick={handleLogoClick}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="shop logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400">
                    {t("no_logo") || "No logo"}
                  </span>
                )}

                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs transition">
                  <EditIcon size={18} />
                </div>

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) =>
                    handleLogoChange(e.target.files?.[0] || null)
                  }
                />
              </div>

              <div className="flex-1 text-xs text-gray-600">
                <div className="font-medium">
                  {t("logo_requirements_title")}
                </div>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  <li>{t("logo_req_size")}</li>
                  <li>{t("logo_req_resolution")}</li>
                  <li>{t("logo_req_types")}</li>
                </ul>

                {logoMeta.w && logoMeta.h && !logoMeta.error && (
                  <div className="mt-1 text-gray-500">
                    {t("preview")} ({logoMeta.w}×{logoMeta.h}px)
                  </div>
                )}
                {(logoMeta.error || shopFieldErrors.logo) && (
                  <div className="mt-1 text-xs text-red-600">
                    {shopFieldErrors.logo || logoMeta.error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sound key */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              {t("shop_sound_key")}
            </label>
            <select
              className="border p-2 rounded"
              value={soundKey}
              onChange={(e) => setSoundKey(e.target.value)}
            >
              {SOUND_KEYS.map((key) => {
                const labelKey = `sound_options.${key}`;
                const label = t(labelKey) !== labelKey ? t(labelKey) : key;
                return (
                  <option key={key} value={key}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Timezone */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              {t("timezone")}
            </label>
            <select
              className="border p-2 rounded"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {TIMEZONES.map((tz) => {
                const key = `timezones.${tz}`;
                const label = t(key) !== key ? t(key) : tz;
                return (
                  <option key={tz} value={tz}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Save button */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={saveShop}
              disabled={savingShop || !isShopDirty()}
              className="px-4 py-2 bg-black text-white rounded disabled:opacity-50 hover:bg-gray-800"
            >
              {t("save_changes") || t("save")}
            </button>
          </div>
        </div>
      )}

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
        <form
          className="mt-3 flex flex-col sm:flex-row gap-3"
          onSubmit={handleInviteSubmit}
        >
          <div className="flex-1">
            <input
              type="text"
              className={`border p-2 rounded w-full ${
                inviteFieldErrors.name ? "border-red-500" : ""
              }`}
              placeholder={t("staff_name")}
              value={newName}
              onChange={(e) => updateNewName(e.target.value)}
            />
            {inviteFieldErrors.name && (
              <div className="mt-1 text-xs text-red-600">
                {inviteFieldErrors.name}
              </div>
            )}
          </div>

          <div className="flex-1">
            <input
              type="email"
              className={`border p-2 rounded w-full ${
                inviteFieldErrors.email ? "border-red-500" : ""
              }`}
              placeholder={t("staff_email")}
              value={newEmail}
              onChange={(e) => updateNewEmail(e.target.value)}
              required
            />
            {inviteFieldErrors.email && (
              <div className="mt-1 text-xs text-red-600">
                {inviteFieldErrors.email}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!newEmail.trim() || inviting}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {t("send_invite")}
          </button>
        </form>
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
              {staffs.map((s) => {
                const isInvite = s.kind === "invite";

                return (
                  <tr
                    key={`${isInvite ? "invite" : "staff"}-${s.id ?? s.email}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="border px-3 py-2">{s.name || "-"}</td>
                    <td className="border px-3 py-2">{s.email}</td>

                    <td className="border px-3 py-2 text-center">
                      {isInvite ? (
                        <span className="text-orange-500">
                          {t("staff_status_invited") || t("invited")}
                        </span>
                      ) : s.is_active ? (
                        <span className="text-green-600">{t("active")}</span>
                      ) : (
                        <span className="text-red-600">{t("inactive")}</span>
                      )}
                    </td>

                    <td className="border px-3 py-2 text-center space-x-2">
                      {/* Pending invite → only resend */}
                      {isInvite && (
                        <button
                          onClick={() => resendInvite(s.email)}
                          className="text-xs underline text-blue-600"
                        >
                          {t("resend_invite")}
                        </button>
                      )}

                      {/* Real staff → reset password / deactivate */}
                      {!isInvite && s.is_active && (
                        <button
                          onClick={() => resetStaffPassword(s.email)}
                          className="text-xs underline text-blue-600"
                        >
                          {t("reset_password")}
                        </button>
                      )}

                      {!isInvite && (
                        <button
                          onClick={() => deactivateStaff(s.id)}
                          className="text-xs underline text-red-600"
                        >
                          {t("deactivate")}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

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
