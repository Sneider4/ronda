"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  HandCoins,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  Wallet,
} from "lucide-react";
import type {
  Expense,
  ExpenseCategoryId,
  ExpenseStatus,
  PaymentMethod,
} from "@/types";
import { expenseCategories, expenseCategoryById } from "@/data/expenses";
import { employeeById } from "@/data/employees";
import { useDemo } from "@/store/demo-store";
import { longDate, money, shortDate } from "@/lib/format";
import {
  availableMonths,
  expensesByCategory,
  expensesOfMonth,
  isOwnerDraw,
  operating,
  pendingBills,
  sumAmount,
} from "@/services/analytics";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Field, Input, SearchInput, Segmented, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { RankList } from "@/components/charts/RankList";

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const toInputDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const fromInputDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0);
  return date.toISOString();
};

export default function GastosPage() {
  const {
    expenses,
    sales,
    saveExpense,
    deleteExpense,
    payExpense,
    nextExpenseNumber,
    toast,
  } = useDemo();

  const months = useMemo(() => availableMonths(sales), [sales]);
  const [monthKey, setMonthKey] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}`;
  });
  const [category, setCategory] = useState<ExpenseCategoryId | "todas">("todas");
  const [status, setStatus] = useState<ExpenseStatus | "todos">("todos");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [toDelete, setToDelete] = useState<Expense | null>(null);

  const [year, month] = monthKey.split("-").map(Number);
  const refDate = new Date(year, month, 1);

  const monthExpenses = useMemo(
    () => expensesOfMonth(expenses, refDate),
    [expenses, refDate],
  );

  const gastosNegocio = operating(monthExpenses);
  const retiros = monthExpenses.filter(isOwnerDraw);
  const pendientes = pendingBills(expenses);
  const porCategoria = expensesByCategory(gastosNegocio);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return monthExpenses
      .filter((e) => {
        const byCat = category === "todas" || e.category === category;
        const byStatus = status === "todos" || e.status === status;
        const byQuery =
          !q ||
          e.description.toLowerCase().includes(q) ||
          (e.supplier ?? "").toLowerCase().includes(q);
        return byCat && byStatus && byQuery;
      })
      .sort((a, b) => +new Date(b.dateISO) - +new Date(a.dateISO));
  }, [monthExpenses, category, status, query]);

  const emptyExpense = (): Expense => ({
    id: `g-${Math.random().toString(36).slice(2, 8)}`,
    number: nextExpenseNumber(),
    dateISO: new Date().toISOString(),
    category: "proveedores",
    description: "",
    supplier: "",
    amount: 0,
    paymentMethod: "Efectivo",
    status: "Pagado",
    employeeId: "e-1",
  });

  const save = () => {
    if (!editing) return;
    if (!editing.description.trim()) {
      toast({ title: "Escriba en qué se gastó el dinero", variant: "warning" });
      return;
    }
    if (editing.amount <= 0) {
      toast({ title: "El valor debe ser mayor a cero", variant: "warning" });
      return;
    }
    saveExpense({
      ...editing,
      description: editing.description.trim(),
      supplier: editing.supplier?.trim() || undefined,
    });
    toast({
      title: isNew ? "Gasto registrado" : "Gasto actualizado",
      description: `${editing.description} · ${money(editing.amount)}`,
      variant: "success",
    });
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Gastos de ${MONTHS[month]}`}
          value={money(sumAmount(gastosNegocio))}
          icon={<TrendingDown size={19} />}
          accent="rose"
          hint={`${gastosNegocio.length} salidas registradas`}
        />
        <StatCard
          label="Cuentas por pagar"
          value={money(sumAmount(pendientes))}
          icon={<AlertCircle size={19} />}
          accent="brand"
          hint={
            pendientes.length
              ? `${pendientes.length} facturas pendientes`
              : "Todo al día"
          }
        />
        <StatCard
          label="Retiros de la propietaria"
          value={money(sumAmount(retiros))}
          icon={<Wallet size={19} />}
          accent="violet"
          hint="No cuentan como gasto del negocio"
        />
        <StatCard
          label="Mayor gasto del mes"
          value={porCategoria[0]?.name ?? "—"}
          icon={<HandCoins size={19} />}
          accent="slate"
          hint={
            porCategoria[0]
              ? `${money(porCategoria[0].total)} · ${porCategoria[0].share.toFixed(0)} % del total`
              : ""
          }
        />
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-3">
      {/* Cuentas por pagar */}
      {pendientes.length > 0 && (
        <Card className="border-sky-200 bg-sky-50/60 lg:col-span-2">
          <CardHeader
            title="Cuentas por pagar"
            subtitle="Facturas registradas que todavía no se han pagado"
            icon={<CalendarClock size={17} />}
          />
          <ul className="grid gap-3 sm:grid-cols-2">
            {pendientes.map((e) => {
              const cat = expenseCategoryById(e.category);
              const vence = e.dueDateISO ? new Date(e.dueDateISO) : null;
              const vencida = vence ? vence < new Date() : false;
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-3 rounded-xl bg-white p-3.5 ring-1 ring-slate-200"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-lg">
                    {cat.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-slate-900">
                      {e.description}
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {e.supplier ? `${e.supplier} · ` : ""}
                      {vence
                        ? `${vencida ? "venció" : "vence"} el ${shortDate(vence)}`
                        : shortDate(e.dateISO)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="tabular text-[13.5px] font-semibold text-slate-900">
                      {money(e.amount)}
                    </span>
                    <button
                      onClick={() => {
                        payExpense(e.id);
                        toast({
                          title: "Cuenta marcada como pagada",
                          description: `${e.description} · ${money(e.amount)}`,
                          variant: "success",
                        });
                      }}
                      className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11.5px] font-semibold text-white transition-colors hover:bg-slate-700"
                    >
                      Marcar pagada
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

        {/* En qué se va la plata */}
        <Card className={pendientes.length ? "" : "lg:col-span-3"}>
          <CardHeader
            title="En qué se va la plata"
            subtitle={`Gastos de ${MONTHS[month]} por categoría`}
            icon={<TrendingDown size={17} />}
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
              Todavía no hay gastos registrados en este mes.
            </p>
          )}
          <div className="mt-5 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100 ring-inset">
            <div className="tabular flex items-center justify-between">
              <span className="text-[13px] text-slate-600">
                Total de gastos del mes
              </span>
              <span className="text-[15px] font-semibold text-slate-900">
                {money(sumAmount(gastosNegocio))}
              </span>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">
              Los retiros de la propietaria ({money(sumAmount(retiros))}) se
              llevan aparte: no son un gasto del bar, son la plata que usted ya
              se llevó.
            </p>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4">
        {/* Listado */}
        <Card padded={false}>
          <div className="flex flex-col gap-4 p-5">
            <CardHeader
              title="Salidas de dinero"
              subtitle="Compras, servicios, nómina y todo lo que sale de la caja"
              icon={<HandCoins size={17} />}
              className="mb-0"
              action={
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={() => {
                    setEditing(emptyExpense());
                    setIsNew(true);
                  }}
                >
                  Registrar gasto
                </Button>
              }
            />

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Select
                  className="sm:w-56"
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
                <SearchInput
                  icon={<Search size={15} />}
                  placeholder="Buscar gasto o proveedor…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="sm:w-64"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Segmented<ExpenseCategoryId | "todas">
                  value={category}
                  onChange={setCategory}
                  options={[
                    { value: "todas", label: "Todas" },
                    ...expenseCategories.map((c) => ({
                      value: c.id as ExpenseCategoryId | "todas",
                      label: (
                        <span className="flex items-center gap-1.5">
                          <span>{c.emoji}</span>
                          {c.name.split(" ")[0]}
                        </span>
                      ),
                    })),
                  ]}
                />
                <Segmented<ExpenseStatus | "todos">
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "todos", label: "Todos" },
                    { value: "Pagado", label: "Pagados" },
                    { value: "Pendiente", label: "Pendientes" },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/60 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Concepto</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Pago</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Valor</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visible.map((e) => {
                  const cat = expenseCategoryById(e.category);
                  return (
                    <tr key={e.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="tabular px-5 py-3 text-[13px] text-slate-600">
                        {shortDate(e.dateISO)}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-[13.5px] font-medium text-slate-900">
                          {e.description}
                        </p>
                        <p className="text-[12px] text-slate-500">
                          {e.supplier ?? employeeById(e.employeeId).name}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset ${cat.chip}`}
                        >
                          {cat.emoji} {cat.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-slate-600">
                        {e.paymentMethod}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          tone={e.status === "Pagado" ? "success" : "warning"}
                          dot
                        >
                          {e.status}
                        </Badge>
                      </td>
                      <td className="tabular px-5 py-3 text-right text-[13.5px] font-semibold text-slate-900">
                        {money(e.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {e.status === "Pendiente" && (
                            <IconButton
                              label="Marcar como pagada"
                              onClick={() => {
                                payExpense(e.id);
                                toast({
                                  title: "Cuenta marcada como pagada",
                                  variant: "success",
                                });
                              }}
                              className="hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <CheckCircle2 size={15} />
                            </IconButton>
                          )}
                          <IconButton
                            label="Editar"
                            onClick={() => {
                              setEditing({ ...e });
                              setIsNew(false);
                            }}
                          >
                            <Pencil size={15} />
                          </IconButton>
                          <IconButton
                            label="Eliminar"
                            onClick={() => setToDelete(e)}
                            className="hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={15} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {visible.length === 0 && (
              <div className="p-5">
                <EmptyState
                  title="No hay gastos con estos filtros"
                  description="Cambie el mes o la categoría, o registre una nueva salida de dinero."
                />
              </div>
            )}
          </div>
        </Card>

      </section>

      {/* Formulario de gasto */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        size="md"
        title={isNew ? "Registrar salida de dinero" : "Editar gasto"}
        subtitle="Compras a proveedores, servicios, nómina, arreglos o retiros"
        icon={<HandCoins size={18} />}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={save}>
              {isNew ? "Registrar gasto" : "Guardar cambios"}
            </Button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="¿En qué se gastó?" className="sm:col-span-2">
                <Input
                  value={editing.description}
                  placeholder="Ej: Compra de cerveza"
                  onChange={(ev) =>
                    setEditing({ ...editing, description: ev.target.value })
                  }
                />
              </Field>
              <Field label="Categoría">
                <Select
                  value={editing.category}
                  onChange={(ev) =>
                    setEditing({
                      ...editing,
                      category: ev.target.value as ExpenseCategoryId,
                    })
                  }
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Proveedor o a quién se le pagó" hint="Opcional">
                <Input
                  value={editing.supplier ?? ""}
                  placeholder="Ej: Distribuidora Bavaria"
                  onChange={(ev) =>
                    setEditing({ ...editing, supplier: ev.target.value })
                  }
                />
              </Field>
              <Field label="Valor">
                <Input
                  type="number"
                  min={0}
                  step={1000}
                  value={editing.amount || ""}
                  onChange={(ev) =>
                    setEditing({ ...editing, amount: Number(ev.target.value) })
                  }
                />
              </Field>
              <Field label="Fecha">
                <Input
                  type="date"
                  value={toInputDate(editing.dateISO)}
                  onChange={(ev) =>
                    setEditing({
                      ...editing,
                      dateISO: fromInputDate(ev.target.value),
                    })
                  }
                />
              </Field>
              <Field label="¿Cómo se pagó?">
                <Select
                  value={editing.paymentMethod}
                  onChange={(ev) =>
                    setEditing({
                      ...editing,
                      paymentMethod: ev.target.value as PaymentMethod,
                    })
                  }
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Nequi">Nequi</option>
                </Select>
              </Field>
              <Field label="Estado">
                <Select
                  value={editing.status}
                  onChange={(ev) =>
                    setEditing({
                      ...editing,
                      status: ev.target.value as ExpenseStatus,
                    })
                  }
                >
                  <option value="Pagado">Ya se pagó</option>
                  <option value="Pendiente">Queda pendiente</option>
                </Select>
              </Field>
              {editing.status === "Pendiente" && (
                <Field label="¿Hasta cuándo hay plazo?" className="sm:col-span-2">
                  <Input
                    type="date"
                    value={
                      editing.dueDateISO
                        ? toInputDate(editing.dueDateISO)
                        : toInputDate(editing.dateISO)
                    }
                    onChange={(ev) =>
                      setEditing({
                        ...editing,
                        dueDateISO: fromInputDate(ev.target.value),
                      })
                    }
                  />
                </Field>
              )}
            </div>

            {editing.paymentMethod === "Efectivo" &&
              editing.status === "Pagado" && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">
                  Este gasto sale de la caja: se descuenta del efectivo esperado
                  en el cierre del turno.
                </p>
              )}
          </div>
        )}
      </Modal>

      {/* Confirmación de borrado */}
      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        size="sm"
        title="Eliminar gasto"
        subtitle="Se borra del cuaderno del mes"
        icon={<Trash2 size={18} />}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!toDelete) return;
                deleteExpense(toDelete.id);
                toast({ title: "Gasto eliminado", variant: "info" });
                setToDelete(null);
              }}
            >
              Sí, eliminar
            </Button>
          </div>
        }
      >
        {toDelete && (
          <div className="rounded-xl bg-rose-50 p-4 ring-1 ring-rose-100 ring-inset">
            <p className="text-[14px] font-semibold text-rose-900">
              {toDelete.description}
            </p>
            <p className="tabular text-[12.5px] text-rose-700">
              {money(toDelete.amount)} · {longDate(toDelete.dateISO)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
