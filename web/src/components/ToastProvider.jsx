// web/src/components/ToastProvider.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";

const ToastContext = createContext(null);

let toastIdCounter = 0;

function ToastItem({ toast, onRequestClose, onRemove }) {
  const [visible, setVisible] = useState(false);

  // Enter animation
  useEffect(() => {
    // Slight delay to ensure transition applies
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Exit animation when toast.closing becomes true
  useEffect(() => {
    if (toast.closing) {
      setVisible(false);
      // Wait for the transition to finish before actually removing
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, 220); // should match duration-200 with a tiny buffer
      return () => clearTimeout(timer);
    }
  }, [toast.closing, toast.id, onRemove]);

  let theme = "bg-slate-50 border-slate-300 text-slate-900";
  if (toast.type === "success") {
    theme = "bg-emerald-50 border-emerald-500 text-emerald-900";
  } else if (toast.type === "error") {
    theme = "bg-red-50 border-red-500 text-red-900";
  } else if (toast.type === "warning") {
    theme = "bg-amber-50 border-amber-500 text-amber-900";
  } else if (toast.type === "info") {
    theme = "bg-blue-50 border-blue-500 text-blue-900";
  }

  return (
    <div
      className={`
        shadow-xl border-l-4 rounded-lg flex items-start gap-3
        px-4 py-3 min-w-[260px] max-w-md
        text-base leading-snug
        ${theme}
        transition-all duration-200 ease-out transform
        ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-2 scale-95"
        }
      `}
    >
      <div className="flex-1">
        {toast.title && (
          <div className="font-semibold mb-0.5 text-[15px]">{toast.title}</div>
        )}
        <div className="text-[14px]">{toast.message}</div>
      </div>
      {toast.dismissible && (
        <button
          type="button"
          onClick={() => onRequestClose(toast.id)}
          className="ml-1 text-lg leading-none font-semibold opacity-60 hover:opacity-100"
        >
          ×
        </button>
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
      title = "", // optional short title
      duration = 5000,
      dismissible = true,
    }) => {
      if (!message) return;
      const id = ++toastIdCounter;

      const toast = { id, type, message, title, dismissible, closing: false };
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          // trigger closing animation instead of removing immediately
          setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, closing: true } : t))
          );
        }, duration);
      }
    },
    []
  );

  // Request to start closing (e.g. when user clicks ×)
  const dismissToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, closing: true } : t))
    );
  }, []);

  // Actually remove from state after animation completed
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Toast viewport */}
      <div className="fixed top-6 right-6 z-[2000] space-y-3 pointer-events-none">
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
