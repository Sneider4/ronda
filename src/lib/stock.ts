import type { Product, StockState } from "@/types";
import type { Tone } from "@/components/ui/Badge";

/**
 * Presentación de los estados de inventario.
 * "negativo" es intencional: el bar puede vender aunque el surtido todavía no
 * esté ingresado; el sistema lo deja claro para que después se cuadre.
 */
export const stockDisplay: Record<
  StockState,
  { label: string; tone: Tone; bar: string }
> = {
  disponible: { label: "Disponible", tone: "success", bar: "bg-emerald-500" },
  bajo: { label: "Stock bajo", tone: "warning", bar: "bg-amber-500" },
  agotado: { label: "Agotado", tone: "danger", bar: "bg-rose-500" },
  negativo: { label: "Por cuadrar", tone: "danger", bar: "bg-rose-600" },
};

/** Texto corto para explicarle a la propietaria qué pasa con ese producto */
export function stockMessage(p: Product, state: StockState): string {
  switch (state) {
    case "negativo":
      return `Se vendieron ${Math.abs(p.stock)} sin ingresar al inventario`;
    case "agotado":
      return "Sin existencias registradas";
    case "bajo":
      return `Quedan ${p.stock} · mínimo ${p.minStock}`;
    default:
      return `${p.stock} unidades disponibles`;
  }
}
