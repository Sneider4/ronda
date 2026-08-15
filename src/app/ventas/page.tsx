"use client";

import { useMemo, useState } from "react";
import { Eye, Receipt, Search } from "lucide-react";
import type { PaymentMethod, Sale } from "@/types";
import { useDemo } from "@/store/demo-store";
import { employeeById } from "@/data/employees";
import { isSameDay, money, shortDate, timeOfDay } from "@/lib/format";
import { totals } from "@/services/analytics";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, SearchInput, Segmented, Select } from "@/components/ui/Field";
import { ReceiptModal } from "@/components/ventas/ReceiptModal";
import { paymentIcons } from "@/lib/table-status";

type Range = "hoy" | "7" | "mes" | "todo";

export default function VentasPage() {
  const { sales, tables } = useDemo();
  const [range, setRange] = useState<Range>("hoy");
  const [method, setMethod] = useState<PaymentMethod | "todos">("todos");
  const [table, setTable] = useState<string>("todas");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(25);
  const [receipt, setReceipt] = useState<Sale | null>(null);

  const filtered = useMemo(() => {
    const now = new Date();
    const from = new Date(now);
    if (range === "7") from.setDate(from.getDate() - 6);
    if (range === "mes") from.setDate(1);
    from.setHours(0, 0, 0, 0);

    const q = query.trim().replace("#", "");

    return sales
      .filter((s) => {
        const d = new Date(s.dateISO);
        const byRange =
          range === "todo" ||
          (range === "hoy" ? isSameDay(d, now) : d >= from && d <= now);
        const byMethod = method === "todos" || s.paymentMethod === method;
        const byTable = table === "todas" || String(s.tableNumber) === table;
        const byQuery = !q || String(s.number).includes(q);
        return byRange && byMethod && byTable && byQuery;
      })
      .sort((a, b) => +new Date(b.dateISO) - +new Date(a.dateISO));
  }, [sales, range, method, table, query]);

  const summary = totals(filtered);
  const anuladas = filtered.filter((s) => s.status === "Anulada").length;

  return (
    <div className="space-y-5">
      {/* Resumen del filtro */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryTile label="Ventas encontradas" value={String(summary.count)} />
        <SummaryTile label="Total facturado" value={money(summary.total)} strong />
        <SummaryTile label="Ticket promedio" value={money(summary.ticket)} />
        <SummaryTile
          label="Propinas"
          value={money(summary.tips)}
          hint={anuladas ? `${anuladas} ventas anuladas` : undefined}
        />
      </section>

      <Card padded={false}>
        <div className="flex flex-col gap-4 p-5">
          <CardHeader
            title="Historial de ventas"
            subtitle="Cada venta guarda su detalle y su comprobante"
            icon={<Receipt size={17} />}
            className="mb-0"
          />

          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <Segmented<Range>
              value={range}
              onChange={(v) => {
                setRange(v);
                setLimit(25);
              }}
              options={[
                { value: "hoy", label: "Hoy" },
                { value: "7", label: "Últimos 7 días" },
                { value: "mes", label: "Este mes" },
                { value: "todo", label: "Todo" },
              ]}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Método de pago">
                <Select
                  value={method}
                  onChange={(e) =>
                    setMethod(e.target.value as PaymentMethod | "todos")
                  }
                >
                  <option value="todos">Todos</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Nequi">Nequi</option>
                </Select>
              </Field>
              <Field label="Mesa">
                <Select value={table} onChange={(e) => setTable(e.target.value)}>
                  <option value="todas">Todas</option>
                  {tables.map((t) => (
                    <option key={t.id} value={String(t.number)}>
                      Mesa {t.number}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Número de venta">
                <SearchInput
                  icon={<Search size={15} />}
                  placeholder="Ej: 1048"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
                <th className="px-5 py-3">N.º de venta</th>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Mesa</th>
                <th className="px-5 py-3">Empleado</th>
                <th className="px-5 py-3">Método de pago</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.slice(0, limit).map((s) => (
                <tr
                  key={s.id}
                  className="cursor-pointer transition-colors hover:bg-slate-50/70"
                  onClick={() => setReceipt(s)}
                >
                  <td className="tabular px-5 py-3 text-[13.5px] font-semibold text-slate-900">
                    #{s.number}
                  </td>
                  <td className="px-5 py-3">
                    <p className="tabular text-[13.5px] text-slate-700">
                      {shortDate(s.dateISO)}
                    </p>
                    <p className="tabular text-[12px] text-slate-400">
                      {timeOfDay(s.dateISO)}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-[13.5px] text-slate-600">
                    Mesa {s.tableNumber}
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-6 w-6 rounded-full ${employeeById(s.employeeId).color} flex items-center justify-center text-[10px] font-bold text-white`}
                      >
                        {employeeById(s.employeeId)
                          .name.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <span className="text-[13.5px] text-slate-600">
                        {employeeById(s.employeeId).name}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone="neutral">
                      {paymentIcons[s.paymentMethod]} {s.paymentMethod}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={s.status === "Pagada" ? "success" : "danger"} dot>
                      {s.status}
                    </Badge>
                  </td>
                  <td className="tabular px-5 py-3 text-right text-[14px] font-semibold text-slate-900">
                    {money(s.total)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      size="sm"
                      icon={<Eye size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setReceipt(s);
                      }}
                    >
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-5">
              <EmptyState
                title="No hay ventas con estos filtros"
                description="Pruebe con otro rango de fechas o quite el filtro de mesa."
              />
            </div>
          )}
        </div>

        {filtered.length > limit && (
          <div className="border-t border-slate-100 p-4 text-center">
            <Button onClick={() => setLimit((n) => n + 25)}>
              Ver 25 ventas más ({filtered.length - limit} restantes)
            </Button>
          </div>
        )}
      </Card>

      <ReceiptModal sale={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}

function SummaryTile({
  label,
  value,
  hint,
  strong,
}: {
  label: string;
  value: string;
  hint?: string;
  strong?: boolean;
}) {
  return (
    <div className="card p-4">
      <p className="text-[12.5px] text-slate-500">{label}</p>
      <p
        className={`tabular mt-1.5 font-semibold tracking-tight text-slate-900 ${
          strong ? "text-2xl" : "text-xl"
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[12px] text-slate-400">{hint}</p>}
    </div>
  );
}
