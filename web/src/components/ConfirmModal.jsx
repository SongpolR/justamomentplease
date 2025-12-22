// web/src/components/ConfirmModal.jsx
import React, { useMemo } from "react";
import Dialog from "./Dialog";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,

  // ✅ now supports toast-like variants too:
  // 'info' | 'success' | 'warning' | 'error' | 'neutral'
  // (back-compat) 'danger' | 'primary' | 'neutral'
  variant = "error",
}) {
  const tone = useMemo(() => {
    // Backward-compatible mapping
    if (variant === "danger") return "error";
    if (variant === "primary") return "info";
    return variant; // info|success|warning|error|neutral
  }, [variant]);

  const styles = useMemo(() => {
    // Defaults (neutral-ish)
    let containerTint = "border-slate-200 dark:border-slate-700";
    let dotTint = "bg-slate-400";
    let titleTint = "text-slate-900 dark:text-slate-50";
    let confirmBtnClass =
      "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 focus-visible:ring-slate-300 " +
      "dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200";

    if (tone === "success") {
      containerTint =
        "border-emerald-300/80 dark:border-emerald-500/70 shadow-emerald-500/30";
      dotTint = "bg-emerald-500";
      titleTint = "text-emerald-800 dark:text-emerald-200";
      confirmBtnClass =
        "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30 focus-visible:ring-emerald-300";
    } else if (tone === "error") {
      containerTint =
        "border-red-300/80 dark:border-red-500/70 shadow-red-500/30";
      dotTint = "bg-red-500";
      titleTint = "text-red-800 dark:text-red-200";
      confirmBtnClass =
        "bg-red-500 hover:bg-red-400 shadow-red-500/30 focus-visible:ring-red-300";
    } else if (tone === "warning") {
      containerTint =
        "border-amber-300/80 dark:border-amber-500/70 shadow-amber-400/30";
      dotTint = "bg-amber-400";
      titleTint = "text-amber-800 dark:text-amber-100";
      confirmBtnClass =
        "bg-amber-500 hover:bg-amber-400 shadow-amber-400/30 focus-visible:ring-amber-300";
    } else if (tone === "info") {
      containerTint =
        "border-indigo-300/80 dark:border-indigo-500/70 shadow-indigo-500/30";
      dotTint = "bg-indigo-500";
      titleTint = "text-indigo-800 dark:text-indigo-100";
      confirmBtnClass =
        "bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/30 focus-visible:ring-indigo-300";
    } else if (tone === "neutral") {
      // keep defaults (already neutral-friendly)
      containerTint = "border-slate-200 dark:border-slate-700";
      dotTint = "bg-slate-400";
      titleTint = "text-slate-900 dark:text-slate-50";
      confirmBtnClass =
        "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 focus-visible:ring-slate-300 " +
        "dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200";
    }

    return { containerTint, dotTint, titleTint, confirmBtnClass };
  }, [tone]);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      // We render our own title/message for full styling control
      title={null}
      description={null}
      size="s"
      closeOnBackdrop={true}
      closeOnEsc={true}
      showCloseButton={false}
      ariaLabelledById="confirm-title"
      ariaDescribedById="confirm-desc"
    >
      {/* Toast-like header block */}
      {/* <div
        className={[
          "rounded-2xl border px-4 py-3.5",
          "bg-white/95 shadow-xl shadow-slate-900/10 backdrop-blur-sm",
          "dark:bg-slate-900/95 dark:shadow-2xl",
          styles.containerTint,
        ].join(" ")}
      > */}
      <div className="flex gap-3">
        <div className="flex h-7 w-7 items-center justify-center">
          <span
            className={[
              "h-2.5 w-2.5 rounded-full",
              styles.dotTint,
              "shadow-[0_0_8px_rgba(148,163,184,0.7)]",
            ].join(" ")}
          />
        </div>

        <div className="flex-1">
          <div
            id="confirm-title"
            className={["text-[18px] font-extrabold", styles.titleTint].join(
              " "
            )}
          >
            {title}
          </div>
          <div
            id="confirm-desc"
            className="mt-1 text-[14px] text-slate-600 dark:text-slate-200"
          >
            {message}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="
              inline-flex items-center justify-center
              rounded-full px-4 py-2 text-sm font-medium
              border border-slate-300 bg-white text-slate-700
              shadow-sm transition
              hover:bg-slate-50
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300
              dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200
              dark:hover:bg-slate-800
            "
        >
          {cancelLabel}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className={[
            "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white",
            "shadow-md transition",
            "hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2",
            styles.confirmBtnClass,
          ].join(" ")}
        >
          {confirmLabel}
        </button>
      </div>
      {/* </div> */}
    </Dialog>
  );
}
