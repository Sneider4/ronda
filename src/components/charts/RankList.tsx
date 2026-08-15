"use client";

import type { ReactNode } from "react";

export interface RankRow {
  id: string;
  label: string;
  emoji?: string;
  value: number;
  /** Texto que se muestra a la derecha (siempre visible: no hay que adivinar) */
  display: string;
  caption?: ReactNode;
}

/**
 * Ranking horizontal — "lo que más se vende".
 * Barras con valor rotulado: se lee sin pasar el mouse, también impreso.
 */
export function RankList({
  rows,
  color = "var(--viz-2)",
  showRank = true,
}: {
  rows: RankRow[];
  color?: string;
  showRank?: boolean;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <ol className="space-y-3">
      {rows.map((r, i) => (
        <li key={r.id} className="group">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {showRank && (
                <span
                  className={[
                    "tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                    i === 0
                      ? "bg-brand-100 text-brand-800"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  {i + 1}
                </span>
              )}
              {r.emoji && <span className="text-base leading-none">{r.emoji}</span>}
              <span className="truncate text-[13.5px] font-medium text-slate-800">
                {r.label}
              </span>
            </div>
            <span className="tabular shrink-0 text-[13px] font-semibold text-slate-900">
              {r.display}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.max(4, (r.value / max) * 100)}%`,
                  backgroundColor: color,
                  opacity: i === 0 ? 1 : 0.65,
                }}
              />
            </div>
            {r.caption && (
              <span className="tabular shrink-0 text-[11.5px] text-slate-500">
                {r.caption}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
