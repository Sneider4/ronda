import type {
  BarTable,
  CategoryId,
  PaymentMethod,
  Product,
  Sale,
  StockState,
} from "@/types";
import { categories, products as catalog } from "@/data/catalog";
import { isSameDay, toDate } from "@/lib/format";

/* Todas las pantallas del sistema leen sus cifras de aquí, por eso los
 * números siempre son coherentes entre dashboard, ventas, caja y reportes. */

export const paid = (sales: Sale[]) => sales.filter((s) => s.status === "Pagada");

export const salesOfDay = (sales: Sale[], day: Date = new Date()) =>
  sales.filter((s) => isSameDay(s.dateISO, day));

export const salesOfMonth = (sales: Sale[], day: Date = new Date()) =>
  sales.filter((s) => {
    const d = toDate(s.dateISO);
    return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth();
  });

export interface Totals {
  total: number;
  count: number;
  units: number;
  ticket: number;
  tips: number;
  discounts: number;
}

export function totals(sales: Sale[]): Totals {
  const ok = paid(sales);
  const total = ok.reduce((s, x) => s + x.total, 0);
  const units = ok.reduce(
    (s, x) => s + x.items.reduce((a, i) => a + i.qty, 0),
    0,
  );
  return {
    total,
    count: ok.length,
    units,
    ticket: ok.length ? Math.round(total / ok.length) : 0,
    tips: ok.reduce((s, x) => s + x.tip, 0),
    discounts: ok.reduce((s, x) => s + x.discount, 0),
  };
}

export interface DayPoint {
  date: Date;
  key: string;
  total: number;
  count: number;
}

/** Serie de los últimos n días (incluye hoy) */
export function lastDays(sales: Sale[], n = 7): DayPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const out: DayPoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const daySales = paid(salesOfDay(sales, d));
    out.push({
      date: d,
      key: d.toISOString(),
      total: daySales.reduce((s, x) => s + x.total, 0),
      count: daySales.length,
    });
  }
  return out;
}

export interface ProductStat {
  productId: string;
  name: string;
  emoji: string;
  category: CategoryId;
  units: number;
  revenue: number;
}

export function topProducts(sales: Sale[], limit = 5): ProductStat[] {
  const map = new Map<string, ProductStat>();
  for (const sale of paid(sales)) {
    for (const item of sale.items) {
      const prev = map.get(item.productId);
      const product = catalog.find((p) => p.id === item.productId);
      if (prev) {
        prev.units += item.qty;
        prev.revenue += item.qty * item.price;
      } else {
        map.set(item.productId, {
          productId: item.productId,
          name: item.name,
          emoji: item.emoji,
          category: product?.category ?? "bebidas",
          units: item.qty,
          revenue: item.qty * item.price,
        });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.units - a.units).slice(0, limit);
}

export interface PaymentStat {
  method: PaymentMethod;
  total: number;
  count: number;
  share: number;
}

const METHODS: PaymentMethod[] = ["Efectivo", "Tarjeta", "Transferencia", "Nequi"];

export function paymentBreakdown(sales: Sale[]): PaymentStat[] {
  const ok = paid(sales);
  const grand = ok.reduce((s, x) => s + x.total, 0) || 1;
  return METHODS.map((method) => {
    const rows = ok.filter((s) => s.paymentMethod === method);
    const total = rows.reduce((s, x) => s + x.total, 0);
    return { method, total, count: rows.length, share: (total / grand) * 100 };
  }).sort((a, b) => b.total - a.total);
}

export interface CategoryStat {
  id: CategoryId;
  name: string;
  emoji: string;
  total: number;
  units: number;
  share: number;
}

export function byCategory(sales: Sale[]): CategoryStat[] {
  const acc = new Map<CategoryId, { total: number; units: number }>();
  for (const sale of paid(sales)) {
    for (const item of sale.items) {
      const cat = catalog.find((p) => p.id === item.productId)?.category ?? "bebidas";
      const prev = acc.get(cat) ?? { total: 0, units: 0 };
      prev.total += item.qty * item.price;
      prev.units += item.qty;
      acc.set(cat, prev);
    }
  }
  const grand = [...acc.values()].reduce((s, x) => s + x.total, 0) || 1;
  return categories
    .map((c) => {
      const v = acc.get(c.id) ?? { total: 0, units: 0 };
      return {
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        total: v.total,
        units: v.units,
        share: (v.total / grand) * 100,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export interface HourPoint {
  hour: number;
  total: number;
  count: number;
}

/** Distribución de la venta por hora (16:00 → 23:00) */
export function byHour(sales: Sale[], from = 16, to = 23): HourPoint[] {
  const out: HourPoint[] = [];
  const ok = paid(sales);
  for (let h = from; h <= to; h++) {
    const rows = ok.filter((s) => toDate(s.dateISO).getHours() === h);
    out.push({
      hour: h,
      total: rows.reduce((s, x) => s + x.total, 0),
      count: rows.length,
    });
  }
  return out;
}

export function bestHour(sales: Sale[]): HourPoint {
  const hours = byHour(sales);
  return hours.reduce(
    (best, h) => (h.total > best.total ? h : best),
    hours[0] ?? { hour: 21, total: 0, count: 0 },
  );
}

export function bestDay(sales: Sale[], days = 30): DayPoint {
  const series = lastDays(sales, days);
  return series.reduce(
    (best, d) => (d.total > best.total ? d : best),
    series[0],
  );
}

/** Promedio de venta por día de la semana (para "mi mejor día") */
export function averageByWeekday(sales: Sale[], days = 28) {
  const series = lastDays(sales, days);
  const acc = new Map<number, { total: number; n: number }>();
  for (const d of series) {
    const w = d.date.getDay();
    const prev = acc.get(w) ?? { total: 0, n: 0 };
    prev.total += d.total;
    prev.n += 1;
    acc.set(w, prev);
  }
  const names = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return [1, 2, 3, 4, 5, 6, 0].map((w) => {
    const v = acc.get(w) ?? { total: 0, n: 1 };
    return { weekday: w, name: names[w], average: Math.round(v.total / (v.n || 1)) };
  });
}

/* ── Inventario ────────────────────────────────────────────────────────────*/

export function stockState(p: Product): StockState {
  if (p.stock <= 0) return "agotado";
  if (p.stock <= p.minStock) return "bajo";
  return "disponible";
}

export const lowStock = (products: Product[]) =>
  products
    .filter((p) => stockState(p) !== "disponible")
    .sort((a, b) => a.stock / (a.minStock || 1) - b.stock / (b.minStock || 1));

export const inventoryValue = (products: Product[]) =>
  products.reduce((s, p) => s + p.stock * p.cost, 0);

export const potentialRevenue = (products: Product[]) =>
  products.reduce((s, p) => s + p.stock * p.price, 0);

/* ── Mesas ─────────────────────────────────────────────────────────────────*/

export const tableTotal = (t: BarTable) =>
  t.items.reduce((s, i) => s + i.price * i.qty, 0);

export const openTables = (tables: BarTable[]) =>
  tables.filter((t) => t.status === "ocupada" || t.status === "por-pagar");

export const openAmount = (tables: BarTable[]) =>
  openTables(tables).reduce((s, t) => s + tableTotal(t), 0);
