"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  confirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback for components not wrapped in provider
    return {
      toast: (msg: string) => console.log("[Toast]", msg),
      confirm: (_msg: string, onConfirm: () => void) => onConfirm(),
    };
  }
  return ctx;
}

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

const colors: Record<ToastType, string> = {
  success: "bg-emerald-600",
  error: "bg-red-600",
  info: "bg-blue-600",
  warning: "bg-amber-500",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm max-w-sm transition-all duration-300 ${colors[toast.type]} ${exiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"}`}
      role="alert"
      aria-live="polite"
    >
      <span className="text-lg font-bold flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {icons[toast.type]}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 300); }}
        className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info", duration: number = 3000) => {
    const id = ++nextId;
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
  }, []);

  const showConfirm = useCallback((message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirmDialog({ message, onConfirm, onCancel });
  }, []);

  return (
    <ToastContext.Provider value={{ toast: showToast, confirm: showConfirm }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4 animate-in">
            <p className="text-gray-900 font-medium mb-4">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => {
                  confirmDialog.onCancel?.();
                  setConfirmDialog(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
