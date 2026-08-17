import {
  BarChart3,
  BookOpen,
  Boxes,
  HandCoins,
  LayoutDashboard,
  Receipt,
  Table2,
  Users,
  Wallet,
  Wine,
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
  /** permiso necesario para ver esta sección */
  permission: Permission;
  /** clave del contador que se muestra a la derecha */
  badge?: "mesas" | "alertas" | "pendientes";
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: "Operación",
    items: [
      {
        href: "/",
        permission: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Resumen del día",
      },
      {
        href: "/mesas",
        permission: "pedidos",
        label: "Mesas",
        icon: Table2,
        description: "Estado del salón y cuentas abiertas",
        badge: "mesas",
      },
      {
        href: "/ventas",
        permission: "cobrar",
        label: "Ventas",
        icon: Receipt,
        description: "Historial y comprobantes",
      },
      {
        href: "/caja",
        permission: "caja",
        label: "Caja",
        icon: Wallet,
        description: "Cierre y arqueo del turno",
      },
      {
        href: "/gastos",
        permission: "gastos",
        label: "Gastos",
        icon: HandCoins,
        description: "Salidas de dinero y cuentas por pagar",
        badge: "pendientes",
      },
    ],
  },
  {
    title: "Administración",
    items: [
      {
        href: "/balance",
        permission: "balance",
        label: "Balance del mes",
        icon: BookOpen,
        description: "Cuánto entró, cuánto salió y cuánto quedó",
      },
      {
        href: "/inventario",
        permission: "inventario",
        label: "Inventario",
        icon: Boxes,
        description: "Existencias y alertas de reposición",
        badge: "alertas",
      },
      {
        href: "/productos",
        permission: "productos",
        label: "Productos",
        icon: Wine,
        description: "Catálogo y precios",
      },
      {
        href: "/reportes",
        permission: "reportes",
        label: "Reportes",
        icon: BarChart3,
        description: "Qué se vende, cuándo y cuánto",
      },
      {
        href: "/empleados",
        permission: "empleados",
        label: "Empleados",
        icon: Users,
        description: "Equipo y permisos",
      },
    ],
  },
];

export const allNavItems = navGroups.flatMap((g) => g.items);

export const findNavItem = (pathname: string) =>
  allNavItems.find((i) => (i.href === "/" ? pathname === "/" : pathname.startsWith(i.href)));
