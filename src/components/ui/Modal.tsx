"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Size = "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-5xl",
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  size = "md",
  footer,
  children,
  bodyClassName = "",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  size?: Size;
  footer?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-[fade-in_0.2s_ease-out] bg-ink-950/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={[
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-white shadow-2xl shadow-ink-950/25",
          "animate-[slide-up_0.28s_cubic-bezier(0.16,1,0.3,1)] rounded-t-2xl sm:rounded-2xl",
          sizes[size],
        ].join(" ")}
      >
        {(title || subtitle) && (
          <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              {icon && (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 ring-inset">
                  {icon}
                </span>
              )}
              <div>
                <h2 className="text-base font-semibold tracking-tight text-slate-900">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </header>
        )}

        <div className={`flex-1 overflow-y-auto px-5 py-5 sm:px-6 ${bodyClassName}`}>
          {children}
        </div>

        {footer && (
          <footer className="border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
