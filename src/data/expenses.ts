import type { ExpenseCategory, ExpenseCategoryId } from "@/types";

export const expenseCategories: ExpenseCategory[] = [
  {
    id: "proveedores",
    name: "Proveedores",
    emoji: "🚚",
    chip: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  {
    id: "nomina",
    name: "Nómina",
    emoji: "👥",
    chip: "bg-sky-50 text-sky-800 ring-sky-200",
  },
  {
    id: "arriendo",
    name: "Arriendo",
    emoji: "🏠",
    chip: "bg-violet-50 text-violet-800 ring-violet-200",
  },
  {
    id: "servicios",
    name: "Servicios",
    emoji: "💡",
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  {
    id: "mantenimiento",
    name: "Mantenimiento",
    emoji: "🔧",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  {
    id: "eventos",
    name: "Música y eventos",
    emoji: "🎶",
    chip: "bg-rose-50 text-rose-800 ring-rose-200",
  },
  {
    id: "retiros",
    name: "Retiros de la propietaria",
    emoji: "👛",
    chip: "bg-indigo-50 text-indigo-800 ring-indigo-200",
    isOwnerDraw: true,
  },
  {
    id: "otros",
    name: "Otros",
    emoji: "📌",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
  },
];

export const expenseCategoryById = (id: ExpenseCategoryId) =>
  expenseCategories.find((c) => c.id === id) ?? expenseCategories[7];

/** Proveedores típicos de un bar de barrio, para que los datos se sientan reales. */
export const suppliers = {
  cerveza: "Distribuidora Bavaria",
  licores: "Licores del Centro",
  gaseosas: "Postobón",
  hielo: "Hielo Polar",
  snacks: "Snacks La 45",
};
