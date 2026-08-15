"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Printer, X } from "lucide-react";
import type { Sale } from "@/types";
import { Receipt } from "./Receipt";
import { Button } from "@/components/ui/Button";

export function ReceiptModal({
  sale,
  onClose,
  celebrate = false,
}: {
  sale: Sale | null;
  onClose: () => void;
  /** muestra el encabezado de "pago registrado" tras cerrar una cuenta */
  celebrate?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!sale) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sale, onClose]);

  if (!mounted || !sale) return null;

  return createPortal(
    <div className="print-overlay fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6">
      <div
        className="no-print absolute inset-0 animate-[fade-in_0.2s_ease-out] bg-ink-950/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="print-area relative flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
        <header className="no-print flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            {celebrate && (
              <span className="flex h-10 w-10 animate-[pop_0.4s_cubic-bezier(0.16,1,0.3,1)] items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 ring-inset">
                <CheckCircle2 size={20} />
              </span>
            )}
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                {celebrate ? "Pago registrado" : `Comprobante #${sale.number}`}
              </h2>
              <p className="text-[13px] text-slate-500">
                {celebrate
                  ? `Mesa ${sale.tableNumber} · ${sale.paymentMethod}`
                  : "Documento interno del establecimiento"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/70 px-4 py-5">
          <Receipt sale={sale} />
        </div>

        <footer className="no-print flex items-center gap-2 border-t border-slate-100 bg-white px-5 py-4">
          <Button
            variant="primary"
            icon={<Printer size={16} />}
            onClick={() => window.print()}
            className="flex-1"
          >
            Imprimir
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cerrar
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
