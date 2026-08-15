"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Menu,
  RotateCcw,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { findNavItem } from "./nav";
import { useDemo } from "@/store/demo-store";
import { lowStock, salesOfDay, totals } from "@/services/analytics";
import { money, weekdayDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const item = findNavItem(pathname);
  const { products, sales, cash, resetDemo, toast } = useDemo();

  const alerts = lowStock(products);
  const today = totals(salesOfDay(sales));

  const [openMenu, setOpenMenu] = useState<"alerts" | "user" | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-semibold tracking-tight text-slate-900">
            {item?.label ?? "Ronda"}
          </h1>
          <p className="hidden truncate text-[12.5px] text-slate-500 sm:block">
            {weekdayDate(new Date())} · {item?.description}
          </p>
        </div>

        <div ref={wrapRef} className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-2 xl:flex">
            <Search size={15} className="text-slate-400" />
            <input
              placeholder="Buscar producto, mesa o venta…"
              className="w-56 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 md:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet size={15} />
            </span>
            <div className="leading-tight">
              <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                Venta de hoy
              </p>
              <p className="tabular text-[13px] font-semibold text-slate-900">
                {money(today.total)}
              </p>
            </div>
          </div>

          {/* Alertas de inventario */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === "alerts" ? null : "alerts")}
              aria-label="Alertas de inventario"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              <Bell size={19} />
              {alerts.length > 0 && (
                <span className="tabular absolute top-1.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {alerts.length}
                </span>
              )}
            </button>

            {openMenu === "alerts" && (
              <div className="absolute right-0 mt-2 w-80 origin-top-right animate-[scale-in_0.16s_ease-out] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-ink-950/10">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Alertas de inventario
                  </p>
                  <p className="text-[12.5px] text-slate-500">
                    {alerts.length} productos necesitan reposición
                  </p>
                </div>
                <ul className="max-h-72 overflow-y-auto">
                  {alerts.slice(0, 6).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 border-b border-slate-50 px-4 py-2.5 last:border-0"
                    >
                      <span className="text-lg">{p.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-slate-800">
                          {p.name}
                        </p>
                        <p className="text-[12px] text-slate-500">
                          Quedan {p.stock} · mínimo {p.minStock}
                        </p>
                      </div>
                      <Badge tone={p.stock === 0 ? "danger" : "warning"} dot>
                        {p.stock === 0 ? "Agotado" : "Stock bajo"}
                      </Badge>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/inventario"
                  onClick={() => setOpenMenu(null)}
                  className="block bg-slate-50 px-4 py-2.5 text-center text-[13px] font-semibold text-brand-700 transition-colors hover:bg-slate-100"
                >
                  Ver inventario completo
                </Link>
              </div>
            )}
          </div>

          {/* Usuario */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === "user" ? null : "user")}
              className="flex items-center gap-2 rounded-xl py-1.5 pr-2 pl-1.5 transition-colors hover:bg-slate-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ink-700 to-ink-900 text-[12px] font-bold text-white">
                CR
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-[13px] font-semibold text-slate-900">
                  Carlos Restrepo
                </span>
                <span className="block text-[11.5px] text-slate-500">
                  Administrador
                </span>
              </span>
              <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
            </button>

            {openMenu === "user" && (
              <div className="absolute right-0 mt-2 w-72 origin-top-right animate-[scale-in_0.16s_ease-out] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-ink-950/10">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Carlos Restrepo
                  </p>
                  <p className="text-[12.5px] text-slate-500">
                    Administrador · Bar La Ronda
                  </p>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-start gap-2.5 rounded-xl bg-brand-50 p-3 ring-1 ring-brand-100 ring-inset">
                    <ShieldCheck size={16} className="mt-0.5 text-brand-700" />
                    <p className="text-[12.5px] leading-relaxed text-brand-900">
                      Versión de demostración con datos de ejemplo. Ninguna
                      operación afecta dinero real.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    resetDemo();
                    setOpenMenu(null);
                    toast({
                      title: "Demostración reiniciada",
                      description: "Mesas, ventas e inventario volvieron al estado inicial.",
                      variant: "info",
                    });
                  }}
                  className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-3 text-left text-[13.5px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <RotateCcw size={16} className="text-slate-400" />
                  Reiniciar datos de la demostración
                </button>
                <div className="border-t border-slate-100 px-4 py-2.5 text-center text-[11.5px] text-slate-400">
                  Caja {cash.closed ? "cerrada" : "abierta"} ·{" "}
                  {money(cash.openingAmount)} de base
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
