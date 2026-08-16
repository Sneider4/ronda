"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Boxes,
  Clock3,
  CreditCard,
  DollarSign,
  HandCoins,
  Package,
  ReceiptText,
  Table2,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import type { Sale } from "@/types";
import { useDemo } from "@/store/demo-store";
import {
  bestHour,
  byHour,
  expensesOfDay,
  lastDays,
  lowStock,
  monthBalance,
  openAmount,
  openTables,
  paymentBreakdown,
  salesOfDay,
  salesOfMonth,
  sumAmount,
  tableTotal,
  topProducts,
  totals,
} from "@/services/analytics";
import {
  dayLabel,
  hourLabel,
  hourLabelShort,
  money,
  number as fmtNumber,
  timeOfDay,
  weekdayShort,
} from "@/lib/format";
import { employeeById } from "@/data/employees";
import { tableStatusConfig } from "@/lib/table-status";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AreaTrend } from "@/components/charts/AreaTrend";
import { BarSeries } from "@/components/charts/BarSeries";
import { RankList } from "@/components/charts/RankList";
import { SplitBar } from "@/components/charts/SplitBar";
import { ReceiptModal } from "@/components/ventas/ReceiptModal";

export default function DashboardPage() {
  const { sales, tables, products, expenses } = useDemo();
  const [receipt, setReceipt] = useState<Sale | null>(null);

  const today = useMemo(() => new Date(), []);
  const yesterdayRef = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 7);
    return d;
  }, [today]);

  const todaySales = salesOfDay(sales, today);
  const todayTotals = totals(todaySales);
  const lastWeekTotals = totals(salesOfDay(sales, yesterdayRef));
  const monthTotals = totals(salesOfMonth(sales, today));

  const delta =
    lastWeekTotals.total > 0
      ? ((todayTotals.total - lastWeekTotals.total) / lastWeekTotals.total) * 100
      : 0;

  const week = lastDays(sales, 7);
  const hours = byHour(todaySales);
  const peak = bestHour(todaySales);
  const top = topProducts(todaySales, 5);
  const payments = paymentBreakdown(todaySales);
  const alerts = lowStock(products);
  const open = openTables(tables);
  const recent = [...todaySales]
    .sort((a, b) => +new Date(b.dateISO) - +new Date(a.dateISO))
    .slice(0, 6);

  const balance = useMemo(
    () => monthBalance(sales, expenses, today),
    [sales, expenses, today],
  );
  const gastosHoy = useMemo(
    () => sumAmount(expensesOfDay(expenses).filter((e) => e.status === "Pagado")),
    [expenses],
  );

  return (
    <div className="space-y-5">
      {/* Cifras del día */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Ventas de hoy"
          value={money(todayTotals.total)}
          icon={<DollarSign size={19} />}
          accent="brand"
          delta={delta}
          hint={`vs. ${weekdayShort(yesterdayRef).toLowerCase()} pasado`}
        />
        <StatCard
          label="Ventas del mes"
          value={money(monthTotals.total)}
          icon={<TrendingUp size={19} />}
          accent="emerald"
          hint={`Le quedan ${money(balance.neto)} después de gastos`}
        />
        <StatCard
          label="Mesas ocupadas"
          value={
            <span>
              {open.length}
              <span className="text-lg text-slate-400"> / {tables.length}</span>
            </span>
          }
          icon={<Table2 size={19} />}
          accent="sky"
          hint={`${tables.filter((t) => t.status === "por-pagar").length} pidieron la cuenta`}
        />
        <StatCard
          label="Cuentas abiertas"
          value={money(openAmount(tables))}
          icon={<ReceiptText size={19} />}
          accent="violet"
          hint={`${open.length} mesas con consumo`}
        />
        <StatCard
          label="Productos vendidos hoy"
          value={fmtNumber(todayTotals.units)}
          icon={<Package size={19} />}
          accent="slate"
          hint={`en ${todayTotals.count} ventas`}
        />
      </section>

      {/* Tendencia + métodos de pago */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Ventas de los últimos 7 días"
            subtitle="Total facturado por día"
            action={
              <Link
                href="/reportes"
                className="flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:text-brand-800"
              >
                Ver reportes <ArrowUpRight size={14} />
              </Link>
            }
          />
          <AreaTrend
            points={week.map((d) => ({
              label: dayLabel(d.date),
              value: d.total,
              caption: `${dayLabel(d.date)} · ${d.count} ventas`,
            }))}
            valueFormat={money}
          />
        </Card>

        <Card>
          <CardHeader
            title="Cómo pagaron hoy"
            subtitle="Reparto por método de pago"
            icon={<CreditCard size={17} />}
          />
          <SplitBar
            segments={payments.map((p) => ({
              id: p.method,
              label: p.method,
              value: p.total,
              display: money(p.total),
              caption: `${p.count} ventas`,
            }))}
          />
          <div className="mt-4 rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-100 ring-inset">
            <p className="text-[12.5px] text-slate-600">
              El efectivo representa{" "}
              <span className="font-semibold text-slate-900">
                {payments
                  .find((p) => p.method === "Efectivo")
                  ?.share.toFixed(0) ?? 0}
                %
              </span>{" "}
              de la venta del día: es lo que debe cuadrar en la caja al cierre.
            </p>
          </div>
        </Card>
      </section>

      {/* Productos, mesas y alertas */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader
            title="Lo más vendido hoy"
            subtitle="Ranking por unidades"
            icon={<Trophy size={17} />}
          />
          {top.length ? (
            <RankList
              rows={top.map((p) => ({
                id: p.productId,
                label: p.name,
                emoji: p.emoji,
                value: p.units,
                display: `${p.units} u.`,
                caption: money(p.revenue),
              }))}
            />
          ) : (
            <p className="py-6 text-center text-[13px] text-slate-500">
              Aún no hay ventas registradas hoy.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Estado del salón"
            subtitle={`${open.length} de ${tables.length} mesas con clientes`}
            icon={<Table2 size={17} />}
            action={
              <Link
                href="/mesas"
                className="text-[13px] font-semibold text-brand-700 hover:text-brand-800"
              >
                Ir a mesas
              </Link>
            }
          />
          <div className="grid grid-cols-4 gap-2">
            {tables.map((t) => {
              const cfg = tableStatusConfig[t.status];
              return (
                <Link
                  key={t.id}
                  href="/mesas"
                  className={`flex flex-col items-center justify-center rounded-xl py-3 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-sm ${cfg.card}`}
                >
                  <span className="tabular text-[15px] font-bold text-slate-900">
                    {t.number}
                  </span>
                  <span className={`mt-1 h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  <span className="tabular mt-1 text-[10.5px] text-slate-500">
                    {t.items.length ? money(tableTotal(t)) : "libre"}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(tableStatusConfig).map(([key, cfg]) => (
              <span
                key={key}
                className="flex items-center gap-1.5 text-[11.5px] text-slate-500"
              >
                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            ))}
          </div>
        </Card>

        <Card className="border-amber-200/80 bg-amber-50/40">
          <CardHeader
            title="Alertas de inventario"
            subtitle={`${alerts.length} productos necesitan atención`}
            icon={<AlertTriangle size={17} />}
            action={
              <Link
                href="/inventario"
                className="text-[13px] font-semibold text-brand-700 hover:text-brand-800"
              >
                Ver todo
              </Link>
            }
          />
          <ul className="space-y-2.5">
            {alerts.slice(0, 4).map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200/70"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-base">
                  {p.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-slate-900">
                    {p.name}
                  </p>
                  <p className="text-[12px] text-slate-500">
                    {p.stock === 0
                      ? "Sin existencias — no se puede vender"
                      : `Quedan ${p.stock} · mínimo ${p.minStock}`}
                  </p>
                </div>
                <Badge tone={p.stock === 0 ? "danger" : "warning"} dot>
                  {p.stock === 0 ? "Agotado" : "Stock bajo"}
                </Badge>
              </li>
            ))}
          </ul>
          {alerts.length === 0 && (
            <p className="py-6 text-center text-[13px] text-slate-500">
              Todo el inventario está por encima del mínimo.
            </p>
          )}
        </Card>
      </section>

      {/* Últimas ventas + horario */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" padded={false}>
          <div className="p-5">
            <CardHeader
              title="Últimas ventas"
              subtitle="Movimiento reciente del turno"
              icon={<ReceiptText size={17} />}
              className="mb-0"
              action={
                <Link
                  href="/ventas"
                  className="text-[13px] font-semibold text-brand-700 hover:text-brand-800"
                >
                  Ver historial
                </Link>
              }
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/60 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
                  <th className="px-5 py-2.5">Venta</th>
                  <th className="px-5 py-2.5">Mesa</th>
                  <th className="px-5 py-2.5">Atendió</th>
                  <th className="px-5 py-2.5">Hora</th>
                  <th className="px-5 py-2.5">Pago</th>
                  <th className="px-5 py-2.5 text-right">Total</th>
                  <th className="px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recent.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="tabular px-5 py-3 text-[13.5px] font-semibold text-slate-900">
                      #{s.number}
                    </td>
                    <td className="px-5 py-3 text-[13.5px] text-slate-600">
                      Mesa {s.tableNumber}
                    </td>
                    <td className="px-5 py-3 text-[13.5px] text-slate-600">
                      {employeeById(s.employeeId).name.split(" ")[0]}
                    </td>
                    <td className="tabular px-5 py-3 text-[13.5px] text-slate-500">
                      {timeOfDay(s.dateISO)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone="neutral">{s.paymentMethod}</Badge>
                    </td>
                    <td className="tabular px-5 py-3 text-right text-[13.5px] font-semibold text-slate-900">
                      {money(s.total)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" onClick={() => setReceipt(s)}>
                        Ver comprobante
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recent.length === 0 && (
              <p className="py-10 text-center text-[13px] text-slate-500">
                Todavía no se registran ventas hoy.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Horario de mayor movimiento"
            subtitle="Ventas de hoy por hora"
            icon={<Clock3 size={17} />}
          />
          <BarSeries
            points={hours.map((h) => ({
              label: hourLabelShort(h.hour),
              value: h.total,
              caption: `${hourLabel(h.hour)} · ${h.count} ventas`,
            }))}
            valueFormat={money}
            height={190}
          />
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50 p-3.5 ring-1 ring-brand-100 ring-inset">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg">
              🔥
            </span>
            <div>
              <p className="text-[12.5px] text-brand-900/70">
                Hora de mayor venta
              </p>
              <p className="text-[15px] font-bold text-brand-900">
                {hourLabel(peak.hour)} · {money(peak.total)}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Accesos rápidos */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <QuickLink
          href="/mesas"
          icon={<Table2 size={18} />}
          title="Abrir una mesa"
          description="Tomar un pedido"
        />
        <QuickLink
          href="/gastos"
          icon={<HandCoins size={18} />}
          title="Registrar un gasto"
          description={
            gastosHoy ? `Hoy: ${money(gastosHoy)}` : "Compras, servicios…"
          }
        />
        <QuickLink
          href="/balance"
          icon={<BookOpen size={18} />}
          title="Balance del mes"
          description={`Quedan ${money(balance.neto)}`}
        />
        <QuickLink
          href="/inventario"
          icon={<Boxes size={18} />}
          title="Revisar inventario"
          description={`${alerts.length} alertas activas`}
        />
        <QuickLink
          href="/caja"
          icon={<DollarSign size={18} />}
          title="Cerrar caja"
          description="Arqueo del turno"
        />
        <QuickLink
          href="/empleados"
          icon={<Users size={18} />}
          title="Equipo de trabajo"
          description="Turnos y permisos"
        />
      </section>

      <ReceiptModal sale={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="card group flex items-center gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-ink-900 group-hover:text-brand-400">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px] leading-tight font-semibold text-slate-900">
          {title}
        </span>
        <span className="mt-0.5 block text-[12px] leading-tight text-slate-500">
          {description}
        </span>
      </span>
    </Link>
  );
}
