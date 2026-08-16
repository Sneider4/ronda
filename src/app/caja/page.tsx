"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Landmark,
  Lock,
  RotateCcw,
  Smartphone,
  Undo2,
  Wallet,
} from "lucide-react";
import type { PaymentMethod } from "@/types";
import { useDemo } from "@/store/demo-store";
import { money, number as fmtNumber, timeOfDay, weekdayDate } from "@/lib/format";
import {
  cashOut,
  expensesOfDay,
  openAmount,
  openTables,
  paymentBreakdown,
  salesOfDay,
  sumAmount,
  totals,
} from "@/services/analytics";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { LiveElapsed } from "@/components/ui/LiveElapsed";
import { SplitBar } from "@/components/charts/SplitBar";

const METHOD_ICONS: Record<PaymentMethod, typeof Banknote> = {
  Efectivo: Banknote,
  Tarjeta: CreditCard,
  Transferencia: Landmark,
  Nequi: Smartphone,
};

export default function CajaPage() {
  const { sales, tables, expenses, cash, closeCash, reopenCash, toast } = useDemo();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [counted, setCounted] = useState("");
  const [done, setDone] = useState(false);

  const todaySales = useMemo(() => salesOfDay(sales), [sales]);
  const summary = totals(todaySales);
  const payments = paymentBreakdown(todaySales);
  const anuladas = todaySales.filter((s) => s.status === "Anulada");
  const devoluciones = anuladas.reduce((s, x) => s + x.total, 0);

  const efectivo = payments.find((p) => p.method === "Efectivo")?.total ?? 0;
  const gastosEfectivo = useMemo(() => cashOut(expenses), [expenses]);
  const gastosDelDia = useMemo(
    () => expensesOfDay(expenses).filter((e) => e.status === "Pagado"),
    [expenses],
  );
  const esperadoEnCaja = cash.openingAmount + efectivo - gastosEfectivo;
  const countedValue = Number(counted.replace(/\D/g, ""));
  const diferencia = counted ? countedValue - esperadoEnCaja : 0;

  const open = openTables(tables);

  const doClose = () => {
    closeCash(countedValue || esperadoEnCaja);
    setConfirmOpen(false);
    setDone(true);
    toast({
      title: "Caja cerrada correctamente",
      description: `Turno del ${weekdayDate(new Date()).toLowerCase()} · ${money(summary.total)} en ventas.`,
      variant: "success",
    });
  };

  return (
    <div className="space-y-5">
      {/* Estado del turno */}
      <Card className="overflow-hidden border-0 bg-ink-950 p-0">
        <div className="grain flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span
              className={[
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11.5px] font-semibold tracking-wide uppercase",
                cash.closed
                  ? "bg-white/10 text-white/70"
                  : "bg-emerald-400/15 text-emerald-300",
              ].join(" ")}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${cash.closed ? "bg-white/50" : "bg-emerald-400"}`}
              />
              {cash.closed ? "Caja cerrada" : "Caja abierta"}
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Turno del {weekdayDate(new Date()).toLowerCase()}
            </h2>
            <p className="mt-1 text-[13.5px] text-white/55">
              Abierta a las {timeOfDay(cash.openedAt)} con base de{" "}
              {money(cash.openingAmount)} ·{" "}
              {cash.closed ? (
                <>cerrada a las {cash.closedAt && timeOfDay(cash.closedAt)}</>
              ) : (
                <>
                  lleva <LiveElapsed since={cash.openedAt} /> abierta
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl bg-white/[0.07] px-5 py-4 ring-1 ring-white/10">
              <p className="text-[11.5px] font-medium tracking-wide text-white/45 uppercase">
                Total vendido en el turno
              </p>
              <p className="tabular mt-1 text-3xl font-bold tracking-tight text-white">
                {money(summary.total)}
              </p>
            </div>

            {cash.closed ? (
              <Button
                variant="secondary"
                size="lg"
                icon={<RotateCcw size={17} />}
                onClick={() => {
                  reopenCash();
                  setDone(false);
                  setCounted("");
                  toast({ title: "Nuevo turno abierto", variant: "info" });
                }}
              >
                Abrir nuevo turno
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                icon={<Lock size={17} />}
                onClick={() => setConfirmOpen(true)}
              >
                Cerrar caja
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Desglose */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Resumen del turno"
            subtitle="Todo lo que entró hoy, por medio de pago"
            icon={<Wallet size={17} />}
          />

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {payments.map((p) => {
              const Icon = METHOD_ICONS[p.method];
              return (
                <div
                  key={p.method}
                  className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100 ring-inset"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200">
                    <Icon size={16} />
                  </span>
                  <p className="mt-2.5 text-[12.5px] text-slate-500">{p.method}</p>
                  <p className="tabular text-[17px] font-semibold text-slate-900">
                    {money(p.total)}
                  </p>
                  <p className="tabular text-[11.5px] text-slate-400">
                    {p.count} ventas · {p.share.toFixed(0)} %
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2.5">
              <Row label="Número de ventas" value={fmtNumber(summary.count)} />
              <Row label="Productos vendidos" value={fmtNumber(summary.units)} />
              <Row label="Ticket promedio" value={money(summary.ticket)} />
              <Row label="Propinas recibidas" value={money(summary.tips)} />
              <Row label="Descuentos aplicados" value={`-${money(summary.discounts)}`} />
              <Row
                label="Devoluciones / anuladas"
                value={anuladas.length ? `${anuladas.length} · ${money(devoluciones)}` : "Ninguna"}
              />
              <Row
                label="Gastos pagados hoy"
                value={
                  gastosDelDia.length
                    ? `${gastosDelDia.length} · ${money(sumAmount(gastosDelDia))}`
                    : "Ninguno"
                }
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100 ring-inset">
              <p className="text-[13px] font-semibold text-slate-900">
                Efectivo que debe haber en la caja
              </p>
              <ul className="tabular mt-3 space-y-2 text-[13px] text-slate-600">
                <li className="flex justify-between">
                  <span>Base inicial</span>
                  <span>{money(cash.openingAmount)}</span>
                </li>
                <li className="flex justify-between">
                  <span>+ Ventas en efectivo</span>
                  <span>{money(efectivo)}</span>
                </li>
                <li className="flex justify-between text-rose-700">
                  <span>− Gastos pagados en efectivo</span>
                  <span>{money(gastosEfectivo)}</span>
                </li>
              </ul>
              <div className="mt-3 flex items-baseline justify-between border-t border-slate-200 pt-3">
                <span className="text-[13.5px] font-semibold text-slate-900">
                  Total esperado
                </span>
                <span className="tabular text-xl font-bold text-slate-900">
                  {money(esperadoEnCaja)}
                </span>
              </div>
              {cash.closed && cash.countedAmount !== undefined && (
                <div className="mt-3 space-y-1 border-t border-slate-200 pt-3">
                  <div className="tabular flex justify-between text-[13px] text-slate-600">
                    <span>Contado al cierre</span>
                    <span>{money(cash.countedAmount)}</span>
                  </div>
                  <div className="tabular flex justify-between text-[13px] font-semibold">
                    <span className="text-slate-900">Diferencia de caja</span>
                    <span
                      className={
                        cash.countedAmount - esperadoEnCaja === 0
                          ? "text-emerald-700"
                          : cash.countedAmount - esperadoEnCaja > 0
                            ? "text-sky-700"
                            : "text-rose-700"
                      }
                    >
                      {money(cash.countedAmount - esperadoEnCaja)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Reparto del día"
              subtitle="Participación de cada medio de pago"
            />
            <SplitBar
              segments={payments.map((p) => ({
                id: p.method,
                label: p.method,
                value: p.total,
                display: money(p.total),
                caption: `${p.share.toFixed(0)} %`,
              }))}
            />
          </Card>

          <Card className={open.length ? "border-amber-200 bg-amber-50/50" : ""}>
            <CardHeader
              title="Antes de cerrar"
              subtitle="Cuentas que siguen abiertas"
              icon={<Undo2 size={17} />}
            />
            {open.length === 0 ? (
              <p className="flex items-center gap-2 text-[13px] text-emerald-700">
                <CheckCircle2 size={16} /> Todas las mesas están cobradas.
              </p>
            ) : (
              <>
                <ul className="space-y-2">
                  {open.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/70"
                    >
                      <span className="text-[13px] font-medium text-slate-800">
                        Mesa {t.number}
                      </span>
                      <Badge tone="warning">
                        {money(t.items.reduce((s, i) => s + i.qty * i.price, 0))}
                      </Badge>
                    </li>
                  ))}
                </ul>
                <p className="tabular mt-3 text-[12.5px] text-amber-800">
                  {money(openAmount(tables))} pendientes por cobrar.
                </p>
              </>
            )}
          </Card>
        </div>
      </section>

      {/* Confirmación de cierre */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        size="sm"
        title="Cerrar caja del turno"
        subtitle="Cuente el efectivo y confirme el cierre"
        icon={<Lock size={18} />}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={doClose} icon={<Lock size={16} />}>
              Confirmar cierre
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100 ring-inset">
            <div className="tabular flex justify-between text-[13px] text-slate-600">
              <span>Ventas del turno</span>
              <span>{money(summary.total)}</span>
            </div>
            <div className="tabular mt-1.5 flex justify-between text-[13px] text-slate-600">
              <span>Efectivo esperado</span>
              <span className="font-semibold text-slate-900">
                {money(esperadoEnCaja)}
              </span>
            </div>
          </div>

          <Field
            label="¿Cuánto efectivo hay en la caja?"
            hint="Si lo deja vacío, se toma el valor esperado."
          >
            <Input
              inputMode="numeric"
              placeholder={fmtNumber(esperadoEnCaja)}
              value={counted ? fmtNumber(Number(counted.replace(/\D/g, ""))) : ""}
              onChange={(e) => setCounted(e.target.value)}
            />
          </Field>

          {counted && (
            <p
              className={[
                "tabular rounded-lg px-3 py-2 text-[13px] font-semibold",
                diferencia === 0
                  ? "bg-emerald-50 text-emerald-800"
                  : diferencia > 0
                    ? "bg-sky-50 text-sky-800"
                    : "bg-rose-50 text-rose-800",
              ].join(" ")}
            >
              {diferencia === 0
                ? "La caja cuadra exactamente."
                : diferencia > 0
                  ? `Sobran ${money(diferencia)} en la caja.`
                  : `Faltan ${money(Math.abs(diferencia))} en la caja.`}
            </p>
          )}

          {open.length > 0 && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">
              Atención: {open.length} mesas siguen con cuenta abierta por{" "}
              {money(openAmount(tables))}.
            </p>
          )}
        </div>
      </Modal>

      {/* Comprobante de cierre */}
      <Modal
        open={done}
        onClose={() => setDone(false)}
        size="sm"
        title="Caja cerrada"
        subtitle="Resumen del turno"
        icon={<CheckCircle2 size={18} />}
        footer={
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setDone(false)}>
              Entendido
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex flex-col items-center rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-100 ring-inset">
            <span className="flex h-14 w-14 animate-[pop_0.4s_cubic-bezier(0.16,1,0.3,1)] items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
              <CheckCircle2 size={28} />
            </span>
            <p className="mt-3 text-[15px] font-semibold text-emerald-900">
              Turno cerrado correctamente
            </p>
            <p className="tabular mt-1 text-[13px] text-emerald-800">
              {money(summary.total)} en {summary.count} ventas
            </p>
          </div>
          <ul className="tabular space-y-2 text-[13px] text-slate-600">
            {payments.map((p) => (
              <li key={p.method} className="flex justify-between">
                <span>{p.method}</span>
                <span className="font-medium text-slate-900">{money(p.total)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-slate-200 pt-2">
              <span>Efectivo contado</span>
              <span className="font-medium text-slate-900">
                {money(cash.countedAmount ?? esperadoEnCaja)}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Diferencia</span>
              <span className="font-semibold text-slate-900">
                {money((cash.countedAmount ?? esperadoEnCaja) - esperadoEnCaja)}
              </span>
            </li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
      <span className="text-[13px] text-slate-500">{label}</span>
      <span className="tabular text-[13.5px] font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}
