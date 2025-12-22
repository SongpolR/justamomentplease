// web/src/components/Dialog.jsx
import React, { useEffect, useRef, useState } from "react";

export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,

  // UI options
  size = "sm", // 'sm' | 'md' | 'lg'
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = false,

  // a11y
  ariaLabelledById,
  ariaDescribedById,

  // optional style overrides
  overlayClassName = "",
  panelClassName = "",
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef(null);

  // Mount/unmount with enter/exit animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    }

    // animate out
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 220); // duration-200 + buffer
    return () => clearTimeout(t);
  }, [open]);

  // ESC handler + focus
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape" && closeOnEsc) onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);

    const t = setTimeout(() => panelRef.current?.focus(), 0);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closeOnEsc, onClose]);

  if (!mounted) return null;

  const sizeClass =
    size === "lg" ? "max-w-2xl" : size === "md" ? "max-w-lg" : "max-w-sm";

  return (
    <div
      className={[
        "fixed inset-0 z-[2000] flex items-center justify-center",
        "bg-black/50 backdrop-blur-sm",
        "transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
        overlayClassName,
      ].join(" ")}
      // ✅ close on CLICK (not mousedown) to avoid click-through
      onClick={() => {
        if (open && closeOnBackdrop) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledById}
        aria-describedby={ariaDescribedById}
        // stop events from closing modal when clicking inside
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className={[
          "w-full",
          sizeClass,
          "rounded-2xl p-5 mx-2",
          "bg-white text-slate-900",
          "shadow-2xl shadow-slate-900/30 ring-1 ring-slate-200",
          "transition-all duration-200 ease-out",
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
          "dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800",
          panelClassName,
        ].join(" ")}
      >
        {(title || description || showCloseButton) && (
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title && (
                <div
                  id={ariaLabelledById}
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                >
                  {title}
                </div>
              )}
              {description && (
                <div
                  id={ariaDescribedById}
                  className="mt-1 text-sm text-slate-600 dark:text-slate-400"
                >
                  {description}
                </div>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="
                  -mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full
                  border border-slate-200 bg-white text-slate-700 shadow-sm
                  transition hover:bg-slate-50
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300
                  dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800
                "
                aria-label="Close dialog"
              >
                ×
              </button>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
