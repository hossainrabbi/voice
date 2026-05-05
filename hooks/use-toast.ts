import { useState, useCallback } from "react";

export type ToastType = "success" | "error";

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, type, message }]);
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message: string) => addToast("success", message),
    error: (message: string) => addToast("error", message),
  };

  return { toasts, toast, removeToast };
}
