"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Search, ShoppingBag } from "lucide-react";
import type { CategoryId } from "@/types";
import { categories } from "@/data/catalog";
import { useDemo } from "@/store/demo-store";
import { money } from "@/lib/format";
import { stockState, tableTotal } from "@/services/analytics";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchInput, Segmented } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";

type Filter = CategoryId | "todos";

export function ProductPicker({
  open,
  onClose,
  tableId,
}: {
  open: boolean;
  onClose: () => void;
  tableId: string | null;
}) {
  const { products, tables, addToTable } = useDemo();
  const [filter, setFilter] = useState<Filter>("todos");
  const [query, setQuery] = useState("");
  const [flash, setFlash] = useState<Record<string, number>>({});

  const table = tables.find((t) => t.id === tableId) ?? null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const byCat = filter === "todos" || p.category === filter;
      const byQuery = !q || p.name.toLowerCase().includes(q);
      return p.active && byCat && byQuery;
    });
  }, [products, filter, query]);

  const add = (productId: string) => {
    if (!tableId) return;
    addToTable(tableId, productId, 1);
    setFlash((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
    setTimeout(
      () =>
        setFlash((prev) => {
          const next = { ...prev };
          if (next[productId] > 1) next[productId] -= 1;
          else delete next[productId];
          return next;
        }),
      1400,
    );
  };

  const itemsCount = table?.items.reduce((s, i) => s + i.qty, 0) ?? 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      icon={<ShoppingBag size={18} />}
      title={table ? `Agregar productos · Mesa ${table.number}` : "Agregar productos"}
      subtitle="Toque un producto para sumarlo a la cuenta"
      bodyClassName="bg-slate-50/60"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[12.5px] text-slate-500">
              {itemsCount} {itemsCount === 1 ? "producto" : "productos"} en la
              cuenta
            </p>
            <p className="tabular text-lg font-semibold text-slate-900">
              {money(table ? tableTotal(table) : 0)}
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={onClose} icon={<Check size={17} />}>
            Listo
          </Button>
        </div>
      }
    >
      <div className="sticky -top-5 z-10 -mx-5 -mt-5 mb-4 space-y-3 border-b border-slate-200/70 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <SearchInput
          icon={<Search size={15} />}
          placeholder="Buscar producto…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          className="w-full"
          options={[
            { value: "todos", label: "Todos" },
            ...categories.map((c) => ({
              value: c.id as Filter,
              label: (
                <span className="flex items-center gap-1.5">
                  <span>{c.emoji}</span>
                  {c.name}
                </span>
              ),
            })),
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((p) => {
          const state = stockState(p);
          const disabled = state === "agotado";
          const added = flash[p.id];
          return (
            <button
              key={p.id}
              disabled={disabled}
              onClick={() => add(p.id)}
              className={[
                "group relative flex flex-col rounded-xl bg-white p-3 text-left ring-1 transition-all duration-150",
                disabled
                  ? "cursor-not-allowed opacity-55 ring-slate-200"
                  : "ring-slate-200 hover:-translate-y-0.5 hover:ring-brand-300 hover:shadow-md active:scale-[0.98]",
                added ? "ring-2 ring-emerald-400" : "",
              ].join(" ")}
            >
              {added && (
                <span className="tabular absolute -top-2 -right-2 z-10 flex h-6 min-w-6 animate-[pop_0.35s_cubic-bezier(0.16,1,0.3,1)] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white shadow">
                  +{added}
                </span>
              )}
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-xl ring-1 ring-slate-100 ring-inset">
                  {p.emoji}
                </span>
                {state === "bajo" && (
                  <Badge tone="warning">Quedan {p.stock}</Badge>
                )}
                {state === "agotado" && <Badge tone="danger">Agotado</Badge>}
              </div>
              <p className="mt-2.5 line-clamp-2 text-[13.5px] leading-tight font-semibold text-slate-900">
                {p.name}
              </p>
              <p className="mt-0.5 text-[11.5px] text-slate-500">{p.presentation}</p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="tabular text-[15px] font-bold text-slate-900">
                  {money(p.price)}
                </span>
                {!disabled && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-brand-500 group-hover:text-ink-950">
                    <Plus size={15} />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {visible.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-500">
          No encontramos productos con ese nombre.
        </p>
      )}

      {table && itemsCount > 0 && (
        <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <p className="mb-2 text-[13px] font-semibold text-slate-900">
            Cuenta de la mesa {table.number}
          </p>
          <ul className="space-y-1.5">
            {table.items.map((i) => (
              <li
                key={i.id}
                className="tabular flex items-center justify-between text-[13px] text-slate-600"
              >
                <span className="truncate">
                  <span className="font-semibold text-slate-900">{i.qty} x</span>{" "}
                  {i.emoji} {i.name}
                </span>
                <span className="font-medium text-slate-800">
                  {money(i.qty * i.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
