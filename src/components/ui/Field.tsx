"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

const base =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-200 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-[13px] font-medium text-slate-700">
          {label}
        </span>
      )}
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Input({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${base} h-10 ${className}`} {...rest} />;
}

export function Select({
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${base} h-10 cursor-pointer pr-8 ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function SearchInput({
  icon,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      )}
      <input className={`${base} h-10 ${icon ? "pl-9" : ""}`} {...rest} />
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className = "",
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
}) {
  return (
    <div
      className={`no-scrollbar inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={[
              "rounded-lg px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-all duration-150",
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
