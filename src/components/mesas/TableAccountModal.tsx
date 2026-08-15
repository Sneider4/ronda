"use client";

import {
  BellRing,
  CalendarClock,
  Clock3,
  Minus,
  Plus,
  Trash2,
  User,
  Utensils,
  Wallet,
} from "lucide-react";
import type { BarTable } from "@/types";
import { employeeById, waiters } from "@/data/employees";
import { money, timeOfDay } from "@/lib/format";
import { tableStatusConfig } from "@/lib/table-status";
import { tableTotal } from "@/services/analytics";
import { useDemo } from "@/store/demo-store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Field";
import { LiveElapsed } from "@/components/ui/LiveElapsed";
import { EmptyState } from "@/components/ui/Card";

export function TableAccountModal({
  table,
  onClose,
  onAddProducts,
  onCharge,
}: {
  table: BarTable | null;
  onClose: () => void;
  onAddProducts: () => void;
  onCharge: () => void;
}) {
  const { setItemQty, removeItem, assignWaiter, releaseTable, setTableStatus, toast } =
    useDemo();

  if (!table) return null;

  const cfg = tableStatusConfig[table.status];
  const total = tableTotal(table);
  const units = table.items.reduce((s, i) => s + i.qty, 0);
  const waiter = table.waiterId ? employeeById(table.waiterId) : null;
  const hasAccount = table.items.length > 0;

  return (
    <Modal
      open={!!table}
      onClose={onClose}
      size="lg"
      title={
        <span className="flex items-center gap-2.5">
          Mesa {table.number}
          <Badge tone={cfg.tone} dot>
            {cfg.label}
          </Badge>
        </span>
      }
      subtitle={
        table.openedAt
          ? `${table.zone} · ${table.seats} puestos · abierta desde las ${timeOfDay(table.openedAt)}`
          : `${table.zone} · ${table.seats} puestos`
      }
      icon={<Utensils size={18} />}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {hasAccount && table.status !== "por-pagar" && (
              <Button
                variant="secondary"
                icon={<BellRing size={15} />}
                onClick={() => {
                  setTableStatus(table.id, "por-pagar");
                  toast({
                    title: `Mesa ${table.number} marcada por pagar`,
                    description: "El equipo de caja ya la ve en la lista.",
                    variant: "info",
                  });
                }}
              >
                Pidió la cuenta
              </Button>
            )}
            {!hasAccount && table.status !== "disponible" && (
              <Button
                variant="ghost"
                onClick={() => {
                  releaseTable(table.id);
                  onClose();
                  toast({
                    title: `Mesa ${table.number} liberada`,
                    variant: "info",
                  });
                }}
              >
                Liberar mesa
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              size="lg"
              icon={<Plus size={17} />}
              onClick={onAddProducts}
            >
              Agregar producto
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={<Wallet size={17} />}
              disabled={!hasAccount}
              onClick={onCharge}
            >
              Cerrar cuenta · {money(total)}
            </Button>
          </div>
        </div>
      }
    >
      {/* Resumen superior */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTile
          icon={<Clock3 size={15} />}
          label="Tiempo en mesa"
          value={table.openedAt ? <LiveElapsed since={table.openedAt} /> : "—"}
        />
        <InfoTile
          icon={<User size={15} />}
          label="Atiende"
          value={
            <Select
              className="mt-0.5 h-8 border-0 bg-transparent px-0 text-[13.5px] font-semibold shadow-none focus:ring-0"
              value={table.waiterId ?? ""}
              onChange={(e) => assignWaiter(table.id, e.target.value)}
            >
              <option value="" disabled>
                Sin asignar
              </option>
              {waiters.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name.split(" ")[0]} {w.name.split(" ")[1]?.[0] ?? ""}.
                </option>
              ))}
            </Select>
          }
        />
        <InfoTile
          icon={<Utensils size={15} />}
          label="Productos"
          value={`${units} ${units === 1 ? "unidad" : "unidades"}`}
        />
        <InfoTile
          icon={<Wallet size={15} />}
          label="Consumo"
          value={money(total)}
          strong
        />
      </div>

      {table.status === "reservada" && (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-violet-50 p-4 ring-1 ring-violet-100 ring-inset">
          <CalendarClock size={18} className="mt-0.5 text-violet-600" />
          <div>
            <p className="text-[13.5px] font-semibold text-violet-900">
              Reserva a nombre de {table.reservationName}
            </p>
            <p className="text-[12.5px] text-violet-700">
              Llegada prevista: {table.reservationTime}
            </p>
          </div>
        </div>
      )}

      {/* Detalle de consumo */}
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-slate-900">
            Detalle del consumo
          </h3>
          {waiter && (
            <span className="text-[12.5px] text-slate-500">
              Registrado por {waiter.name}
            </span>
          )}
        </div>

        {!hasAccount ? (
          <EmptyState
            title="La cuenta está vacía"
            description="Agregue el primer producto para abrir la cuenta de esta mesa."
            action={
              <Button variant="primary" icon={<Plus size={16} />} onClick={onAddProducts}>
                Agregar producto
              </Button>
            }
          />
        ) : (
          <>
            {/* Encabezado sólo en pantallas medianas hacia arriba */}
            <div className="hidden grid-cols-12 gap-2 border-b border-slate-200 pb-2 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase sm:grid">
              <span className="col-span-5">Producto</span>
              <span className="col-span-3 text-center">Cantidad</span>
              <span className="col-span-2 text-right">Precio</span>
              <span className="col-span-2 text-right">Subtotal</span>
            </div>

            <ul className="divide-y divide-slate-100">
              {table.items.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-2 py-3 transition-colors hover:bg-slate-50/70"
                >
                  <div className="col-span-7 flex min-w-0 items-center gap-2.5 sm:col-span-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-base ring-1 ring-slate-100 ring-inset">
                      {item.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-[11.5px] text-slate-400">
                        {timeOfDay(item.addedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-5 flex items-center justify-end gap-1.5 sm:col-span-3 sm:justify-center">
                    <StepButton
                      label="Quitar una unidad"
                      onClick={() => setItemQty(table.id, item.id, item.qty - 1)}
                    >
                      <Minus size={14} />
                    </StepButton>
                    <span className="tabular w-8 text-center text-[14px] font-semibold text-slate-900">
                      {item.qty}
                    </span>
                    <StepButton
                      label="Agregar una unidad"
                      onClick={() => setItemQty(table.id, item.id, item.qty + 1)}
                    >
                      <Plus size={14} />
                    </StepButton>
                    <button
                      onClick={() => removeItem(table.id, item.id)}
                      aria-label="Eliminar producto"
                      className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <span className="tabular col-span-6 text-[12.5px] text-slate-500 sm:col-span-2 sm:text-right">
                    <span className="sm:hidden">Precio: </span>
                    {money(item.price)}
                  </span>
                  <span className="tabular col-span-6 text-right text-[14px] font-semibold text-slate-900 sm:col-span-2">
                    {money(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100 ring-inset">
              <div className="tabular flex items-center justify-between text-[13.5px] text-slate-600">
                <span>Subtotal ({units} unidades)</span>
                <span>{money(total)}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-slate-200 pt-3">
                <span className="text-[14px] font-semibold text-slate-900">
                  Total a pagar
                </span>
                <span className="tabular text-2xl font-bold tracking-tight text-slate-900">
                  {money(total)}
                </span>
              </div>
              <p className="mt-1.5 text-[11.5px] text-slate-400">
                La propina voluntaria se define al momento del pago.
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function InfoTile({
  icon,
  label,
  value,
  strong,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-100 ring-inset">
      <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </p>
      <p
        className={`tabular mt-1 truncate ${
          strong ? "text-[17px] font-bold" : "text-[14px] font-semibold"
        } text-slate-900`}
      >
        {value}
      </p>
    </div>
  );
}

function StepButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 transition-all hover:bg-slate-900 hover:text-white hover:ring-slate-900 active:scale-95"
    >
      {children}
    </button>
  );
}
