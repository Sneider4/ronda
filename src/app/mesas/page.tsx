"use client";

import { useMemo, useState } from "react";
import { LayoutGrid } from "lucide-react";
import type { Sale, TableStatus } from "@/types";
import { useDemo } from "@/store/demo-store";
import { money } from "@/lib/format";
import { tableStatusConfig } from "@/lib/table-status";
import { openAmount, tableTotal } from "@/services/analytics";
import { Segmented } from "@/components/ui/Field";
import { TableCard } from "@/components/mesas/TableCard";
import { TableAccountModal } from "@/components/mesas/TableAccountModal";
import { ProductPicker } from "@/components/mesas/ProductPicker";
import { PaymentModal } from "@/components/mesas/PaymentModal";
import { ReceiptModal } from "@/components/ventas/ReceiptModal";

type Filter = "todas" | TableStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "ocupada", label: "Ocupadas" },
  { value: "por-pagar", label: "Por pagar" },
  { value: "disponible", label: "Disponibles" },
  { value: "reservada", label: "Reservadas" },
];

export default function MesasPage() {
  const { tables } = useDemo();
  const [filter, setFilter] = useState<Filter>("todas");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receipt, setReceipt] = useState<Sale | null>(null);

  const selected = tables.find((t) => t.id === selectedId) ?? null;

  const counts = useMemo(
    () => ({
      disponible: tables.filter((t) => t.status === "disponible").length,
      ocupada: tables.filter((t) => t.status === "ocupada").length,
      "por-pagar": tables.filter((t) => t.status === "por-pagar").length,
      reservada: tables.filter((t) => t.status === "reservada").length,
    }),
    [tables],
  );

  const visible = tables.filter((t) => filter === "todas" || t.status === filter);
  const pending = openAmount(tables);

  return (
    <div className="space-y-5">
      {/* Resumen del salón */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {(Object.keys(counts) as TableStatus[]).map((status) => {
          const cfg = tableStatusConfig[status];
          return (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? "todas" : status)}
              className={[
                "card flex items-center gap-3 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                filter === status ? "ring-2 ring-slate-900" : "",
              ].join(" ")}
            >
              <span className={`h-9 w-1.5 rounded-full ${cfg.dot}`} />
              <div>
                <p className="tabular text-2xl leading-none font-semibold text-slate-900">
                  {counts[status]}
                </p>
                <p className="mt-1 text-[12.5px] text-slate-500">{cfg.label}</p>
              </div>
            </button>
          );
        })}

        <div className="card col-span-2 flex items-center justify-between gap-3 bg-ink-950 p-4 lg:col-span-1">
          <div>
            <p className="text-[11.5px] font-medium tracking-wide text-white/45 uppercase">
              Consumo en curso
            </p>
            <p className="tabular mt-1 text-2xl leading-none font-semibold text-white">
              {money(pending)}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-400">
            <LayoutGrid size={18} />
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({
            value: f.value,
            label:
              f.value === "todas" ? (
                f.label
              ) : (
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${tableStatusConfig[f.value].dot}`}
                  />
                  {f.label}
                </span>
              ),
          }))}
        />
        <p className="text-[12.5px] text-slate-500">
          Toque una mesa para ver su cuenta, agregar productos o cobrar.
        </p>
      </div>

      {/* Mesas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visible.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onClick={() => setSelectedId(table.id)}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-12 text-center text-sm text-slate-500">
          No hay mesas en este estado.
        </p>
      )}

      {/* Mesas por pagar — recordatorio para caja */}
      {counts["por-pagar"] > 0 && (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-sky-200 bg-sky-50/70 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-lg">
              💳
            </span>
            <div>
              <p className="text-[14px] font-semibold text-sky-900">
                {counts["por-pagar"]} mesas pidieron la cuenta
              </p>
              <p className="text-[12.5px] text-sky-700">
                Suman{" "}
                {money(
                  tables
                    .filter((t) => t.status === "por-pagar")
                    .reduce((s, t) => s + tableTotal(t), 0),
                )}{" "}
                pendientes por cobrar.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilter("por-pagar")}
            className="text-[13px] font-semibold text-sky-800 underline underline-offset-4 hover:text-sky-900"
          >
            Ver mesas por pagar
          </button>
        </div>
      )}

      {/* Flujo: cuenta → productos → pago → comprobante */}
      <TableAccountModal
        table={pickerOpen || paymentOpen ? null : selected}
        onClose={() => setSelectedId(null)}
        onAddProducts={() => setPickerOpen(true)}
        onCharge={() => setPaymentOpen(true)}
      />

      <ProductPicker
        open={pickerOpen}
        tableId={selectedId}
        onClose={() => setPickerOpen(false)}
      />

      <PaymentModal
        table={selected}
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onPaid={(sale) => {
          setPaymentOpen(false);
          setSelectedId(null);
          setReceipt(sale);
        }}
      />

      <ReceiptModal sale={receipt} celebrate onClose={() => setReceipt(null)} />
    </div>
  );
}
