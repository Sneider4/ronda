"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Clock3,
  CreditCard,
  Layers,
  Trophy,
} from "lucide-react";
import { useDemo } from "@/store/demo-store";
import {
  averageByWeekday,
  bestDay,
  bestHour,
  byCategory,
  byHour,
  lastDays,
  paymentBreakdown,
  topProducts,
  totals,
} from "@/services/analytics";
import {
  dayLabel,
  hourLabel,
  longDate,
  money,
  number as fmtNumber,
  weekdayDate,
} from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { Segmented } from "@/components/ui/Field";
import { AreaTrend } from "@/components/charts/AreaTrend";
import { BarSeries } from "@/components/charts/BarSeries";
import { RankList } from "@/components/charts/RankList";
import { SplitBar } from "@/components/charts/SplitBar";

type Range = "7" | "30";

export default function ReportesPage() {
  const { sales } = useDemo();
  const [range, setRange] = useState<Range>("7");
  const days = range === "7" ? 7 : 30;

  const series = useMemo(() => lastDays(sales, days), [sales, days]);

  const rangeSales = useMemo(() => {
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);
    return sales.filter((s) => new Date(s.dateISO) >= from);
  }, [sales, days]);

  const summary = totals(rangeSales);
  const top = topProducts(rangeSales, 8);
  const cats = byCategory(rangeSales);
  const payments = paymentBreakdown(rangeSales);
  const hours = byHour(rangeSales);
  const peak = bestHour(rangeSales);
  const best = bestDay(sales, days);
  const weekdays = averageByWeekday(sales, 28);
  const bestWeekday = weekdays.reduce((a, b) => (b.average > a.average ? b : a), weekdays[0]);

  return (
    <div className="space-y-5">
      {/* Rango */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">
            Cómo se está comportando el bar
          </h2>
          <p className="text-[13px] text-slate-500">
            Información de los últimos {days} días · {summary.count} ventas ·{" "}
            {money(summary.total)}
          </p>
        </div>
        <Segmented<Range>
          value={range}
          onChange={setRange}
          options={[
            { value: "7", label: "Últimos 7 días" },
            { value: "30", label: "Últimos 30 días" },
          ]}
        />
      </div>

      {/* Titulares */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Highlight
          icon={<Trophy size={18} />}
          label="Producto más vendido"
          value={top[0]?.name ?? "—"}
          detail={
            top[0]
              ? `${fmtNumber(top[0].units)} unidades · ${money(top[0].revenue)}`
              : ""
          }
          emoji={top[0]?.emoji}
          accent="from-brand-300 to-brand-500"
        />
        <Highlight
          icon={<Clock3 size={18} />}
          label="Hora de mayor venta"
          value={hourLabel(peak.hour)}
          detail={`${money(peak.total)} en ${peak.count} ventas`}
          emoji="🔥"
          accent="from-rose-300 to-rose-500"
        />
        <Highlight
          icon={<CalendarDays size={18} />}
          label="Día con mayores ventas"
          value={dayLabel(best.date)}
          detail={`${money(best.total)} · ${longDate(best.date)}`}
          emoji="📈"
          accent="from-sky-300 to-sky-500"
        />
        <Highlight
          icon={<Layers size={18} />}
          label="Categoría líder"
          value={cats[0]?.name ?? "—"}
          detail={
            cats[0]
              ? `${cats[0].share.toFixed(0)} % de la venta · ${money(cats[0].total)}`
              : ""
          }
          emoji={cats[0]?.emoji}
          accent="from-emerald-300 to-emerald-500"
        />
      </section>

      {/* Ventas por día */}
      <Card>
        <CardHeader
          title="Ventas por día"
          subtitle={`Evolución de los últimos ${days} días`}
          icon={<BarChart3 size={17} />}
          action={
            <div className="text-right">
              <p className="text-[11.5px] text-slate-500">Promedio diario</p>
              <p className="tabular text-[15px] font-semibold text-slate-900">
                {money(Math.round(summary.total / days))}
              </p>
            </div>
          }
        />
        <AreaTrend
          points={series.map((d) => ({
            label: days > 14 ? String(d.date.getDate()) : dayLabel(d.date),
            value: d.total,
            caption: `${weekdayDate(d.date)} · ${d.count} ventas`,
          }))}
          valueFormat={money}
          height={260}
        />
      </Card>

      {/* Productos y categorías */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Productos más vendidos"
            subtitle="Ranking por unidades vendidas en el periodo"
            icon={<Trophy size={17} />}
          />
          <RankList
            rows={top.map((p) => ({
              id: p.productId,
              label: p.name,
              emoji: p.emoji,
              value: p.units,
              display: `${fmtNumber(p.units)} u.`,
              caption: money(p.revenue),
            }))}
          />
        </Card>

        <Card>
          <CardHeader
            title="Ventas por categoría"
            subtitle="De dónde viene la plata"
            icon={<Layers size={17} />}
          />
          <RankList
            showRank={false}
            color="var(--viz-1)"
            rows={cats.map((c) => ({
              id: c.id,
              label: c.name,
              emoji: c.emoji,
              value: c.total,
              display: money(c.total),
              caption: `${c.share.toFixed(0)} %`,
            }))}
          />
          <div className="mt-5 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100 ring-inset">
            <div className="tabular flex items-center justify-between">
              <span className="text-[13px] text-slate-600">Total del periodo</span>
              <span className="text-[15px] font-semibold text-slate-900">
                {money(summary.total)}
              </span>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">
              {cats[0] &&
                `El ${cats[0].share.toFixed(0)} % de la venta sale de ${cats[0].name.toLowerCase()}: es la categoría que nunca debería faltar en la nevera.`}
            </p>
          </div>
        </Card>
      </section>

      {/* Horas, días y pagos */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Horario de mayor movimiento"
            subtitle="Ventas acumuladas por hora del día"
            icon={<Clock3 size={17} />}
          />
          <BarSeries
            points={hours.map((h) => ({
              label: hourLabel(h.hour).replace(" ", ""),
              value: h.total,
              caption: `${hourLabel(h.hour)} · ${h.count} ventas`,
            }))}
            valueFormat={money}
            height={230}
          />
          <p className="mt-4 rounded-xl bg-slate-50 p-3.5 text-[12.5px] text-slate-600 ring-1 ring-slate-100 ring-inset">
            Entre {hourLabel(peak.hour)} y {hourLabel(peak.hour + 1)} se concentra
            la mayor parte de la venta: es la hora con más personal y más
            producto en barra.
          </p>
        </Card>

        <Card>
          <CardHeader
            title="Métodos de pago"
            subtitle="Cómo paga la clientela"
            icon={<CreditCard size={17} />}
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
      </section>

      {/* Días de la semana */}
      <Card>
        <CardHeader
          title="Promedio por día de la semana"
          subtitle="Últimas 4 semanas — sirve para programar turnos y compras"
          icon={<CalendarDays size={17} />}
          action={
            <div className="text-right">
              <p className="text-[11.5px] text-slate-500">Mejor día</p>
              <p className="text-[15px] font-semibold text-slate-900">
                {bestWeekday.name}
              </p>
            </div>
          }
        />
        <BarSeries
          points={weekdays.map((w) => ({
            label: w.name.slice(0, 3),
            value: w.average,
            caption: `${w.name} · promedio`,
          }))}
          valueFormat={money}
          height={210}
        />
      </Card>
    </div>
  );
}

function Highlight({
  icon,
  label,
  value,
  detail,
  emoji,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  emoji?: string;
  accent: string;
}) {
  return (
    <article className="card relative overflow-hidden p-5">
      <div
        className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br opacity-15 ${accent}`}
      />
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <p className="text-[12.5px] font-medium">{label}</p>
      </div>
      <div className="mt-3 flex items-center gap-2.5">
        {emoji && <span className="text-2xl">{emoji}</span>}
        <p className="truncate text-[19px] leading-tight font-semibold tracking-tight text-slate-900">
          {value}
        </p>
      </div>
      <p className="tabular mt-1.5 text-[12.5px] text-slate-500">{detail}</p>
    </article>
  );
}
