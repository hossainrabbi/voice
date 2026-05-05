"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { Toast, ToastType } from "@/hooks/use-toast";

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: number) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
  error: <XCircle className="h-5 w-5 text-rose-400 shrink-0" />,
};

const styles: Record<ToastType, string> = {
  success:
    "bg-emerald-500/10 border-emerald-500/30 text-emerald-100",
  error:
    "bg-rose-500/10 border-rose-500/30 text-rose-100",
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl
        backdrop-blur-xl min-w-[260px] max-w-sm w-full
        ${styles[toast.type]}
      `}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm leading-snug font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-current opacity-50 hover:opacity-100 transition-opacity mt-0.5"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-[9999] flex flex-col gap-2 items-center sm:items-end pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full sm:w-auto">
            <ToastItem toast={t} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
