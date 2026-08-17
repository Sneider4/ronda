"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CircleAlert,
  PackagePlus,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { CategoryId, Product } from "@/types";
import { categories, categoryById } from "@/data/catalog";
import { useDemo } from "@/store/demo-store";
import { money, number as fmtNumber } from "@/lib/format";
import {
  inventoryValue,
  lowStock,
  pendingEntry,
  pendingUnits,
  potentialRevenue,
  stockState,
} from "@/services/analytics";
import { stockDisplay, stockMessage } from "@/lib/stock";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, SearchInput, Segmented } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";

type Filter = "todos" | CategoryId;
type StateFilter = "todos" | "bajo" | "agotado" | "negativo";

export default function InventarioPage() {
  const { products, restock, toast } = useDemo();
  const [filter, setFilter] = useState<Filter>("todos");
  const [stateFilter, setStateFilter] = useState<StateFilter>("todos");
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<Product | null>(null);
  const [units, setUnits] = useState(24);

  const alerts = lowStock(products);
  const outOfStock = products.filter((p) => p.stock === 0);
  const porIngresar = pendingEntry(products);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const byCat = filter === "todos" || p.category === filter;
      const byQuery = !q || p.name.toLowerCase().includes(q);
      const state = stockState(p);
      const byState = stateFilter === "todos" || state === stateFilter;
      return byCat && byQuery && byState;
    });
  }, [products, filter, query, stateFilter]);

  const confirmRestock = () => {
    if (!target) return;
    restock(target.id, units);
    toast({
      title: "Inventario actualizado",
      description: `Se agregaron ${units} unidades de ${target.name}.`,
      variant: "success",
    });
    setTarget(null);
  };

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Productos en catálogo"
          value={fmtNumber(products.length)}
          icon={<Boxes size={19} />}
          accent="slate"
          hint={`${categories.length} categorías`}
        />
        <StatCard
          label="Valor del inventario"
          value={money(inventoryValue(products))}
          icon={<TrendingUp size={19} />}
          accent="emerald"
          hint={`${money(potentialRevenue(products))} si se vende todo`}
        />
        <StatCard
          label="Productos por reponer"
          value={fmtNumber(alerts.length)}
          icon={<AlertTriangle size={19} />}
          accent="brand"
          hint="Por debajo del mínimo"
        />
        {porIngresar.length > 0 ? (
          <StatCard
            label="Vendidos sin ingresar"
            value={fmtNumber(pendingUnits(products))}
            icon={<PackagePlus size={19} />}
            accent="rose"
            hint={`${porIngresar.length} productos por cuadrar`}
          />
        ) : (
          <StatCard
            label="Agotados"
            value={fmtNumber(outOfStock.length)}
            icon={<XCircle size={19} />}
            accent="rose"
            hint="Se pueden vender igual"
          />
        )}
      </section>

      {/* Productos vendidos sin existencias: falta ingresar el surtido */}
      {porIngresar.length > 0 && (
        <Card className="border-rose-200 bg-rose-50/60">
          <CardHeader
            title="Falta ingresar mercancía"
            subtitle="Se vendieron productos que todavía no están cargados en el inventario"
            icon={<PackagePlus size={17} />}
          />
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {porIngresar.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl bg-white p-3.5 ring-1 ring-rose-200/70"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-lg">
                  {p.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-slate-900">
                    {p.name}
                  </p>
                  <p className="tabular text-[12px] text-rose-700">
                    Debe ingresar {Math.abs(p.stock)} unidades
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    setTarget(p);
                    setUnits(Math.abs(p.stock) + p.minStock);
                  }}
                >
                  Ingresar
                </Button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12.5px] leading-relaxed text-slate-600">
            El sistema nunca frena una venta por falta de inventario: la
            registra y deja el producto en negativo. Cuando cargue el surtido,
            esas unidades se descuentan solas y el producto vuelve a cuadrar.
          </p>
        </Card>
      )}

      {/* Alertas — el argumento comercial */}
      {alerts.length > 0 && (
        <section className="card overflow-hidden border-0 bg-ink-950 p-0">
          <div className="grain flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
            <div className="lg:w-72 lg:shrink-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-400/15 px-3 py-1 text-[11.5px] font-semibold tracking-wide text-brand-300 uppercase">
                <CircleAlert size={13} /> Alertas de inventario
              </span>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">
                {alerts.length} productos necesitan reposición
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
                El sistema avisa antes de que un producto se acabe, para que
                nunca haya que decirle a un cliente “no hay”.
              </p>
            </div>

            <ul className="grid flex-1 gap-3 sm:grid-cols-2">
              {alerts.slice(0, 6).map((p) => {
                const agotado = p.stock <= 0;
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.07] p-3.5 ring-1 ring-white/10 transition-colors hover:bg-white/[0.12]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg">
                      {p.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-white">
                        {p.name}
                      </p>
                      <p className="text-[12px] text-white/50">
                        {stockMessage(p, stockState(p))}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setTarget(p);
                        setUnits(Math.max(p.minStock, 12));
                      }}
                      className={[
                        "rounded-lg px-2.5 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors",
                        agotado
                          ? "bg-rose-500 text-white hover:bg-rose-400"
                          : "bg-brand-400 text-ink-950 hover:bg-brand-300",
                      ].join(" ")}
                    >
                      Reponer
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Tabla de existencias */}
      <Card padded={false}>
        <div className="flex flex-col gap-4 p-5">
          <CardHeader
            title="Existencias"
            subtitle="Control de stock por producto"
            className="mb-0"
          />
          <div className="flex flex-col gap-3">
            <Segmented<Filter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: "todos", label: "Todas" },
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Segmented<StateFilter>
                value={stateFilter}
                onChange={setStateFilter}
                options={[
                  { value: "todos", label: "Todo el stock" },
                  { value: "bajo", label: "Stock bajo" },
                  { value: "agotado", label: "Agotados" },
                  { value: "negativo", label: "Por cuadrar" },
                ]}
              />
              <SearchInput
                icon={<Search size={15} />}
                placeholder="Buscar producto…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3">Existencias</th>
                <th className="px-5 py-3 text-center">Stock mínimo</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Precio de venta</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visible.map((p) => {
                const state = stockState(p);
                const cat = categoryById(p.category);
                const display = stockDisplay[state];
                const ratio = Math.min(
                  100,
                  Math.max(0, (p.stock / Math.max(p.minStock * 2, 1)) * 100),
                );
                return (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-lg ring-1 ring-slate-100 ring-inset">
                          {p.emoji}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-semibold text-slate-900">
                            {p.name}
                          </p>
                          <p className="text-[12px] text-slate-500">
                            {p.presentation}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset ${cat.chip}`}
                      >
                        {cat.emoji} {cat.name}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="w-40">
                        <p
                          className={`tabular text-[13.5px] font-semibold ${
                            state === "negativo" ? "text-rose-700" : "text-slate-900"
                          }`}
                        >
                          {p.stock} unidades
                        </p>
                        {state === "negativo" ? (
                          <p className="text-[11.5px] text-rose-600">
                            Faltan {Math.abs(p.stock)} por ingresar
                          </p>
                        ) : (
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${display.bar}`}
                              style={{ width: `${Math.max(ratio, 3)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="tabular px-5 py-3 text-center text-[13.5px] text-slate-600">
                      {p.minStock}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={display.tone} dot>
                        {display.label}
                      </Badge>
                    </td>
                    <td className="tabular px-5 py-3 text-right text-[13.5px] font-semibold text-slate-900">
                      {money(p.price)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        size="sm"
                        icon={<PackagePlus size={14} />}
                        onClick={() => {
                          setTarget(p);
                          setUnits(Math.max(p.minStock, 12));
                        }}
                      >
                        Reponer
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {visible.length === 0 && (
            <div className="p-5">
              <EmptyState
                title="Sin resultados"
                description="Pruebe con otro nombre o cambie los filtros de categoría."
              />
            </div>
          )}
        </div>
      </Card>

      {/* Modal de reposición */}
      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        size="sm"
        title={target ? `Reponer ${target.name}` : ""}
        subtitle="Registre la mercancía que acaba de llegar"
        icon={<PackagePlus size={18} />}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setTarget(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={confirmRestock}>
              Agregar {units} unidades
            </Button>
          </div>
        }
      >
        {target && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100 ring-inset">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl ring-1 ring-slate-200">
                {target.emoji}
              </span>
              <div>
                <p className="text-[14px] font-semibold text-slate-900">
                  {target.name}
                </p>
                <p className="text-[12.5px] text-slate-500">
                  Existencias actuales: {target.stock} · mínimo {target.minStock}
                </p>
                {target.stock < 0 && (
                  <p className="text-[12.5px] font-medium text-rose-600">
                    {Math.abs(target.stock)} ya se vendieron sin ingresar
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-medium text-slate-700">
                Cantidad recibida
              </p>
              <div className="flex gap-2">
                {[6, 12, 24, 30].map((n) => (
                  <button
                    key={n}
                    onClick={() => setUnits(n)}
                    className={[
                      "tabular flex-1 rounded-xl py-2.5 text-[13px] font-semibold ring-1 transition-all",
                      units === n
                        ? "bg-slate-900 text-white ring-slate-900"
                        : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Field label="O escriba otra cantidad">
              <Input
                type="number"
                min={1}
                value={units}
                onChange={(e) => setUnits(Math.max(1, Number(e.target.value)))}
              />
            </Field>

            <p className="tabular rounded-lg bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-800">
              Quedará con {target.stock + units} unidades
              {target.stock < 0 &&
                ` (ya descontadas las ${Math.abs(target.stock)} que se vendieron)`}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
