"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Eye, HandCoins, Trophy } from "lucide-react";
import type { Sale } from "@/types";
import { useDemo } from "@/store/demo-store";
import { employeeById } from "@/data/employees";
import { expenseCategoryById } from "@/data/expenses";
import {
  byHour,
  expensesOfDay,
  isOwnerDraw,
  operating,
  paymentBreakdown,
  salesOfDay,
  sumAmount,
  topProducts,
  totals,
} from "@/services/analytics";
import {
  hourLabelShort,
  money,
  number as fmtNumber,
  timeOfDay,
  weekdayDate,
} from "@/lib/format";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BarSeries } from "@/components/charts/BarSeries";
import { RankList } from "@/components/charts/RankList";
import { SplitBar } from "@/components/charts/SplitBar";
import { ReceiptModal } from "@/components/ventas/ReceiptModal";

/**
 * Resumen de un día puntual: lo que se vendió, lo que salió y lo que quedó,
 * con el detalle de cada venta. Es el "¿cómo nos fue el sábado pasado?".
 */
export function DayDetailModal({
  date,
  onClose,
}: {
  date: Date | null;
  onClose: () => void;
}) {
  const { sales, expenses } = useDemo();
  const [receipt, setReceipt] = useState<Sale | null>(null);

  const data = useMemo(() => {
    if (!date) return null;
    const daySales = salesOfDay(sales, date);
    const resumen = totals(daySales);
    const dayExpenses = expensesOfDay(expenses, date);
    const gastos = sumAmount(operating(dayExpenses));
    const retiros = sumAmount(dayExpenses.filter(isOwnerDraw));
    return {
      daySales,
      resumen,
      dayExpenses,
      gastos,
      retiros,
      neto: resumen.total - resumen.tips - gastos,
      pagos: paymentBreakdown(daySales),
      top: topProducts(daySales, 5),
      horas: byHour(daySales),
      listado: [...daySales].sort(
        (a, b) => +new Date(b.dateISO) - +new Date(a.dateISO),
      ),
    };
  }, [date, sales, expenses]);

  if (!date || !data) return null;

  return (
    <>
      <Modal
        open={!!date}
        onClose={onClose}
        size="xl"
        icon={<CalendarDays size={18} />}
        title={weekdayDate(date)}
        subtitle={`${data.resumen.count} ventas · ${fmtNumber(data.resumen.units)} productos vendidos`}
        bodyClassName="bg-slate-50/60"
      >
        {/* Cifras del día */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile label="Venta del día" value={money(data.resumen.total)} strong />
          <Tile label="Propinas" value={money(data.resumen.tips)} muted />
          <Tile label="Gastos del día" value={money(data.gastos)} tone="rose" />
          <Tile label="Quedó" value={money(data.neto)} strong />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel title="Cómo pagaron" icon={<HandCoins size={16} />}>
            <SplitBar
              segments={data.pagos.map((p) => ({
                id: p.method,
                label: p.method,
                value: p.total,
                display: money(p.total),
                caption: `${p.count}`,
              }))}
            />
          </Panel>

          <Panel title="Lo más vendido" icon={<Trophy size={16} />}>
            {data.top.length ? (
              <RankList
                rows={data.top.map((p) => ({
                  id: p.productId,
                  label: p.name,
                  emoji: p.emoji,
                  value: p.units,
                  display: `${p.units} u.`,
                  caption: money(p.revenue),
                }))}
              />
            ) : (
              <Vacio texto="No hubo ventas este día." />
            )}
          </Panel>

          <Panel title="Ventas por hora" icon={<Clock3 size={16} />}>
            <BarSeries
              points={data.horas.map((h) => ({
                label: hourLabelShort(h.hour),
                value: h.total,
                caption: `${h.count} ventas`,
              }))}
              valueFormat={money}
              height={185}
            />
          </Panel>
        </div>

        {/* Gastos del día */}
        {data.dayExpenses.length > 0 && (
          <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <p className="mb-3 text-[13.5px] font-semibold text-slate-900">
              Salidas de dinero de este día
            </p>
            <ul className="space-y-2">
              {data.dayExpenses.map((e) => {
                const cat = expenseCategoryById(e.category);
                return (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-3 border-b border-slate-50 pb-2 last:border-0"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="text-base">{cat.emoji}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-slate-800">
                          {e.description}
                        </span>
                        <span className="block text-[11.5px] text-slate-500">
                          {e.supplier ?? cat.name} · {e.paymentMethod}
                        </span>
                      </span>
                    </span>
                    <span className="tabular shrink-0 text-[13px] font-semibold text-rose-700">
                      -{money(e.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Ventas del día */}
        <div className="mt-4 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          <p className="px-4 pt-4 pb-3 text-[13.5px] font-semibold text-slate-900">
            Ventas de este día
          </p>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-50/95 backdrop-blur">
                <tr className="border-y border-slate-100 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  <th className="px-4 py-2">Venta</th>
                  <th className="px-4 py-2">Hora</th>
                  <th className="px-4 py-2">Mesa</th>
                  <th className="hidden px-4 py-2 sm:table-cell">Atendió</th>
                  <th className="px-4 py-2">Pago</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.listado.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="tabular px-4 py-2 text-[13px] font-semibold text-slate-900">
                      #{s.number}
                    </td>
                    <td className="tabular px-4 py-2 text-[12.5px] text-slate-500">
                      {timeOfDay(s.dateISO)}
                    </td>
                    <td className="px-4 py-2 text-[12.5px] text-slate-600">
                      Mesa {s.tableNumber}
                    </td>
                    <td className="hidden px-4 py-2 text-[12.5px] text-slate-600 sm:table-cell">
                      {employeeById(s.employeeId).name.split(" ")[0]}
                    </td>
                    <td className="px-4 py-2">
                      <Badge tone={s.status === "Pagada" ? "neutral" : "danger"}>
                        {s.status === "Pagada" ? s.paymentMethod : "Anulada"}
                      </Badge>
                    </td>
                    <td className="tabular px-4 py-2 text-right text-[13px] font-semibold text-slate-900">
                      {money(s.total)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        size="sm"
                        icon={<Eye size={13} />}
                        onClick={() => setReceipt(s)}
                      >
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.listado.length === 0 && (
              <p className="px-4 py-8 text-center text-[13px] text-slate-500">
                Este día no tuvo ventas registradas.
              </p>
            )}
          </div>
        </div>
      </Modal>

      <ReceiptModal sale={receipt} onClose={() => setReceipt(null)} />
    </>
  );
}

function Tile({
  label,
  value,
  strong,
  muted,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
  tone?: "rose";
}) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <p className="text-[12px] text-slate-500">{label}</p>
      <p
        className={[
          "tabular mt-1 font-semibold tracking-tight",
          strong ? "text-[20px]" : "text-[17px]",
          tone === "rose"
            ? "text-rose-700"
            : muted
              ? "text-slate-500"
              : "text-slate-900",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <p className="mb-3 flex items-center gap-2 text-[13.5px] font-semibold text-slate-900">
        <span className="text-slate-400">{icon}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

const Vacio = ({ texto }: { texto: string }) => (
  <p className="py-6 text-center text-[13px] text-slate-500">{texto}</p>
);
