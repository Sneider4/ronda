"use client";

import { useState } from "react";
import { useMeasure } from "@/lib/use-measure";
import { moneyCompact } from "@/lib/format";

export interface BarPoint {
  label: string;
  value: number;
  caption?: string;
}

/**
 * Barras verticales de una sola serie (ventas por hora, ventas por día).
 * La barra más alta se resalta: es la lectura que le interesa al dueño del bar.
 */
export function BarSeries({
  points,
  height = 200,
  color = "var(--viz-1)",
  highlightMax = true,
  format = moneyCompact,
  valueFormat,
}: {
  points: BarPoint[];
  height?: number;
  color?: string;
  highlightMax?: boolean;
  format?: (n: number) => string;
  valueFormat?: (n: number) => string;
}) {
  const { ref, width } = useMeasure();
  const [hover, setHover] = useState<number | null>(null);

  const padding = { top: 14, right: 8, bottom: 26, left: 52 };
  const w = Math.max(width, 240);
  const innerW = w - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(...points.map((p) => p.value), 1);
  const niceMax = niceCeil(max);
  const slot = innerW / points.length;
  const barW = Math.min(slot - 8, 42);
  const maxIndex = points.reduce((m, p, i) => (p.value > points[m].value ? i : m), 0);

  const y = (v: number) => padding.top + innerH - (v / niceMax) * innerH;
  const ticks = [0, niceMax / 2, niceMax];
  const active = hover !== null ? points[hover] : null;

  return (
    <div ref={ref} className="relative w-full select-none">
      {width > 0 && (
        <svg width={w} height={height} onMouseLeave={() => setHover(null)}>
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

          {points.map((p, i) => {
            const cx = padding.left + slot * i + slot / 2;
            const barH = Math.max(2, ((p.value / niceMax) * innerH) | 0);
            const isMax = highlightMax && i === maxIndex;
            const isHover = hover === i;
            return (
              <g
                key={p.label + i}
                onMouseEnter={() => setHover(i)}
                style={{ cursor: "default" }}
              >
                <rect
                  x={cx - slot / 2}
                  y={padding.top}
                  width={slot}
                  height={innerH}
                  fill="transparent"
                />
                <rect
                  x={cx - barW / 2}
                  y={padding.top + innerH - barH}
                  width={barW}
                  height={barH}
                  rx={4}
                  fill={color}
                  opacity={isHover ? 1 : isMax ? 0.95 : 0.42}
                  style={{ transition: "opacity 140ms ease" }}
                />
                <text
                  x={cx}
                  y={height - 7}
                  textAnchor="middle"
                  fontSize={11}
                  fill={isHover || isMax ? "#0f172a" : "#94a3b8"}
                  fontWeight={isHover || isMax ? 600 : 400}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {active && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg bg-ink-900 px-3 py-2 text-white shadow-lg"
          style={{
            left: Math.min(
              Math.max(padding.left + slot * hover! + slot / 2, 62),
              w - 62,
            ),
            top: Math.max(y(active.value) - 60, 0),
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
