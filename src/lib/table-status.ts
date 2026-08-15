import type { TableStatus } from "@/types";
import type { Tone } from "@/components/ui/Badge";

export const tableStatusConfig: Record<
  TableStatus,
  {
    label: string;
    tone: Tone;
    /** anillo + fondo de la tarjeta de mesa */
    card: string;
    accent: string;
    dot: string;
  }
> = {
  disponible: {
    label: "Disponible",
    tone: "success",
    card: "bg-white ring-slate-200 hover:ring-emerald-300",
    accent: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  ocupada: {
    label: "Ocupada",
    tone: "warning",
    card: "bg-amber-50/60 ring-amber-200 hover:ring-amber-300",
    accent: "text-amber-700",
    dot: "bg-amber-500",
  },
  "por-pagar": {
    label: "Por pagar",
    tone: "info",
    card: "bg-sky-50/70 ring-sky-200 hover:ring-sky-300",
    accent: "text-sky-700",
    dot: "bg-sky-500",
  },
  reservada: {
    label: "Reservada",
    tone: "violet",
    card: "bg-violet-50/60 ring-violet-200 hover:ring-violet-300",
    accent: "text-violet-700",
    dot: "bg-violet-500",
  },
};

export const paymentIcons: Record<string, string> = {
  Efectivo: "💵",
  Tarjeta: "💳",
  Transferencia: "🏦",
  Nequi: "📲",
};
