"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useDemo } from "@/store/demo-store";

const config = {
  success: { icon: CheckCircle2, ring: "ring-emerald-200", color: "text-emerald-600", bar: "bg-emerald-500" },
  info: { icon: Info, ring: "ring-sky-200", color: "text-sky-600", bar: "bg-sky-500" },
  warning: { icon: AlertTriangle, ring: "ring-amber-200", color: "text-amber-600", bar: "bg-amber-500" },
  error: { icon: XCircle, ring: "ring-rose-200", color: "text-rose-600", bar: "bg-rose-500" },
};

export function Toaster() {
  const { toasts, dismissToast } = useDemo();

  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
      {toasts.map((t) => {
        const c = config[t.variant];
        const Icon = c.icon;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-sm animate-[slide-up_0.28s_cubic-bezier(0.16,1,0.3,1)] items-start gap-3 overflow-hidden rounded-xl bg-white p-3.5 shadow-lg shadow-ink-950/10 ring-1 ${c.ring}`}
          >
            <span className={`mt-0.5 ${c.color}`}>
              <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-[13px] text-slate-500">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Cerrar notificación"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
