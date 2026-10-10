"use client";

import React from "react";
import { useToast } from "../../context/ToastContext";
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />,
          error: <AlertCircle size={16} className="text-rose-400 shrink-0" />,
          info: <Info size={16} className="text-primary shrink-0" />,
          spark: <Sparkles size={16} className="text-primary animate-pulse shrink-0" />,
        };

        const borders = {
          success: "border-emerald-500/30",
          error: "border-rose-500/30",
          info: "border-primary/30",
          spark: "border-primary/40",
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl glass-elevated border ${
              borders[toast.type]
            } shadow-2xl animate-in slide-in-from-bottom-5 duration-300`}
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <p className="text-xs font-medium text-white">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 active:scale-95 transition"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
