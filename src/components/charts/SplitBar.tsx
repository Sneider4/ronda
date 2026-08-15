"use client";

/**
 * Barra apilada + leyenda para el reparto entre métodos de pago.
 * Los cuatro colores están validados para daltonismo sobre fondo claro y cada
 * segmento lleva su valor en la leyenda (nunca se identifica solo por color).
 */

export const VIZ_COLORS = [
  "var(--viz-1)",
  "var(--viz-2)",
  "var(--viz-3)",
  "var(--viz-4)",
];

export interface SplitSegment {
  id: string;
  label: string;
  value: number;
  display: string;
  caption?: string;
}

export function SplitBar({
  segments,
  height = 14,
}: {
  segments: SplitSegment[];
  height?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <div>
      <div className="flex w-full gap-[2px]" style={{ height }}>
        {segments.map((s, i) => (
          <div
            key={s.id}
            title={`${s.label}: ${s.display}`}
            className="first:rounded-l-full last:rounded-r-full transition-all duration-500"
            style={{
              width: `${Math.max((s.value / total) * 100, 1.5)}%`,
              backgroundColor: VIZ_COLORS[i % VIZ_COLORS.length],
            }}
          />
        ))}
      </div>

      <ul className="mt-4 space-y-2.5">
        {segments.map((s, i) => (
          <li key={s.id} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: VIZ_COLORS[i % VIZ_COLORS.length] }}
              />
              <span className="truncate text-[13.5px] text-slate-700">{s.label}</span>
              {s.caption && (
                <span className="tabular shrink-0 text-[11.5px] text-slate-400">
                  {s.caption}
                </span>
              )}
            </span>
            <span className="tabular shrink-0 text-[13px] font-semibold text-slate-900">
              {s.display}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
