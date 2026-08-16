import type {
  BarTable,
  CashSession,
  Expense,
  ExpenseCategoryId,
  OrderItem,
  PaymentMethod,
  Product,
  Sale,
} from "@/types";
import { products as catalog, salesWeight } from "./catalog";
import { suppliers } from "./expenses";

/* ────────────────────────────────────────────────────────────────────────────
 * Generador determinista de datos de demostración.
 * Cada función arranca su propio generador con semilla fija: así la demo se ve
 * igual en cada carga y "Reiniciar demostración" devuelve exactamente el mismo
 * estado. Todas las pantallas leen de estos mismos datos.
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

/** Generador activo: cada create* lo reinicia con su propia semilla. */
let rand = mulberry32(20260815);

const between = (min: number, max: number) =>
  min + Math.floor(rand() * (max - min + 1));

/** Valor aleatorio redondeado a la decena de miles, como se maneja en un bar */
const around = (base: number, spread: number) =>
  Math.round((base + (rand() - 0.5) * 2 * spread) / 10000) * 10000;

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

/** Días de historial que trae la demo (permite comparar mes contra mes). */
export const HISTORY_DAYS = 90;

/* ── Ventas ────────────────────────────────────────────────────────────────*/

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

/** Historial de los últimos 90 días, con numeración consecutiva. */
export function createSales(): Sale[] {
  rand = mulberry32(20260815);
  const today = startOfToday();
  const drafts: Omit<Sale, "number" | "id">[] = [];

  for (let dayOffset = HISTORY_DAYS - 1; dayOffset >= 0; dayOffset--) {
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

  const start = 2000;
  return drafts.map((d, i) => ({
    ...d,
    id: `s-${start + i}`,
    number: start + i,
  }));
}

/* ── Gastos (salidas de dinero) ────────────────────────────────────────────*/

interface ExpenseDraft {
  dateISO: string;
  category: ExpenseCategoryId;
  description: string;
  supplier?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: "Pagado" | "Pendiente";
  dueDateISO?: string;
  employeeId: string;
}

const at = (day: Date, hour: number, minute: number) => {
  const d = new Date(day);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

/**
 * Gastos típicos de un bar de barrio durante los últimos 90 días:
 * compras a proveedores, nómina quincenal, arriendo, servicios públicos,
 * mantenimiento, música de fin de semana y retiros de la propietaria.
 */
export function createExpenses(): Expense[] {
  rand = mulberry32(77030815);
  const today = startOfToday();
  const drafts: ExpenseDraft[] = [];

  for (let dayOffset = HISTORY_DAYS - 1; dayOffset >= 0; dayOffset--) {
    const day = new Date(today);
    day.setDate(day.getDate() - dayOffset);
    const dom = day.getDate();
    const dow = day.getDay();
    const daysAgo = dayOffset;

    // Compra fuerte de cerveza los martes
    if (dow === 2) {
      const pendiente = daysAgo < 5;
      drafts.push({
        dateISO: at(day, 10, between(5, 55)),
        category: "proveedores",
        description: "Compra de cerveza",
        supplier: suppliers.cerveza,
        amount: around(2100000, 380000),
        paymentMethod: pendiente ? "Transferencia" : "Transferencia",
        status: pendiente ? "Pendiente" : "Pagado",
        dueDateISO: pendiente
          ? at(new Date(day.getTime() + 7 * 86400000), 12, 0)
          : undefined,
        employeeId: "e-1",
      });
    }

    // Licores y gaseosas los viernes
    if (dow === 5) {
      drafts.push({
        dateISO: at(day, 11, between(5, 55)),
        category: "proveedores",
        description: "Compra de licores",
        supplier: suppliers.licores,
        amount: around(920000, 190000),
        paymentMethod: "Efectivo",
        status: "Pagado",
        employeeId: "e-1",
      });
      drafts.push({
        dateISO: at(day, 12, between(5, 55)),
        category: "proveedores",
        description: "Gaseosas y agua",
        supplier: suppliers.gaseosas,
        amount: around(260000, 60000),
        paymentMethod: "Efectivo",
        status: "Pagado",
        employeeId: "e-4",
      });
    }

    // Hielo y desechables los sábados
    if (dow === 6) {
      drafts.push({
        dateISO: at(day, 15, between(5, 55)),
        category: "proveedores",
        description: "Hielo y desechables",
        supplier: suppliers.hielo,
        amount: around(180000, 40000),
        paymentMethod: "Efectivo",
        status: "Pagado",
        employeeId: "e-4",
      });
      // Música en vivo / DJ del fin de semana
      drafts.push({
        dateISO: at(day, 23, between(10, 50)),
        category: "eventos",
        description: "DJ del fin de semana",
        amount: around(330000, 60000),
        paymentMethod: "Efectivo",
        status: "Pagado",
        employeeId: "e-1",
      });
    }

    // Snacks y picada los jueves
    if (dow === 4) {
      drafts.push({
        dateISO: at(day, 13, between(5, 55)),
        category: "proveedores",
        description: "Snacks y picada",
        supplier: suppliers.snacks,
        amount: around(320000, 70000),
        paymentMethod: "Efectivo",
        status: "Pagado",
        employeeId: "e-1",
      });
    }

    // Arriendo del local
    if (dom === 5) {
      drafts.push({
        dateISO: at(day, 9, 15),
        category: "arriendo",
        description: "Arriendo del local",
        amount: 2800000,
        paymentMethod: "Transferencia",
        status: "Pagado",
        employeeId: "e-1",
      });
    }

    // Nómina quincenal
    if (dom === 15 || dom === 30) {
      drafts.push({
        dateISO: at(day, 18, 0),
        category: "nomina",
        description: `Nómina quincena (${dom === 15 ? "1 al 15" : "16 al 30"})`,
        amount: around(1900000, 120000),
        paymentMethod: "Transferencia",
        status: "Pagado",
        employeeId: "e-1",
      });
    }

    // Servicios públicos
    if (dom === 8) {
      drafts.push({
        dateISO: at(day, 10, 30),
        category: "servicios",
        description: "Internet y TV",
        amount: 119900,
        paymentMethod: "Transferencia",
        status: "Pagado",
        employeeId: "e-1",
      });
    }
    if (dom === 12) {
      const pendiente = daysAgo < 6;
      drafts.push({
        dateISO: at(day, 11, 10),
        category: "servicios",
        description: "Energía eléctrica",
        amount: around(980000, 90000),
        paymentMethod: "Transferencia",
        status: pendiente ? "Pendiente" : "Pagado",
        dueDateISO: pendiente
          ? at(new Date(day.getTime() + 9 * 86400000), 12, 0)
          : undefined,
        employeeId: "e-1",
      });
    }
    if (dom === 18) {
      drafts.push({
        dateISO: at(day, 11, 40),
        category: "servicios",
        description: "Acueducto y alcantarillado",
        amount: around(280000, 40000),
        paymentMethod: "Transferencia",
        status: "Pagado",
        employeeId: "e-1",
      });
    }
    if (dom === 22) {
      drafts.push({
        dateISO: at(day, 12, 20),
        category: "servicios",
        description: "Gas del local",
        amount: around(95000, 20000),
        paymentMethod: "Efectivo",
        status: "Pagado",
        employeeId: "e-4",
      });
    }

    // Mantenimiento ocasional
    if (rand() < 0.045) {
      const trabajos = [
        "Mantenimiento de la nevera",
        "Reparación del equipo de sonido",
        "Aseo y fumigación",
        "Arreglo de sillas y mesas",
        "Cambio de bombillos y luces",
      ];
      drafts.push({
        dateISO: at(day, between(9, 16), between(0, 59)),
        category: "mantenimiento",
        description: trabajos[Math.floor(rand() * trabajos.length)],
        amount: around(280000, 140000),
        paymentMethod: "Efectivo",
        status: "Pagado",
        employeeId: "e-1",
      });
    }

    // Retiro de la propietaria
    if (dom === 20) {
      drafts.push({
        dateISO: at(day, 17, 0),
        category: "retiros",
        description: "Retiro de la propietaria",
        amount: around(2000000, 300000),
        paymentMethod: "Efectivo",
        status: "Pagado",
        employeeId: "e-1",
      });
    }
  }

  drafts.sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));

  return drafts.map((d, i) => ({
    ...d,
    id: `g-${600 + i}`,
    number: 600 + i,
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
