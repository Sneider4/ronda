"use client";

import { CalendarClock, Lock, Phone, ShieldCheck, Users } from "lucide-react";
import type { EmployeeRole } from "@/types";
import { employees } from "@/data/employees";
import { useDemo } from "@/store/demo-store";
import { initials, money, number as fmtNumber } from "@/lib/format";
import { salesOfDay, totals } from "@/services/analytics";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const ROLE_TONE: Record<EmployeeRole, "brand" | "info" | "success" | "violet"> = {
  Administrador: "brand",
  Mesero: "info",
  Mesera: "violet",
  Caja: "success",
};

/** Lo que podría hacer cada rol cuando el sistema tenga control de accesos. */
const PERMISSIONS: {
  label: string;
  roles: Record<EmployeeRole | "todos", boolean>;
}[] = [
  {
    label: "Tomar pedidos y abrir mesas",
    roles: { Administrador: true, Mesero: true, Mesera: true, Caja: true, todos: true },
  },
  {
    label: "Cobrar y cerrar cuentas",
    roles: { Administrador: true, Mesero: false, Mesera: false, Caja: true, todos: false },
  },
  {
    label: "Aplicar descuentos",
    roles: { Administrador: true, Mesero: false, Mesera: false, Caja: false, todos: false },
  },
  {
    label: "Modificar precios y productos",
    roles: { Administrador: true, Mesero: false, Mesera: false, Caja: false, todos: false },
  },
  {
    label: "Cerrar la caja del turno",
    roles: { Administrador: true, Mesero: false, Mesera: false, Caja: true, todos: false },
  },
  {
    label: "Ver reportes del negocio",
    roles: { Administrador: true, Mesero: false, Mesera: false, Caja: false, todos: false },
  },
];

const ROLES: EmployeeRole[] = ["Administrador", "Caja", "Mesero", "Mesera"];

export default function EmpleadosPage() {
  const { sales } = useDemo();
  const today = salesOfDay(sales);

  const statsFor = (employeeId: string) =>
    totals(today.filter((s) => s.employeeId === employeeId));

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {employees.map((e) => {
          const stats = statsFor(e.id);
          return (
            <article
              key={e.id}
              className="card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-[15px] font-bold text-white shadow-sm ${e.color}`}
                  >
                    {initials(e.name)}
                  </span>
                  <div>
                    <p className="text-[15px] leading-tight font-semibold text-slate-900">
                      {e.name}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Badge tone={ROLE_TONE[e.role]}>{e.role}</Badge>
                      <Badge tone={e.active ? "success" : "neutral"} dot>
                        {e.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <dl className="mt-4 space-y-2 text-[12.5px] text-slate-600">
                <div className="flex items-center gap-2">
                  <CalendarClock size={14} className="text-slate-400" />
                  <span>{e.shift}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span>{e.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <span>En el equipo desde {e.since}</span>
                </div>
              </dl>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[11.5px] text-slate-500">Ventas de hoy</p>
                  <p className="tabular text-[17px] font-semibold text-slate-900">
                    {fmtNumber(stats.count)}
                  </p>
                </div>
                <div>
                  <p className="text-[11.5px] text-slate-500">Facturado hoy</p>
                  <p className="tabular text-[17px] font-semibold text-slate-900">
                    {money(stats.total)}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Permisos por rol */}
      <Card padded={false}>
        <div className="p-5">
          <CardHeader
            title="Permisos por rol"
            subtitle="Así quedaría el control de accesos cuando cada empleado entre con su propio usuario"
            icon={<ShieldCheck size={17} />}
            className="mb-0"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
                <th className="px-5 py-3">Acción dentro del sistema</th>
                {ROLES.map((r) => (
                  <th key={r} className="px-5 py-3 text-center">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {PERMISSIONS.map((p) => (
                <tr key={p.label} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-5 py-3 text-[13.5px] text-slate-700">
                    {p.label}
                  </td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-5 py-3 text-center">
                      {p.roles[r] ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 ring-inset">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-300 ring-1 ring-slate-100 ring-inset">
                          <Lock size={12} />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
          <p className="text-[12.5px] leading-relaxed text-slate-600">
            En esta demostración todos los módulos están abiertos para poder
            mostrarlos. En la versión final, cada empleado entra con su usuario y
            solo ve lo que le corresponde: los meseros toman pedidos, la caja
            cobra y cierra el turno, y la propietaria es la única que ve los
            reportes y modifica precios.
          </p>
        </div>
      </Card>
    </div>
  );
}
