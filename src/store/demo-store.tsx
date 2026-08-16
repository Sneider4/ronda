"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  BarTable,
  CashSession,
  Expense,
  PaymentMethod,
  Product,
  Sale,
  TableStatus,
  Toast,
} from "@/types";
import {
  createCashSession,
  createExpenses,
  createProducts,
  createSales,
  createTables,
} from "@/data/seed";

/* ────────────────────────────────────────────────────────────────────────────
 * Estado de la demostración.
 *
 * Toda la aplicación trabaja contra este store. El día que exista un backend
 * real, basta con reemplazar el cuerpo de estas acciones por llamados HTTP:
 * la interfaz no cambia.
 * ──────────────────────────────────────────────────────────────────────────*/

interface CloseAccountInput {
  paymentMethod: PaymentMethod;
  tip?: number;
  discount?: number;
  employeeId?: string;
}

interface DemoState {
  products: Product[];
  tables: BarTable[];
  sales: Sale[];
  expenses: Expense[];
  cash: CashSession;
  toasts: Toast[];
  saveExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  payExpense: (expenseId: string) => void;
  nextExpenseNumber: () => number;
  addToTable: (tableId: string, productId: string, qty?: number) => void;
  setItemQty: (tableId: string, itemId: string, qty: number) => void;
  removeItem: (tableId: string, itemId: string) => void;
  setTableStatus: (tableId: string, status: TableStatus) => void;
  assignWaiter: (tableId: string, waiterId: string) => void;
  reserveTable: (tableId: string, name: string, time: string) => void;
  releaseTable: (tableId: string) => void;
  closeAccount: (tableId: string, input: CloseAccountInput) => Sale | null;
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  restock: (productId: string, units: number) => void;
  closeCash: (countedAmount: number) => void;
  reopenCash: () => void;
  resetDemo: () => void;
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const DemoContext = createContext<DemoState | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function DemoProvider({ children }: { children: ReactNode }) {
  // Los datos se generan en el cliente para que las horas mostradas coincidan
  // siempre con la zona horaria del equipo donde se hace la demostración.
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<Product[]>(() => createProducts());
  const [tables, setTables] = useState<BarTable[]>(() => createTables());
  const [sales, setSales] = useState<Sale[]>(() => createSales());
  const [expenses, setExpenses] = useState<Expense[]>(() => createExpenses());
  const [cash, setCash] = useState<CashSession>(() => createCashSession());
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => setReady(true), []);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = uid();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addToTable = useCallback(
    (tableId: string, productId: string, qty = 1) => {
      setTables((prev) =>
        prev.map((t) => {
          if (t.id !== tableId) return t;
          const product = products.find((p) => p.id === productId);
          if (!product) return t;
          const existing = t.items.find((i) => i.productId === productId);
          const items = existing
            ? t.items.map((i) =>
                i.productId === productId ? { ...i, qty: i.qty + qty } : i,
              )
            : [
                ...t.items,
                {
                  id: `oi-${uid()}`,
                  productId: product.id,
                  name: product.name,
                  emoji: product.emoji,
                  price: product.price,
                  qty,
                  addedAt: new Date().toISOString(),
                },
              ];
          return {
            ...t,
            items,
            status: t.status === "disponible" || t.status === "reservada" ? "ocupada" : t.status,
            openedAt: t.openedAt ?? new Date().toISOString(),
            waiterId: t.waiterId ?? "e-2",
          };
        }),
      );
    },
    [products],
  );

  const setItemQty = useCallback((tableId: string, itemId: string, qty: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              items:
                qty <= 0
                  ? t.items.filter((i) => i.id !== itemId)
                  : t.items.map((i) => (i.id === itemId ? { ...i, qty } : i)),
            }
          : t,
      ),
    );
  }, []);

  const removeItem = useCallback((tableId: string, itemId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, items: t.items.filter((i) => i.id !== itemId) }
          : t,
      ),
    );
  }, []);

  const setTableStatus = useCallback((tableId: string, status: TableStatus) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status } : t)),
    );
  }, []);

  const assignWaiter = useCallback((tableId: string, waiterId: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, waiterId } : t)),
    );
  }, []);

  const reserveTable = useCallback((tableId: string, name: string, time: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: "reservada", reservationName: name, reservationTime: time }
          : t,
      ),
    );
  }, []);

  const releaseTable = useCallback((tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: "disponible",
              items: [],
              openedAt: undefined,
              waiterId: undefined,
              reservationName: undefined,
              reservationTime: undefined,
            }
          : t,
      ),
    );
  }, []);

  const closeAccount = useCallback(
    (tableId: string, input: CloseAccountInput): Sale | null => {
      const table = tables.find((t) => t.id === tableId);
      if (!table || table.items.length === 0) return null;

      const subtotal = table.items.reduce((s, i) => s + i.price * i.qty, 0);
      const discount = input.discount ?? 0;
      const tip = input.tip ?? 0;
      const nextNumber = sales.reduce((m, s) => Math.max(m, s.number), 1000) + 1;

      const sale: Sale = {
        id: `s-${nextNumber}`,
        number: nextNumber,
        dateISO: new Date().toISOString(),
        tableNumber: table.number,
        employeeId: input.employeeId ?? table.waiterId ?? "e-2",
        items: table.items.map((i) => ({ ...i })),
        subtotal,
        discount,
        tip,
        total: subtotal - discount + tip,
        paymentMethod: input.paymentMethod,
        status: "Pagada",
      };

      setSales((prev) => [...prev, sale]);

      // Descarga de inventario
      setProducts((prev) =>
        prev.map((p) => {
          const sold = sale.items
            .filter((i) => i.productId === p.id)
            .reduce((s, i) => s + i.qty, 0);
          return sold ? { ...p, stock: Math.max(0, p.stock - sold) } : p;
        }),
      );

      // La mesa queda libre
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                status: "disponible",
                items: [],
                openedAt: undefined,
                waiterId: undefined,
              }
            : t,
        ),
      );

      return sale;
    },
    [sales, tables],
  );

  const saveProduct = useCallback((product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists
        ? prev.map((p) => (p.id === product.id ? product : p))
        : [...prev, product];
    });
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const restock = useCallback((productId: string, units: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + units) } : p,
      ),
    );
  }, []);

  const saveExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => {
      const exists = prev.some((e) => e.id === expense.id);
      const next = exists
        ? prev.map((e) => (e.id === expense.id ? expense : e))
        : [...prev, expense];
      return next.sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));
    });
  }, []);

  const deleteExpense = useCallback((expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  }, []);

  const payExpense = useCallback((expenseId: string) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === expenseId
          ? { ...e, status: "Pagado", dueDateISO: undefined }
          : e,
      ),
    );
  }, []);

  const nextExpenseNumber = useCallback(
    () => expenses.reduce((m, e) => Math.max(m, e.number), 600) + 1,
    [expenses],
  );

  const closeCash = useCallback((countedAmount: number) => {
    setCash((prev) => ({
      ...prev,
      closed: true,
      closedAt: new Date().toISOString(),
      countedAmount,
    }));
  }, []);

  const reopenCash = useCallback(() => {
    setCash(createCashSession());
  }, []);

  const resetDemo = useCallback(() => {
    setProducts(createProducts());
    setTables(createTables());
    setSales(createSales());
    setExpenses(createExpenses());
    setCash(createCashSession());
  }, []);

  const value = useMemo<DemoState>(
    () => ({
      products,
      tables,
      sales,
      expenses,
      cash,
      toasts,
      saveExpense,
      deleteExpense,
      payExpense,
      nextExpenseNumber,
      addToTable,
      setItemQty,
      removeItem,
      setTableStatus,
      assignWaiter,
      reserveTable,
      releaseTable,
      closeAccount,
      saveProduct,
      deleteProduct,
      restock,
      closeCash,
      reopenCash,
      resetDemo,
      toast,
      dismissToast,
    }),
    [
      products, tables, sales, expenses, cash, toasts,
      addToTable, setItemQty, removeItem, setTableStatus, assignWaiter,
      reserveTable, releaseTable, closeAccount, saveProduct, deleteProduct,
      restock, saveExpense, deleteExpense, payExpense, nextExpenseNumber,
      closeCash, reopenCash, resetDemo, toast, dismissToast,
    ],
  );

  return (
    <DemoContext.Provider value={value}>
      {ready ? children : <BootSplash />}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo debe usarse dentro de <DemoProvider>");
  return ctx;
}

function BootSplash() {
  return (
    <div className="grain flex min-h-screen items-center justify-center bg-ink-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 animate-[pop_0.5s_ease-out] rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 shadow-lg shadow-brand-900/40" />
        <p className="text-sm font-medium tracking-wide text-white/70">
          Cargando Ronda…
        </p>
      </div>
    </div>
  );
}
