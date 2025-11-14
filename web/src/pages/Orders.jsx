// web/src/pages/Orders.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function Orders() {
  const { t } = useTranslation();

  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold mb-2">
        {t("orders_title") || "Orders"}
      </h1>
      <p className="text-gray-600 text-sm">
        {t("orders_intro") ||
          "This is the shared order workspace for owners and staff. Here you will see active orders, create new ones, and mark them as ready or done."}
      </p>

      <div className="mt-4 bg-white rounded-xl shadow p-4 text-sm text-gray-700">
        {t("orders_placeholder") ||
          "In the next step, we will add the real-time order list and actions here."}
      </div>
    </div>
  );
}
