import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

type Accent = "brand" | "emerald" | "sky" | "violet" | "rose" | "slate";

const accents: Record<Accent, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function StatCard({
  label,
  value,
  icon,
  accent = "brand",
  delta,
  hint,
  footer,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent?: Accent;
  /** Variación porcentual frente al periodo anterior */
  delta?: number;
  hint?: string;
  footer?: ReactNode;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <article className="card group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <p className="tabular mt-2 text-[26px] leading-none font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-200 group-hover:scale-105 ${accents[accent]}`}
        >
          {icon}
        </span>
      </div>

      {(delta !== undefined || hint) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {delta !== undefined && (
            <span
              className={[
                "tabular inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                up
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700",
              ].join(" ")}
            >
              {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {up ? "+" : ""}
              {delta.toFixed(1).replace(".", ",")} %
            </span>
          )}
          {hint && <span className="text-xs text-slate-500">{hint}</span>}
        </div>
      )}

      {footer && <div className="mt-3">{footer}</div>}
    </article>
  );
}
