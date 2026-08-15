"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, CheckCircle2, CreditCard, Landmark, Smartphone } from "lucide-react";
import type { BarTable, PaymentMethod, Sale } from "@/types";
import { money, number as fmtNumber } from "@/lib/format";
import { tableTotal } from "@/services/analytics";
import { useDemo } from "@/store/demo-store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

const METHODS: {
  id: PaymentMethod;
  icon: typeof Banknote;
  hint: string;
}[] = [
  { id: "Efectivo", icon: Banknote, hint: "Pago en billetes" },
  { id: "Tarjeta", icon: CreditCard, hint: "Débito o crédito" },
  { id: "Transferencia", icon: Landmark, hint: "Bancolombia, Davivienda…" },
  { id: "Nequi", icon: Smartphone, hint: "Nequi o Daviplata" },
];

const TIPS = [0, 5, 10];

export function PaymentModal({
  table,
  open,
  onClose,
  onPaid,
}: {
  table: BarTable | null;
  open: boolean;
  onClose: () => void;
  onPaid: (sale: Sale) => void;
}) {
  const { closeAccount, toast } = useDemo();
  const [method, setMethod] = useState<PaymentMethod>("Efectivo");
  const [tipPct, setTipPct] = useState(0);
  const [received, setReceived] = useState("");
  const [processing, setProcessing] = useState(false);

  const subtotal = table ? tableTotal(table) : 0;
  const tip = Math.round((subtotal * tipPct) / 100 / 100) * 100;
  const total = subtotal + tip;

  useEffect(() => {
    if (open) {
      setMethod("Efectivo");
      setTipPct(0);
      setReceived("");
      setProcessing(false);
    }
  }, [open]);

  const change = useMemo(() => {
    const value = Number(received.replace(/\D/g, ""));
    if (!value) return null;
    return value - total;
  }, [received, total]);

  const confirm = () => {
    if (!table) return;
    setProcessing(true);
    // Pequeña espera para que el gesto se sienta como una transacción real
    setTimeout(() => {
      const sale = closeAccount(table.id, { paymentMethod: method, tip });
      setProcessing(false);
      if (!sale) return;
      onPaid(sale);
      toast({
        title: `Cuenta de la mesa ${table.number} cerrada`,
        description: `${money(sale.total)} · ${sale.paymentMethod} · venta #${sale.number}`,
        variant: "success",
      });
    }, 420);
  };

  if (!table) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={`Cobrar mesa ${table.number}`}
      subtitle="Seleccione cómo paga el cliente"
      icon={<CheckCircle2 size={18} />}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={processing}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={confirm}
            disabled={processing}
            icon={<CheckCircle2 size={17} />}
          >
            {processing ? "Registrando…" : `Confirmar pago · ${money(total)}`}
          </Button>
        </div>
      }
    >
      <div className="rounded-2xl bg-ink-950 p-5 text-center">
        <p className="text-[12px] font-medium tracking-wide text-white/50 uppercase">
          Total a cobrar
        </p>
        <p className="tabular mt-1 text-4xl font-bold tracking-tight text-white">
          {money(total)}
        </p>
        <p className="tabular mt-1.5 text-[12.5px] text-white/45">
          Consumo {money(subtotal)}
          {tip > 0 && ` · propina ${money(tip)}`}
        </p>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-[13px] font-medium text-slate-700">Método de pago</p>
        <div className="grid grid-cols-2 gap-2.5">
          {METHODS.map((m) => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={[
                  "flex items-center gap-3 rounded-xl p-3.5 text-left ring-1 transition-all duration-150",
                  active
                    ? "bg-brand-50 ring-2 ring-brand-400"
                    : "bg-white ring-slate-200 hover:bg-slate-50 hover:ring-slate-300",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    active ? "bg-brand-500 text-ink-950" : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  <Icon size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-semibold text-slate-900">
                    {m.id}
                  </span>
                  <span className="block truncate text-[11.5px] text-slate-500">
                    {m.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[13px] font-medium text-slate-700">
            Propina voluntaria
          </p>
          <div className="flex gap-2">
            {TIPS.map((pct) => (
              <button
                key={pct}
                onClick={() => setTipPct(pct)}
                className={[
                  "tabular flex-1 rounded-xl py-2.5 text-[13px] font-semibold ring-1 transition-all",
                  tipPct === pct
                    ? "bg-slate-900 text-white ring-slate-900"
                    : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                {pct === 0 ? "Sin propina" : `${pct} %`}
              </button>
            ))}
          </div>
        </div>

        {method === "Efectivo" && (
          <Field label="¿Con cuánto paga?">
            <Input
              inputMode="numeric"
              placeholder="Ej: 100.000"
              value={received ? fmtNumber(Number(received.replace(/\D/g, ""))) : ""}
              onChange={(e) => setReceived(e.target.value)}
            />
            {change !== null && (
              <p
                className={[
                  "tabular mt-2 rounded-lg px-3 py-2 text-[13px] font-semibold",
                  change >= 0
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-rose-50 text-rose-800",
                ].join(" ")}
              >
                {change >= 0
                  ? `Cambio: ${money(change)}`
                  : `Faltan ${money(Math.abs(change))}`}
              </p>
            )}
          </Field>
        )}
      </div>

      <p className="mt-5 text-center text-[11.5px] text-slate-400">
        Al confirmar se descuenta el inventario, se libera la mesa y se genera el
        comprobante interno de la venta.
      </p>
    </Modal>
  );
}
