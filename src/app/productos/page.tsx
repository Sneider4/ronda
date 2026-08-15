"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, Wine } from "lucide-react";
import type { CategoryId, Product } from "@/types";
import { categories, categoryById } from "@/data/catalog";
import { useDemo } from "@/store/demo-store";
import { money, percent } from "@/lib/format";
import { stockState } from "@/services/analytics";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Field, Input, SearchInput, Segmented, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";

type Filter = "todos" | CategoryId;

const EMOJIS = ["🍺", "🍾", "🥃", "🍸", "🍹", "🥤", "💧", "🧃", "🍟", "🥜", "🍗", "🍖", "🥟", "⚡", "🍍", "🥓"];

const emptyProduct = (): Product => ({
  id: `p-${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  presentation: "",
  category: "cervezas",
  price: 0,
  cost: 0,
  stock: 0,
  minStock: 6,
  emoji: "🍺",
  active: true,
});

export default function ProductosPage() {
  const { products, saveProduct, deleteProduct, toast } = useDemo();
  const [filter, setFilter] = useState<Filter>("todos");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const byCat = filter === "todos" || p.category === filter;
      const byQuery = !q || p.name.toLowerCase().includes(q);
      return byCat && byQuery;
    });
  }, [products, filter, query]);

  const openNew = () => {
    setEditing(emptyProduct());
    setIsNew(true);
  };

  const openEdit = (p: Product) => {
    setEditing({ ...p });
    setIsNew(false);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast({ title: "Escriba el nombre del producto", variant: "warning" });
      return;
    }
    saveProduct({
      ...editing,
      name: editing.name.trim(),
      presentation: editing.presentation.trim() || "Unidad",
    });
    toast({
      title: isNew ? "Producto creado" : "Producto actualizado",
      description: `${editing.name} · ${money(editing.price)}`,
      variant: "success",
    });
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteProduct(toDelete.id);
    toast({
      title: "Producto eliminado",
      description: `${toDelete.name} salió del catálogo.`,
      variant: "info",
    });
    setToDelete(null);
  };

  return (
    <div className="space-y-5">
      <Card padded={false}>
        <div className="flex flex-col gap-4 p-5">
          <CardHeader
            title="Catálogo de productos"
            subtitle={`${products.length} productos activos en la carta`}
            icon={<Wine size={17} />}
            className="mb-0"
            action={
              <Button variant="primary" icon={<Plus size={16} />} onClick={openNew}>
                Nuevo producto
              </Button>
            }
          />
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
            <SearchInput
              icon={<Search size={15} />}
              placeholder="Buscar producto…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="lg:w-72"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3 text-right">Precio</th>
                <th className="px-5 py-3 text-right">Costo</th>
                <th className="px-5 py-3 text-right">Ganancia</th>
                <th className="px-5 py-3 text-center">Stock</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visible.map((p) => {
                const cat = categoryById(p.category);
                const state = stockState(p);
                const margin = p.price - p.cost;
                const marginPct = p.price ? (margin / p.price) * 100 : 0;
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
                    <td className="tabular px-5 py-3 text-right text-[13.5px] font-semibold text-slate-900">
                      {money(p.price)}
                    </td>
                    <td className="tabular px-5 py-3 text-right text-[13.5px] text-slate-500">
                      {money(p.cost)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className="tabular text-[13.5px] font-semibold text-emerald-700">
                        {money(margin)}
                      </p>
                      <p className="tabular text-[11.5px] text-slate-400">
                        {percent(marginPct)}
                      </p>
                    </td>
                    <td className="tabular px-5 py-3 text-center text-[13.5px] text-slate-700">
                      {p.stock}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        tone={
                          state === "agotado"
                            ? "danger"
                            : state === "bajo"
                              ? "warning"
                              : "success"
                        }
                        dot
                      >
                        {state === "agotado"
                          ? "Agotado"
                          : state === "bajo"
                            ? "Stock bajo"
                            : "Disponible"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton label="Editar" onClick={() => openEdit(p)}>
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton
                          label="Eliminar"
                          onClick={() => setToDelete(p)}
                          className="hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={15} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {visible.length === 0 && (
            <div className="p-5">
              <EmptyState
                title="No hay productos con ese filtro"
                description="Cambie la categoría o cree un producto nuevo."
                action={
                  <Button variant="primary" icon={<Plus size={16} />} onClick={openNew}>
                    Nuevo producto
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </Card>

      {/* Formulario */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        size="md"
        title={isNew ? "Nuevo producto" : "Editar producto"}
        subtitle="Los cambios se reflejan de inmediato en la carta y el inventario"
        icon={<Wine size={18} />}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={save}>
              {isNew ? "Crear producto" : "Guardar cambios"}
            </Button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" className="sm:col-span-2">
                <Input
                  value={editing.name}
                  placeholder="Ej: Club Colombia Dorada"
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </Field>
              <Field label="Presentación">
                <Input
                  value={editing.presentation}
                  placeholder="Ej: Botella 330 ml"
                  onChange={(e) =>
                    setEditing({ ...editing, presentation: e.target.value })
                  }
                />
              </Field>
              <Field label="Categoría">
                <Select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      category: e.target.value as CategoryId,
                    })
                  }
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Precio de venta" hint="En pesos colombianos">
                <Input
                  type="number"
                  min={0}
                  step={500}
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({ ...editing, price: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Costo de compra" hint="Para calcular la ganancia">
                <Input
                  type="number"
                  min={0}
                  step={500}
                  value={editing.cost}
                  onChange={(e) =>
                    setEditing({ ...editing, cost: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Existencias">
                <Input
                  type="number"
                  min={0}
                  value={editing.stock}
                  onChange={(e) =>
                    setEditing({ ...editing, stock: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Stock mínimo" hint="Cuándo avisar para reponer">
                <Input
                  type="number"
                  min={0}
                  value={editing.minStock}
                  onChange={(e) =>
                    setEditing({ ...editing, minStock: Number(e.target.value) })
                  }
                />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-medium text-slate-700">Ícono</p>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEditing({ ...editing, emoji: e })}
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-xl text-lg ring-1 transition-all",
                      editing.emoji === e
                        ? "bg-brand-50 ring-2 ring-brand-400"
                        : "bg-white ring-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {editing.price > 0 && (
              <p className="tabular rounded-lg bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-800">
                Ganancia por unidad: {money(editing.price - editing.cost)} (
                {percent(((editing.price - editing.cost) / editing.price) * 100)})
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Confirmación de borrado */}
      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        size="sm"
        title="Eliminar producto"
        subtitle="Esta acción lo saca de la carta y del inventario"
        icon={<Trash2 size={18} />}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Sí, eliminar
            </Button>
          </div>
        }
      >
        {toDelete && (
          <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-4 ring-1 ring-rose-100 ring-inset">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl ring-1 ring-rose-200">
              {toDelete.emoji}
            </span>
            <div>
              <p className="text-[14px] font-semibold text-rose-900">
                {toDelete.name}
              </p>
              <p className="text-[12.5px] text-rose-700">
                {toDelete.stock} unidades en inventario · {money(toDelete.price)}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
