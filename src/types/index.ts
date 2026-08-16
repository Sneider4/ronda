/**
 * Modelo de dominio del sistema.
 * Estos tipos son los mismos que consumiría un backend real más adelante:
 * la capa de datos mock (src/data) y los servicios (src/services) los respetan.
 */

export type CategoryId =
  | "cervezas"
  | "licores"
  | "cocteles"
  | "bebidas"
  | "snacks";

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  /** Clases utilitarias para el chip de categoría */
  chip: string;
}

export interface Product {
  id: string;
  name: string;
  /** Presentación: "Botella 330ml", "Copa", "Porción"… */
  presentation: string;
  category: CategoryId;
  /** Precio de venta al público (COP) */
  price: number;
  /** Costo de compra (COP) — usado para margen en reportes */
  cost: number;
  stock: number;
  minStock: number;
  emoji: string;
  active: boolean;
}

export type StockState = "disponible" | "bajo" | "agotado";

export type TableStatus = "disponible" | "ocupada" | "por-pagar" | "reservada";

export type TableZone = "Salón" | "Terraza" | "Barra";

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  emoji: string;
  price: number;
  qty: number;
  /** ISO — hora en que se agregó a la cuenta */
  addedAt: string;
  note?: string;
}

export interface BarTable {
  id: string;
  number: number;
  zone: TableZone;
  seats: number;
  status: TableStatus;
  /** Empleado que atiende la mesa */
  waiterId?: string;
  /** ISO — momento de apertura de la cuenta */
  openedAt?: string;
  items: OrderItem[];
  reservationName?: string;
  reservationTime?: string;
}

export type PaymentMethod = "Efectivo" | "Tarjeta" | "Transferencia" | "Nequi";

export type SaleStatus = "Pagada" | "Anulada";

export interface Sale {
  id: string;
  /** Consecutivo interno visible: 1048 → "Venta #1048" */
  number: number;
  /** ISO */
  dateISO: string;
  tableNumber: number;
  employeeId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tip: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
}

export type EmployeeRole = "Administrador" | "Mesero" | "Mesera" | "Caja";

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  active: boolean;
  shift: string;
  phone: string;
  since: string;
  color: string;
}

/* ── Salidas de dinero (el otro lado del cuaderno) ─────────────────────────*/

export type ExpenseCategoryId =
  | "proveedores"
  | "nomina"
  | "arriendo"
  | "servicios"
  | "mantenimiento"
  | "eventos"
  | "retiros"
  | "otros";

export interface ExpenseCategory {
  id: ExpenseCategoryId;
  name: string;
  emoji: string;
  chip: string;
  /** Los retiros de la propietaria no son un gasto del negocio: se muestran aparte */
  isOwnerDraw?: boolean;
}

export type ExpenseStatus = "Pagado" | "Pendiente";

export interface Expense {
  id: string;
  number: number;
  /** ISO — fecha del gasto (o de la factura) */
  dateISO: string;
  category: ExpenseCategoryId;
  description: string;
  supplier?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  /** ISO — fecha límite de pago de una factura pendiente */
  dueDateISO?: string;
  employeeId: string;
  note?: string;
}

export interface CashSession {
  openedAt: string;
  openingAmount: number;
  closed: boolean;
  closedAt?: string;
  countedAmount?: number;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: "success" | "info" | "warning" | "error";
}
