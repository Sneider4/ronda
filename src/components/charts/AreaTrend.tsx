"use client";

import { useId, useState } from "react";
import { useMeasure } from "@/lib/use-measure";
import { moneyCompact } from "@/lib/format";

export interface TrendPoint {
  label: string;
  value: number;
  caption?: string;
}

/**
 * Línea + área para la evolución de las ventas.
 * Una sola serie (el título la nombra), con crosshair y tooltip al pasar el mouse.
 */
export function AreaTrend({
  points,
  height = 220,
  color = "var(--viz-1)",
  format = moneyCompact,
  valueFormat,
}: {
  points: TrendPoint[];
  height?: number;
  color?: string;
  /** formato de las etiquetas del eje */
  format?: (n: number) => string;
  /** formato del valor en el tooltip (por defecto, el mismo del eje) */
  valueFormat?: (n: number) => string;
}) {
  const { ref, width } = useMeasure();
  const [hover, setHover] = useState<number | null>(null);
  const gradientId = useId();

  const padding = { top: 14, right: 14, bottom: 26, left: 52 };
  const w = Math.max(width, 240);
  const innerW = w - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(...points.map((p) => p.value), 1);
  const niceMax = niceCeil(max);
  const x = (i: number) =>
    padding.left + (points.length === 1 ? innerW / 2 : (innerW * i) / (points.length - 1));
  const y = (v: number) => padding.top + innerH - (v / niceMax) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${padding.top + innerH} L${x(0)},${
    padding.top + innerH
  } Z`;

  const ticks = [0, niceMax / 2, niceMax];
  const active = hover !== null ? points[hover] : null;

  return (
    <div ref={ref} className="relative w-full select-none">
      {width > 0 && (
        <svg
          width={w}
          height={height}
          role="img"
          aria-label="Evolución de las ventas"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const px = e.clientX - rect.left - padding.left;
            const step = innerW / Math.max(points.length - 1, 1);
            const idx = Math.round(px / step);
            setHover(Math.min(points.length - 1, Math.max(0, idx)));
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={padding.left}
                x2={w - padding.right}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--viz-grid)"
                strokeWidth={1}
              />
              <text
                x={padding.left - 10}
                y={y(t) + 4}
                textAnchor="end"
                fontSize={11}
                fill="#94a3b8"
              >
                {format(t)}
              </text>
            </g>
          ))}

          <path d={area} fill={`url(#${gradientId})`} />
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, i) => (
            <g key={p.label + i}>
              <text
                x={x(i)}
                y={height - 7}
                textAnchor="middle"
                fontSize={11}
                fill={hover === i ? "#0f172a" : "#94a3b8"}
                fontWeight={hover === i ? 600 : 400}
              >
                {p.label}
              </text>
              {hover === i && (
                <line
                  x1={x(i)}
                  x2={x(i)}
                  y1={padding.top}
                  y2={padding.top + innerH}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )}
              <circle
                cx={x(i)}
                cy={y(p.value)}
                r={hover === i ? 5.5 : i === points.length - 1 ? 4.5 : 0}
                fill={color}
                stroke="#fff"
                strokeWidth={2}
              />
            </g>
          ))}
        </svg>
      )}

      {active && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg bg-ink-900 px-3 py-2 text-white shadow-lg"
          style={{
            left: Math.min(Math.max(x(hover!), 60), w - 60),
            top: Math.max(y(active.value) - 62, 0),
          }}
        >
          <p className="text-[11px] font-medium text-white/60">
            {active.caption ?? active.label}
          </p>
          <p className="tabular text-sm font-semibold">
            {(valueFormat ?? format)(active.value)}
          </p>
        </div>
      )}
    </div>
  );
}

function niceCeil(value: number) {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const n = value / base;
  const step = n <= 1.2 ? 1.2 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * base;
}
