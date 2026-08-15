import type { Category, CategoryId, Product } from "@/types";

export const BUSINESS = {
  /** Nombre comercial del establecimiento del demo */
  name: "Bar La Ronda",
  tagline: "Bar & Cantina",
  nit: "DEMO",
  address: "Cra. 13 #45-18, Bogotá D.C.",
  phone: "300 000 0000",
  owner: "Propietaria",
};

export const categories: Category[] = [
  {
    id: "cervezas",
    name: "Cervezas",
    emoji: "🍺",
    chip: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  {
    id: "licores",
    name: "Licores",
    emoji: "🥃",
    chip: "bg-orange-50 text-orange-800 ring-orange-200",
  },
  {
    id: "cocteles",
    name: "Cócteles",
    emoji: "🍹",
    chip: "bg-rose-50 text-rose-800 ring-rose-200",
  },
  {
    id: "bebidas",
    name: "Bebidas",
    emoji: "🥤",
    chip: "bg-sky-50 text-sky-800 ring-sky-200",
  },
  {
    id: "snacks",
    name: "Snacks",
    emoji: "🍟",
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
];

export const categoryById = (id: CategoryId) =>
  categories.find((c) => c.id === id) ?? categories[0];

/**
 * Catálogo del bar. Precios y presentaciones típicas de un bar de barrio
 * en Colombia (valores en pesos colombianos).
 */
export const products: Product[] = [
  // ── Cervezas ───────────────────────────────────────────────────────────
  { id: "p-01", name: "Club Colombia Dorada", presentation: "Botella 330 ml", category: "cervezas", price: 7000, cost: 4200, stock: 48, minStock: 24, emoji: "🍺", active: true },
  { id: "p-02", name: "Águila", presentation: "Botella 330 ml", category: "cervezas", price: 6000, cost: 3500, stock: 12, minStock: 24, emoji: "🍺", active: true },
  { id: "p-03", name: "Águila Light", presentation: "Botella 330 ml", category: "cervezas", price: 6000, cost: 3500, stock: 30, minStock: 24, emoji: "🍺", active: true },
  { id: "p-04", name: "Poker", presentation: "Botella 330 ml", category: "cervezas", price: 6000, cost: 3400, stock: 36, minStock: 24, emoji: "🍺", active: true },
  { id: "p-05", name: "Corona", presentation: "Botella 355 ml", category: "cervezas", price: 10000, cost: 6500, stock: 3, minStock: 12, emoji: "🍺", active: true },
  { id: "p-06", name: "Costeñita", presentation: "Botella 269 ml", category: "cervezas", price: 4500, cost: 2600, stock: 60, minStock: 24, emoji: "🍺", active: true },
  { id: "p-07", name: "Heineken", presentation: "Botella 330 ml", category: "cervezas", price: 10000, cost: 6800, stock: 18, minStock: 12, emoji: "🍺", active: true },
  { id: "p-08", name: "Budweiser", presentation: "Lata 330 ml", category: "cervezas", price: 8000, cost: 5200, stock: 22, minStock: 12, emoji: "🍺", active: true },

  // ── Licores ────────────────────────────────────────────────────────────
  { id: "p-09", name: "Ron Medellín Añejo", presentation: "Trago", category: "licores", price: 12000, cost: 6000, stock: 8, minStock: 6, emoji: "🥃", active: true },
  { id: "p-10", name: "Ron Viejo de Caldas", presentation: "Media botella", category: "licores", price: 45000, cost: 28000, stock: 6, minStock: 4, emoji: "🍾", active: true },
  { id: "p-11", name: "Aguardiente Antioqueño", presentation: "Media botella", category: "licores", price: 38000, cost: 24000, stock: 14, minStock: 6, emoji: "🍾", active: true },
  { id: "p-12", name: "Aguardiente Néctar", presentation: "Trago", category: "licores", price: 8000, cost: 3800, stock: 26, minStock: 10, emoji: "🥃", active: true },
  { id: "p-13", name: "Whisky Old Parr", presentation: "Trago", category: "licores", price: 18000, cost: 11000, stock: 0, minStock: 4, emoji: "🥃", active: true },
  { id: "p-14", name: "Tequila José Cuervo", presentation: "Trago", category: "licores", price: 15000, cost: 8500, stock: 9, minStock: 6, emoji: "🥃", active: true },
  { id: "p-15", name: "Vodka Smirnoff", presentation: "Trago", category: "licores", price: 13000, cost: 7000, stock: 11, minStock: 6, emoji: "🥃", active: true },

  // ── Cócteles ───────────────────────────────────────────────────────────
  { id: "p-16", name: "Margarita", presentation: "Copa 300 ml", category: "cocteles", price: 18000, cost: 7500, stock: 40, minStock: 10, emoji: "🍸", active: true },
  { id: "p-17", name: "Mojito", presentation: "Vaso 350 ml", category: "cocteles", price: 16000, cost: 6200, stock: 40, minStock: 10, emoji: "🍹", active: true },
  { id: "p-18", name: "Cuba Libre", presentation: "Vaso 350 ml", category: "cocteles", price: 14000, cost: 5800, stock: 35, minStock: 10, emoji: "🥤", active: true },
  { id: "p-19", name: "Michelada", presentation: "Vaso 400 ml", category: "cocteles", price: 9000, cost: 3600, stock: 45, minStock: 10, emoji: "🍺", active: true },
  { id: "p-20", name: "Piña Colada", presentation: "Copa 350 ml", category: "cocteles", price: 17000, cost: 6800, stock: 8, minStock: 10, emoji: "🍍", active: true },
  { id: "p-21", name: "Coctel de la casa", presentation: "Copa 350 ml", category: "cocteles", price: 20000, cost: 7900, stock: 25, minStock: 8, emoji: "🍸", active: true },

  // ── Bebidas ────────────────────────────────────────────────────────────
  { id: "p-22", name: "Agua Cristal", presentation: "Botella 600 ml", category: "bebidas", price: 4000, cost: 1800, stock: 54, minStock: 20, emoji: "💧", active: true },
  { id: "p-23", name: "Gaseosa Coca-Cola", presentation: "Botella 400 ml", category: "bebidas", price: 5000, cost: 2400, stock: 42, minStock: 20, emoji: "🥤", active: true },
  { id: "p-24", name: "Gaseosa Colombiana", presentation: "Botella 400 ml", category: "bebidas", price: 5000, cost: 2400, stock: 16, minStock: 20, emoji: "🥤", active: true },
  { id: "p-25", name: "Jugo Hit", presentation: "Botella 350 ml", category: "bebidas", price: 5500, cost: 2600, stock: 28, minStock: 12, emoji: "🧃", active: true },
  { id: "p-26", name: "Energizante Vive100", presentation: "Lata 380 ml", category: "bebidas", price: 6000, cost: 3100, stock: 24, minStock: 12, emoji: "⚡", active: true },

  // ── Snacks ─────────────────────────────────────────────────────────────
  { id: "p-27", name: "Papas Margarita", presentation: "Paquete 105 g", category: "snacks", price: 5000, cost: 2700, stock: 32, minStock: 15, emoji: "🍟", active: true },
  { id: "p-28", name: "Maní salado", presentation: "Porción 80 g", category: "snacks", price: 4000, cost: 1700, stock: 26, minStock: 15, emoji: "🥜", active: true },
  { id: "p-29", name: "Chicharrón", presentation: "Porción", category: "snacks", price: 7000, cost: 3200, stock: 5, minStock: 10, emoji: "🥓", active: true },
  { id: "p-30", name: "Empanadas x3", presentation: "Porción", category: "snacks", price: 9000, cost: 4100, stock: 18, minStock: 10, emoji: "🥟", active: true },
  { id: "p-31", name: "Alitas BBQ x6", presentation: "Porción", category: "snacks", price: 26000, cost: 13500, stock: 12, minStock: 6, emoji: "🍗", active: true },
  { id: "p-32", name: "Picada personal", presentation: "Bandeja", category: "snacks", price: 22000, cost: 10500, stock: 10, minStock: 6, emoji: "🍖", active: true },
];

/** Peso de venta de cada producto: define qué tanto se vende (datos coherentes). */
export const salesWeight: Record<string, number> = {
  "p-01": 30, // Club Colombia — el más vendido
  "p-02": 26, // Águila
  "p-04": 22, // Poker
  "p-09": 14, // Ron Medellín
  "p-05": 12, // Corona
  "p-06": 11,
  "p-03": 10,
  "p-12": 10,
  "p-19": 9,
  "p-23": 9,
  "p-22": 9,
  "p-17": 8,
  "p-11": 7,
  "p-07": 6,
  "p-16": 6,
  "p-08": 5,
  "p-18": 5,
  "p-27": 5,
  "p-24": 4,
  "p-13": 4,
  "p-31": 4,
  "p-28": 3,
  "p-30": 3,
  "p-14": 3,
  "p-15": 3,
  "p-21": 3,
  "p-25": 3,
  "p-26": 2,
  "p-10": 2,
  "p-32": 2,
  "p-20": 2,
  "p-29": 2,
};
