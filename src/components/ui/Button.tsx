"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "success";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-brand-400 to-brand-500 text-ink-950 shadow-sm shadow-brand-600/25 hover:from-brand-300 hover:to-brand-400 active:from-brand-500 active:to-brand-600 font-semibold",
  secondary:
    "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-300 shadow-sm",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger:
    "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-sm shadow-rose-600/25",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-sm shadow-emerald-600/25",
  dark: "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-5 text-[15px] gap-2 rounded-xl",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
}

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconRight,
  block,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none",
        "active:scale-[0.98]",
        variants[variant],
        sizes[size],
        block ? "w-full" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

export function IconButton({
  className = "",
  children,
  label,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors",
        "hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
