"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { navGroups } from "./nav";
import { useCurrentUser, useDemo } from "@/store/demo-store";
import {
  lowStock,
  openAmount,
  openTables,
  pendingBills,
} from "@/services/analytics";
import { money } from "@/lib/format";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { tables, products, expenses } = useDemo();
  const { can } = useCurrentUser();

  // Cada rol solo ve las secciones que le corresponden
  const visibleGroups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => can(i.permission)) }))
    .filter((g) => g.items.length > 0);

  const counters = {
    mesas: openTables(tables).length,
    alertas: lowStock(products).length,
    pendientes: pendingBills(expenses).length,
  };

  const content = (
    <div className="grain flex h-full flex-col bg-ink-950">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Link href="/" onClick={onClose} className="transition-opacity hover:opacity-90">
          <Logo />
        </Link>
        <button
          onClick={onClose}
          aria-label="Cerrar menú"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {visibleGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.16em] text-white/30 uppercase">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                const count = item.badge ? counters[item.badge] : 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={[
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150",
                        active
                          ? "bg-white/10 font-semibold text-white"
                          : "font-medium text-white/60 hover:bg-white/5 hover:text-white",
                      ].join(" ")}
                    >
                      {active && (
                        <span className="absolute top-1/2 -left-3 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-400" />
                      )}
                      <Icon
                        size={18}
                        className={
                          active
                            ? "text-brand-400"
                            : "text-white/40 transition-colors group-hover:text-white/70"
                        }
                      />
                      <span className="flex-1">{item.label}</span>
                      {!!count && (
                        <span
                          className={[
                            "tabular rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            item.badge === "alertas"
                              ? "bg-rose-500/15 text-rose-300"
                              : item.badge === "pendientes"
                                ? "bg-sky-400/15 text-sky-300"
                                : "bg-brand-400/15 text-brand-300",
                          ].join(" ")}
                        >
                          {count}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="rounded-xl bg-white/[0.06] p-3.5">
          <p className="text-[11px] font-medium tracking-wide text-white/45 uppercase">
            Consumo en curso
          </p>
          <p className="tabular mt-1 text-lg font-semibold text-white">
            {money(openAmount(tables))}
          </p>
          <p className="mt-0.5 text-[12px] text-white/45">
            {openTables(tables).length} cuentas abiertas
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{content}</aside>

      {/* Móvil / tablet */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-ink-950/60 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[268px] shadow-2xl transition-transform duration-250 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
