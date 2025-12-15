// web/src/components/ToastProvider.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import CloseIcon from "./icons/CloseIcon.jsx";

const ToastContext = createContext(null);

let toastIdCounter = 0;

function ToastItem({ toast, onRequestClose, onRemove }) {
  const [visible, setVisible] = useState(false);

  // Enter animation
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Exit animation when toast.closing becomes true
  useEffect(() => {
    if (toast.closing) {
      setVisible(false);
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, 220); // match transition duration with small buffer
      return () => clearTimeout(timer);
    }
  }, [toast.closing, toast.id, onRemove]);

  // === Theming & type styles ===
  let containerTint = "border-slate-200 dark:border-slate-700"; // default/info-ish
  let dotTint = "bg-slate-400";
  let titleTint = "text-slate-900 dark:text-slate-50";

  if (toast.type === "success") {
    containerTint =
      "border-emerald-300/80 dark:border-emerald-500/70 shadow-emerald-500/30";
    dotTint = "bg-emerald-500";
    titleTint = "text-emerald-800 dark:text-emerald-200";
  } else if (toast.type === "error") {
    containerTint =
      "border-red-300/80 dark:border-red-500/70 shadow-red-500/30";
    dotTint = "bg-red-500";
    titleTint = "text-red-800 dark:text-red-200";
  } else if (toast.type === "warning") {
    containerTint =
      "border-amber-300/80 dark:border-amber-500/70 shadow-amber-400/30";
    dotTint = "bg-amber-400";
    titleTint = "text-amber-800 dark:text-amber-100";
  } else if (toast.type === "info") {
    containerTint =
      "border-indigo-300/80 dark:border-indigo-500/70 shadow-indigo-500/30";
    dotTint = "bg-indigo-500";
    titleTint = "text-indigo-800 dark:text-indigo-100";
  }

  return (
    <div
      className={[
        "relative flex min-w-[280px] max-w-sm gap-3 rounded-2xl border px-4 py-3.5 text-sm",
        "bg-white/95 text-slate-900 shadow-xl shadow-slate-900/10 backdrop-blur-sm",
        "dark:bg-slate-900/95 dark:text-slate-50 dark:shadow-2xl",
        containerTint,
        "transition-all duration-200 ease-out transform",
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-2 scale-95",
      ].join(" ")}
    >
      {/* Accent dot */}
      <div className="flex h-6 w-6 items-center justify-center">
        <span
          className={[
            "h-2.5 w-2.5 rounded-full",
            dotTint,
            "shadow-[0_0_8px_rgba(148,163,184,0.7)]",
          ].join(" ")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 mt-0.5">
        {toast.title && (
          <div
            className={["mb-0.5 text-[13px] font-semibold", titleTint].join(
              " "
            )}
          >
            {toast.title}
          </div>
        )}
        <div className="text-[13px] text-slate-700 dark:text-slate-200">
          {toast.message}
        </div>
      </div>

      {/* Close button */}
      {toast.dismissible && (
        <div className="flex h-6 w-6 items-center justify-center">
          <button
            type="button"
            onClick={() => onRequestClose(toast.id)}
            className="ml-1 text-lg font-semibold leading-none text-slate-500 opacity-70 hover:text-slate-800 hover:opacity-100 dark:text-slate-300 dark:hover:text-slate-50"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    ({
      type = "info", // 'info' | 'success' | 'warning' | 'error'
      message = "",
      title = "",
      duration = 5000,
      dismissible = true,
    }) => {
      if (!message) return;
      const id = ++toastIdCounter;

      const toast = {
        id,
        type,
        message,
        title,
        dismissible,
        closing: false,
      };
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, closing: true } : t))
          );
        }, duration);
      }
    },
    []
  );

  const dismissToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, closing: true } : t))
    );
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Toast viewport */}
      <div className="pointer-events-none fixed top-0 right-0 z-[2000] space-y-3 m-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem
              toast={toast}
              onRequestClose={dismissToast}
              onRemove={removeToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
