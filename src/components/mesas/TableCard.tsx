"use client";

import { ArrowRight, CalendarClock, Clock3, Plus, User } from "lucide-react";
import type { BarTable } from "@/types";
import { employeeById } from "@/data/employees";
import { money } from "@/lib/format";
import { tableStatusConfig } from "@/lib/table-status";
import { tableTotal } from "@/services/analytics";
import { Badge } from "@/components/ui/Badge";
import { LiveElapsed } from "@/components/ui/LiveElapsed";

export function TableCard({
  table,
  onClick,
}: {
  table: BarTable;
  onClick: () => void;
}) {
  const cfg = tableStatusConfig[table.status];
  const total = tableTotal(table);
  const items = table.items.reduce((s, i) => s + i.qty, 0);
  const waiter = table.waiterId ? employeeById(table.waiterId) : null;

  return (
    <button
      onClick={onClick}
      className={[
        "group flex w-full flex-col rounded-2xl p-4 text-left ring-1 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        cfg.card,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={[
              "tabular flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm",
              table.status === "disponible"
                ? "bg-slate-300"
                : table.status === "ocupada"
                  ? "bg-amber-500"
                  : table.status === "por-pagar"
                    ? "bg-sky-600"
                    : "bg-violet-500",
            ].join(" ")}
          >
            {table.number}
          </span>
          <div>
            <p className="text-[15px] leading-tight font-semibold text-slate-900">
              Mesa {table.number}
            </p>
            <p className="text-[12px] text-slate-500">
              {table.zone} · {table.seats} puestos
            </p>
          </div>
        </div>
        <Badge tone={cfg.tone} dot>
          {cfg.label}
        </Badge>
      </div>

      <div className="my-3 border-t border-dashed border-slate-200" />

      {table.status === "disponible" && (
        <div className="flex flex-1 items-center justify-between">
          <p className="text-[13px] text-slate-500">Lista para recibir clientes</p>
          <span className="flex items-center gap-1 text-[13px] font-semibold text-slate-400 transition-colors group-hover:text-brand-700">
            <Plus size={15} /> Abrir
          </span>
        </div>
      )}

      {table.status === "reservada" && (
        <div className="flex flex-1 flex-col justify-between gap-2">
          <p className="truncate text-[13px] font-medium text-slate-700">
            {table.reservationName}
          </p>
          <p className="flex items-center gap-1.5 text-[12.5px] text-violet-700">
            <CalendarClock size={14} /> Llega a las {table.reservationTime}
          </p>
        </div>
      )}

      {(table.status === "ocupada" || table.status === "por-pagar") && (
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="flex items-center justify-between text-[12.5px] text-slate-600">
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-slate-400" />
              {waiter ? waiter.name.split(" ")[0] : "Sin asignar"}
            </span>
            <span className="tabular flex items-center gap-1.5">
              <Clock3 size={13} className="text-slate-400" />
              {table.openedAt && <LiveElapsed since={table.openedAt} />}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11.5px] text-slate-500">
                {items} {items === 1 ? "producto" : "productos"}
              </p>
              <p className="tabular text-lg leading-tight font-semibold text-slate-900">
                {money(total)}
              </p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 text-slate-400 ring-1 ring-slate-200 transition-all group-hover:bg-ink-900 group-hover:text-white group-hover:ring-ink-900">
              <ArrowRight size={15} />
            </span>
          </div>
        </div>
      )}
    </button>
  );
}
