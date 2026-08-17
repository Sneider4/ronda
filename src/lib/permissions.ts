import type { EmployeeRole } from "@/types";

/**
 * Permisos por rol.
 *
 * Regla de fondo: la información del negocio (existencias, ventas, gastos,
 * utilidades) es de la propietaria. Un mesero toma pedidos y ya: no ve cuánto
 * hay en inventario ni cuánto se vendió, ni siquiera las alertas de stock.
 *
 * Este archivo es la única fuente de verdad: la navegación, las pantallas y la
 * tabla de permisos de "Empleados" leen de aquí.
 */

export type Permission =
  | "dashboard"
  | "pedidos"
  | "cobrar"
  | "descuentos"
  | "inventario"
  | "productos"
  | "gastos"
  | "caja"
  | "balance"
  | "reportes"
  | "empleados";

export const ROLE_PERMISSIONS: Record<EmployeeRole, Permission[]> = {
  Administrador: [
    "dashboard",
    "pedidos",
    "cobrar",
    "descuentos",
    "inventario",
    "productos",
    "gastos",
    "caja",
    "balance",
    "reportes",
    "empleados",
  ],
  Caja: ["dashboard", "pedidos", "cobrar", "inventario", "gastos", "caja"],
  Mesero: ["pedidos"],
  Mesera: ["pedidos"],
};

export const can = (role: EmployeeRole, permission: Permission) =>
  ROLE_PERMISSIONS[role].includes(permission);

/** Primera pantalla de cada rol al entrar al sistema */
export const homeFor = (role: EmployeeRole) =>
  can(role, "dashboard") ? "/" : "/mesas";

/** Filas de la tabla de permisos que se le muestra a la propietaria */
export const PERMISSION_LABELS: { permission: Permission; label: string }[] = [
  { permission: "pedidos", label: "Tomar pedidos y abrir mesas" },
  { permission: "cobrar", label: "Cobrar y cerrar cuentas" },
  { permission: "inventario", label: "Ver existencias y alertas de inventario" },
  { permission: "descuentos", label: "Aplicar descuentos" },
  { permission: "productos", label: "Modificar precios y productos" },
  { permission: "gastos", label: "Registrar gastos y cuentas por pagar" },
  { permission: "caja", label: "Cerrar la caja del turno" },
  { permission: "balance", label: "Ver el balance del mes" },
  { permission: "reportes", label: "Ver reportes del negocio" },
];
