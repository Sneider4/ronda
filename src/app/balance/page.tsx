"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Coins,
  HandCoins,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useDemo } from "@/store/demo-store";
import {
  availableMonths,
  expensesByCategory,
  expensesOfMonth,
  isOwnerDraw,
  monthBalance,
  operating,
  paymentBreakdown,
  salesOfMonth,
  sumAmount,
} from "@/services/analytics";
import { money, percent, shortDate, weekdayShort } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { BarSeries } from "@/components/charts/BarSeries";
import { RankList } from "@/components/charts/RankList";
import { SplitBar } from "@/components/charts/SplitBar";

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export default function BalancePage() {
  const { sales, expenses } = useDemo();
  const months = useMemo(() => availableMonths(sales), [sales]);

  const [monthKey, setMonthKey] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}`;
  });

  const [year, month] = monthKey.split("-").map(Number);
  const ref = new Date(year, month, 1);
  const prevRef = new Date(year, month - 1, 1);

  const balance = useMemo(
    () => monthBalance(sales, expenses, ref),
    [sales, expenses, ref],
  );

  const enCursoRef =
    new Date().getFullYear() === year && new Date().getMonth() === month;

  // Un mes a medias solo se puede comparar con los mismos días del mes anterior
  const prev = useMemo(
    () =>
      monthBalance(
        sales,
        expenses,
        prevRef,
        enCursoRef ? balance.diasTranscurridos : undefined,
      ),
    [sales, expenses, prevRef, enCursoRef, balance.diasTranscurridos],
  );

  const monthExpenses = expensesOfMonth(expenses, ref);
  const porCategoria = expensesByCategory(operating(monthExpenses));
  const retiros = monthExpenses.filter(isOwnerDraw);
  const pagos = paymentBreakdown(salesOfMonth(sales, ref));

  const enCurso = enCursoRef;
  const comparativo = enCurso
    ? `mismos ${balance.diasTranscurridos} días de ${MONTHS[prevRef.getMonth()]}`
    : MONTHS[prevRef.getMonth()];

  const delta = (actual: number, anterior: number) =>
    anterior > 0 ? ((actual - anterior) / anterior) * 100 : null;

  const deltaVentas = delta(balance.ventaNegocio, prev.ventaNegocio);
  const deltaGastos = delta(balance.gastos, prev.gastos);
  const deltaNeto = delta(balance.neto, prev.neto);

  return (
    <div className="space-y-5">
      {/* Encabezado + selector de mes */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">
            {enCurso ? "Así va el mes" : "Resumen del mes"}
          </h2>
          <p className="text-[13px] text-slate-500">
            {MONTHS[month]} de {year}
            {enCurso
              ? ` · ${balance.diasTranscurridos} de ${balance.diasDelMes} días`
              : " · mes cerrado"}
          </p>
        </div>
        <Select
          className="w-56"
          value={monthKey}
          onChange={(e) => setMonthKey(e.target.value)}
        >
          {months.map((m) => (
            <option
              key={`${m.getFullYear()}-${m.getMonth()}`}
              value={`${m.getFullYear()}-${m.getMonth()}`}
            >
              {MONTHS[m.getMonth()]} de {m.getFullYear()}
            </option>
          ))}
        </Select>
      </div>

      {/* Entró · Salió · Quedó */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BigNumber
          label="Entró por ventas"
          value={money(balance.ventaNegocio)}
          hint={`${balance.ventasCount} ventas · vs. ${comparativo}`}
          delta={deltaVentas}
          positiveIsGood
          icon={<ArrowUpRight size={20} />}
          tone="emerald"
        />
        <BigNumber
          label="Salió en gastos"
          value={money(balance.gastos)}
          hint={`${operating(monthExpenses).length} salidas · vs. ${comparativo}`}
          delta={deltaGastos}
          positiveIsGood={false}
          icon={<ArrowDownRight size={20} />}
          tone="rose"
        />
        <div className="card grain relative overflow-hidden border-0 bg-ink-950 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12.5px] font-medium text-white/50">
                Le quedó al negocio
              </p>
              <p className="tabular mt-2 text-[32px] leading-none font-bold tracking-tight text-white">
                {money(balance.neto)}
              </p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-400/15 text-brand-300">
              <PiggyBank size={20} />
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {deltaNeto !== null && (
              <span
                className={[
                  "tabular inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                  deltaNeto >= 0
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-rose-400/15 text-rose-300",
                ].join(" ")}
              >
                {deltaNeto >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {deltaNeto >= 0 ? "+" : ""}
                {deltaNeto.toFixed(1).replace(".", ",")} % vs. {comparativo}
              </span>
            )}
            <span className="text-[12px] text-white/45">
              margen {percent(balance.margen)}
            </span>
          </div>
          {enCurso && (
            <p className="mt-3 rounded-lg bg-white/[0.07] px-3 py-2 text-[12.5px] text-white/70">
              Si el mes sigue así, cierra con{" "}
              <span className="tabular font-semibold text-white">
                {money(balance.proyeccion)}
              </span>
            </p>
          )}
        </div>
      </section>

      {/* Detalle de entradas y salidas */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader
            title="Lo que entró"
            subtitle="Detalle de las ventas del mes"
            icon={<Coins size={17} />}
          />
          <ul className="space-y-2.5">
            <LineItem label="Ventas del mes (con propina)" value={money(balance.ventaBruta)} />
            <LineItem
              label="Propinas del equipo"
              value={`-${money(balance.propinas)}`}
              muted
              note="Se reparten entre meseros"
            />
            <LineItem
              label="Descuentos dados"
              value={`-${money(balance.descuentos)}`}
              muted
            />
            <li className="flex items-baseline justify-between border-t border-slate-200 pt-3">
              <span className="text-[13.5px] font-semibold text-slate-900">
                Venta del negocio
              </span>
              <span className="tabular text-[17px] font-bold text-slate-900">
                {money(balance.ventaNegocio)}
              </span>
            </li>
          </ul>

          <div className="mt-5">
            <p className="mb-3 text-[12.5px] font-medium text-slate-600">
              Cómo pagaron los clientes
            </p>
            <SplitBar
              segments={pagos.map((p) => ({
                id: p.method,
                label: p.method,
                value: p.total,
                display: money(p.total),
                caption: `${p.share.toFixed(0)} %`,
              }))}
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Lo que salió"
            subtitle="Gastos del mes por categoría"
            icon={<HandCoins size={17} />}
            action={
              <Link
                href="/gastos"
                className="text-[13px] font-semibold text-brand-700 hover:text-brand-800"
              >
                Ver gastos
              </Link>
            }
          />
          {porCategoria.length ? (
            <RankList
              showRank={false}
              color="var(--viz-2)"
              rows={porCategoria.map((c) => ({
                id: c.id,
                label: c.name,
                emoji: c.emoji,
                value: c.total,
                display: money(c.total),
                caption: `${c.share.toFixed(0)} %`,
              }))}
            />
          ) : (
            <p className="py-6 text-center text-[13px] text-slate-500">
              No hay gastos registrados este mes.
            </p>
          )}
          <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
            <LineItem label="Total de gastos" value={money(balance.gastos)} />
            <LineItem
              label="Retiros de la propietaria"
              value={money(sumAmount(retiros))}
              muted
              note="Aparte: no es gasto del bar"
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Lo que quedó cada día"
            subtitle="Ventas menos gastos, día por día"
            icon={<Wallet size={17} />}
          />
          <BarSeries
            points={balance.dias.map((d) => ({
              label: String(d.date.getDate()),
              value: Math.max(d.neto, 0),
              caption: `${weekdayShort(d.date)} ${d.date.getDate()} · ${d.ventasCount} ventas`,
            }))}
            valueFormat={money}
            height={230}
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-100 ring-inset">
              <p className="text-[11.5px] text-slate-500">Mejor día del mes</p>
              <p className="tabular text-[15px] font-semibold text-slate-900">
                {money(
                  balance.dias.reduce((m, d) => Math.max(m, d.neto), 0),
                )}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-100 ring-inset">
              <p className="text-[11.5px] text-slate-500">Promedio por día</p>
              <p className="tabular text-[15px] font-semibold text-slate-900">
                {money(
                  balance.diasTranscurridos
                    ? Math.round(balance.neto / balance.diasTranscurridos)
                    : 0,
                )}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* El cuaderno: día por día */}
      <Card padded={false}>
        <div className="p-5">
          <CardHeader
            title="Día por día"
            subtitle="El mismo cuaderno de siempre, pero cuadrado solo"
            icon={<BookOpen size={17} />}
            className="mb-0"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
                <th className="px-5 py-3">Día</th>
                <th className="px-5 py-3 text-center">Ventas</th>
                <th className="px-5 py-3 text-right">Entró</th>
                <th className="px-5 py-3 text-right">Propinas</th>
                <th className="px-5 py-3 text-right">Salió</th>
                <th className="px-5 py-3 text-right">Quedó</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...balance.dias].reverse().map((d) => (
                <tr
                  key={d.date.toISOString()}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-5 py-2.5">
                    <span className="text-[13.5px] font-medium text-slate-900">
                      {weekdayShort(d.date)} {d.date.getDate()}
                    </span>
                    <span className="tabular ml-2 text-[12px] text-slate-400">
                      {shortDate(d.date)}
                    </span>
                  </td>
                  <td className="tabular px-5 py-2.5 text-center text-[13px] text-slate-600">
                    {d.ventasCount}
                  </td>
                  <td className="tabular px-5 py-2.5 text-right text-[13.5px] text-slate-900">
                    {money(d.ventas)}
                  </td>
                  <td className="tabular px-5 py-2.5 text-right text-[13px] text-slate-500">
                    {d.propinas ? money(d.propinas) : "—"}
                  </td>
                  <td className="tabular px-5 py-2.5 text-right text-[13.5px] text-rose-700">
                    {d.gastos ? `-${money(d.gastos)}` : "—"}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <span
                      className={[
                        "tabular text-[13.5px] font-semibold",
                        d.neto >= 0 ? "text-slate-900" : "text-rose-700",
                      ].join(" ")}
                    >
                      {money(d.neto)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50/80 text-[13.5px] font-semibold text-slate-900">
                <td className="px-5 py-3">Total de {MONTHS[month]}</td>
                <td className="tabular px-5 py-3 text-center">
                  {balance.ventasCount}
                </td>
                <td className="tabular px-5 py-3 text-right">
                  {money(balance.ventaBruta)}
                </td>
                <td className="tabular px-5 py-3 text-right text-slate-500">
                  {money(balance.propinas)}
                </td>
                <td className="tabular px-5 py-3 text-right text-rose-700">
                  -{money(balance.gastos)}
                </td>
                <td className="tabular px-5 py-3 text-right">
                  {money(balance.neto)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
          <Badge tone="success" dot>
            Entró {money(balance.ventaNegocio)}
          </Badge>
          <Badge tone="danger" dot>
            Salió {money(balance.gastos)}
          </Badge>
          <Badge tone="brand" dot>
            Quedó {money(balance.neto)}
          </Badge>
          <span className="text-[12.5px] text-slate-500">
            Las propinas ({money(balance.propinas)}) no entran en esta cuenta:
            son del equipo.
          </span>
        </div>
      </Card>
    </div>
  );
}

function BigNumber({
  label,
  value,
  hint,
  delta,
  positiveIsGood,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  delta: number | null;
  positiveIsGood: boolean;
  icon: React.ReactNode;
  tone: "emerald" | "rose";
}) {
  const good = delta === null ? true : positiveIsGood ? delta >= 0 : delta <= 0;
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12.5px] font-medium text-slate-500">{label}</p>
          <p className="tabular mt-2 text-[32px] leading-none font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset ${
            tone === "emerald"
              ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
              : "bg-rose-50 text-rose-700 ring-rose-100"
          }`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {delta !== null && (
          <span
            className={[
              "tabular inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              good ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
            ].join(" ")}
          >
            {delta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(1).replace(".", ",")} %
          </span>
        )}
        <span className="text-[12px] text-slate-500">{hint}</span>
      </div>
    </article>
  );
}

function LineItem({
  label,
  value,
  muted,
  note,
}: {
  label: string;
  value: string;
  muted?: boolean;
  note?: string;
}) {
  return (
    <li className="flex items-start justify-between gap-3">
      <span>
        <span
          className={`text-[13px] ${muted ? "text-slate-500" : "text-slate-700"}`}
        >
          {label}
        </span>
        {note && <span className="block text-[11.5px] text-slate-400">{note}</span>}
      </span>
      <span
        className={`tabular text-[13.5px] font-semibold ${
          muted ? "text-slate-500" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </li>
  );
}
