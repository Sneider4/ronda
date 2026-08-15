import type {
  BarTable,
  CashSession,
  OrderItem,
  PaymentMethod,
  Product,
  Sale,
} from "@/types";
import { products as catalog, salesWeight } from "./catalog";

/* ────────────────────────────────────────────────────────────────────────────
 * Generador determinista de datos de demostración.
 * Usa una semilla fija para que la demo se vea igual en cada carga y para que
 * todas las pantallas (dashboard, ventas, reportes, caja) sean coherentes:
 * todas leen de la MISMA lista de ventas.
 * ──────────────────────────────────────────────────────────────────────────*/

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260815);

const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) =>
  min + Math.floor(rand() * (max - min + 1));

function weightedPick<T extends string>(entries: [T, number][]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [value, w] of entries) {
    r -= w;
    if (r <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Ventas por día de la semana (0 = domingo) */
const SALES_PER_WEEKDAY = [22, 9, 10, 14, 20, 30, 34];

/** Distribución de la venta a lo largo de la noche */
const HOUR_WEIGHTS: [string, number][] = [
  ["16", 5],
  ["17", 8],
  ["18", 12],
  ["19", 16],
  ["20", 22],
  ["21", 26],
  ["22", 24],
  ["23", 15],
];

const PAYMENT_WEIGHTS: [PaymentMethod, number][] = [
  ["Efectivo", 46],
  ["Tarjeta", 20],
  ["Transferencia", 14],
  ["Nequi", 20],
];

const EMPLOYEE_WEIGHTS: [string, number][] = [
  ["e-2", 40],
  ["e-3", 38],
  ["e-1", 12],
  ["e-4", 10],
];

const weightedCatalog: [string, number][] = catalog.map((p) => [
  p.id,
  salesWeight[p.id] ?? 3,
]);

const productById = new Map(catalog.map((p) => [p.id, p]));

function qtyFor(p: Product) {
  switch (p.category) {
    case "cervezas":
      return between(1, 4);
    case "cocteles":
    case "bebidas":
      return between(1, 2);
    case "licores":
      return p.price > 30000 ? 1 : between(1, 2);
    default:
      return 1;
  }
}

function buildItems(date: Date): OrderItem[] {
  const count = between(2, 4);
  const chosen = new Set<string>();
  const items: OrderItem[] = [];
  let guard = 0;
  while (chosen.size < count && guard++ < 40) {
    const id = weightedPick(weightedCatalog);
    if (chosen.has(id)) continue;
    chosen.add(id);
    const p = productById.get(id)!;
    items.push({
      id: `oi-${date.getTime()}-${items.length}-${Math.floor(rand() * 1e6)}`,
      productId: p.id,
      name: p.name,
      emoji: p.emoji,
      price: p.price,
      qty: qtyFor(p),
      addedAt: date.toISOString(),
    });
  }
  return items;
}

function buildSale(date: Date): Omit<Sale, "number" | "id"> {
  const items = buildItems(date);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = rand() < 0.07 ? Math.round((subtotal * 0.05) / 500) * 500 : 0;
  const tip = rand() < 0.22 ? Math.round((subtotal * 0.1) / 500) * 500 : 0;
  const anulada = rand() < 0.012;
  return {
    dateISO: date.toISOString(),
    tableNumber: between(1, 12),
    employeeId: weightedPick(EMPLOYEE_WEIGHTS),
    items,
    subtotal,
    discount,
    tip,
    total: subtotal - discount + tip,
    paymentMethod: weightedPick(PAYMENT_WEIGHTS),
    status: anulada ? "Anulada" : "Pagada",
  };
}

/** Historial de los últimos 30 días, terminando con la venta #1048 de hoy. */
export function createSales(): Sale[] {
  const today = startOfToday();
  const drafts: Omit<Sale, "number" | "id">[] = [];

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const day = new Date(today);
    day.setDate(day.getDate() - dayOffset);
    const count = SALES_PER_WEEKDAY[day.getDay()];
    const dayDrafts: Omit<Sale, "number" | "id">[] = [];

    for (let i = 0; i < count; i++) {
      const hour = Number(weightedPick(HOUR_WEIGHTS));
      const date = new Date(day);
      date.setHours(hour, between(0, 59), between(0, 59), 0);
      dayDrafts.push(buildSale(date));
    }
    dayDrafts.sort(
      (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime(),
    );
    drafts.push(...dayDrafts);
  }

  // Numeración consecutiva: la última venta de hoy queda en #1048
  const start = 1048 - drafts.length + 1;
  return drafts.map((d, i) => ({
    ...d,
    id: `s-${start + i}`,
    number: start + i,
  }));
}

/* ── Mesas abiertas (cuentas en curso, escritas a mano para la demo) ────────*/

function item(productId: string, qty: number, minutesAgo: number): OrderItem {
  const p = productById.get(productId)!;
  const d = new Date(Date.now() - minutesAgo * 60000);
  return {
    id: `oi-${productId}-${minutesAgo}`,
    productId: p.id,
    name: p.name,
    emoji: p.emoji,
    price: p.price,
    qty,
    addedAt: d.toISOString(),
  };
}

const minsAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

export function createTables(): BarTable[] {
  return [
    { id: "t-1", number: 1, zone: "Salón", seats: 4, status: "disponible", items: [] },
    {
      id: "t-2",
      number: 2,
      zone: "Salón",
      seats: 4,
      status: "ocupada",
      waiterId: "e-2",
      openedAt: minsAgo(74),
      items: [item("p-01", 6, 70), item("p-27", 1, 66), item("p-22", 2, 34)],
    },
    {
      id: "t-3",
      number: 3,
      zone: "Salón",
      seats: 6,
      status: "ocupada",
      waiterId: "e-3",
      openedAt: minsAgo(48),
      items: [item("p-02", 4, 45), item("p-04", 3, 30), item("p-30", 1, 22)],
    },
    {
      id: "t-4",
      number: 4,
      zone: "Terraza",
      seats: 6,
      status: "ocupada",
      waiterId: "e-2",
      openedAt: minsAgo(96),
      items: [
        item("p-01", 4, 92),
        item("p-11", 1, 88),
        item("p-23", 2, 85),
        item("p-31", 1, 51),
        item("p-17", 2, 26),
      ],
    },
    {
      id: "t-5",
      number: 5,
      zone: "Terraza",
      seats: 4,
      status: "por-pagar",
      waiterId: "e-3",
      openedAt: minsAgo(132),
      items: [item("p-05", 3, 126), item("p-16", 2, 118), item("p-32", 1, 88)],
    },
    { id: "t-6", number: 6, zone: "Terraza", seats: 4, status: "disponible", items: [] },
    {
      id: "t-7",
      number: 7,
      zone: "Salón",
      seats: 8,
      status: "ocupada",
      waiterId: "e-3",
      openedAt: minsAgo(37),
      items: [item("p-06", 8, 34), item("p-19", 2, 28), item("p-28", 2, 20)],
    },
    {
      id: "t-8",
      number: 8,
      zone: "Barra",
      seats: 2,
      status: "ocupada",
      waiterId: "e-2",
      openedAt: minsAgo(21),
      items: [item("p-09", 2, 19), item("p-23", 1, 18)],
    },
    {
      id: "t-9",
      number: 9,
      zone: "Barra",
      seats: 2,
      status: "reservada",
      items: [],
      reservationName: "Sra. Patricia Ruiz",
      reservationTime: "9:30 PM",
    },
    {
      id: "t-10",
      number: 10,
      zone: "Salón",
      seats: 6,
      status: "por-pagar",
      waiterId: "e-2",
      openedAt: minsAgo(158),
      items: [item("p-04", 6, 150), item("p-12", 4, 140), item("p-29", 2, 96)],
    },
    { id: "t-11", number: 11, zone: "Terraza", seats: 4, status: "disponible", items: [] },
    {
      id: "t-12",
      number: 12,
      zone: "Salón",
      seats: 10,
      status: "reservada",
      items: [],
      reservationName: "Cumpleaños Daniel M.",
      reservationTime: "10:00 PM",
    },
  ];
}

export function createCashSession(): CashSession {
  const opened = new Date();
  opened.setHours(16, 0, 0, 0);
  return {
    openedAt: opened.toISOString(),
    openingAmount: 200000,
    closed: false,
  };
}

export function createProducts(): Product[] {
  return catalog.map((p) => ({ ...p }));
}

export { pick, between };
