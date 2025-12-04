// web/src/components/ConfirmModal.jsx
import React from "react";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
        {title && <h2 className="text-lg font-semibold mb-3">{title}</h2>}

        {message && <p className="text-sm text-gray-600 mb-6">{message}</p>}

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
