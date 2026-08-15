import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`card ${padded ? "p-5" : ""} ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`mb-4 flex items-start justify-between gap-3 ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
      {icon && <div className="text-slate-300">{icon}</div>}
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && (
        <p className="max-w-sm text-[13px] text-slate-500">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
