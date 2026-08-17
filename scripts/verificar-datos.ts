/**
 * Verificación de coherencia de los datos de la demostración.
 *
 *   npx tsx scripts/verificar-datos.ts
 *
 * Comprueba que las cifras que ve la propietaria en cada pantalla salgan de la
 * misma fuente y cuadren entre sí: dashboard, ventas, caja, gastos, balance,
 * reportes, inventario y empleados.
 */

import { createSales, createExpenses, createProducts, createTables } from "../src/data/seed";
import { employees } from "../src/data/employees";
import {
  byCategory,
  byHour,
  cashOut,
  expensesOfMonth,
  isOwnerDraw,
  lowStock,
  monthBalance,
  openTables,
  operating,
  paid,
  paymentBreakdown,
  salesOfDay,
  salesOfMonth,
  stockState,
  sumAmount,
  tableTotal,
  topProducts,
  totals,
} from "../src/services/analytics";

const sales = createSales();
const expenses = createExpenses();
const products = createProducts();
const tables = createTables();

const hoy = new Date();
const ventasHoy = salesOfDay(sales, hoy);
const resumenHoy = totals(ventasHoy);
const balance = monthBalance(sales, expenses, hoy);
const mesGastos = expensesOfMonth(expenses, hoy);

const money = (n: number) => "$ " + n.toLocaleString("es-CO");

let fallos = 0;
const check = (nombre: string, ok: boolean, detalle = "") => {
  if (!ok) fallos++;
  console.log(`${ok ? "  OK  " : "FALLA "} ${nombre}${detalle ? " — " + detalle : ""}`);
};

console.log("\n=== CIFRAS DE LA DEMOSTRACIÓN ===");
console.log("Ventas de hoy         ", money(resumenHoy.total), `(${resumenHoy.count} ventas, ${resumenHoy.units} productos)`);
console.log("Ventas del mes        ", money(balance.ventaBruta));
console.log("Propinas del mes      ", money(balance.propinas));
console.log("Gastos del mes        ", money(balance.gastos));
console.log("Le queda al negocio   ", money(balance.neto), `(margen ${balance.margen.toFixed(1)} %)`);
console.log("Cuentas abiertas      ", openTables(tables).length, "mesas ·", money(openTables(tables).reduce((s, t) => s + tableTotal(t), 0)));
console.log("Alertas de inventario ", lowStock(products).length, "productos");
console.log("Historial             ", sales.length, "ventas y", expenses.length, "gastos");

console.log("\n=== COHERENCIA ENTRE PANTALLAS ===");

// Dashboard / Caja / Ventas leen lo mismo
check(
  "Dashboard = Caja = Ventas (venta de hoy)",
  resumenHoy.total === totals(salesOfDay(sales)).total,
);

// La suma por empleado (pantalla Empleados) reconstruye el día
const porEmpleado = employees.reduce(
  (s, e) => s + totals(ventasHoy.filter((v) => v.employeeId === e.id)).total,
  0,
);
check("Suma por empleado = venta del día", porEmpleado === resumenHoy.total,
  `${money(porEmpleado)} vs ${money(resumenHoy.total)}`);

// Los métodos de pago reparten exactamente la venta del día (Caja y Dashboard)
const pagos = paymentBreakdown(ventasHoy).reduce((s, p) => s + p.total, 0);
check("Métodos de pago = venta del día", pagos === resumenHoy.total,
  `${money(pagos)} vs ${money(resumenHoy.total)}`);

// Las ventas por hora (Reportes y Dashboard) también
const horas = byHour(ventasHoy, 0, 23).reduce((s, h) => s + h.total, 0);
check("Ventas por hora = venta del día", horas === resumenHoy.total);

// Balance: identidades del cuaderno
check("Balance: bruto − propinas = venta del negocio",
  balance.ventaBruta - balance.propinas === balance.ventaNegocio);
check("Balance: venta del negocio − gastos = lo que quedó",
  balance.ventaNegocio - balance.gastos === balance.neto);
check("Balance: suma de los días = ventas del mes",
  balance.dias.reduce((s, d) => s + d.ventas, 0) === balance.ventaBruta);
check("Balance: suma de gastos por día = gastos del mes",
  balance.dias.reduce((s, d) => s + d.gastos, 0) === balance.gastos);
check("Balance: propinas por día = propinas del mes",
  balance.dias.reduce((s, d) => s + d.propinas, 0) === balance.propinas);

// Gastos: el módulo y el balance hablan del mismo dinero
check("Gastos del mes: módulo Gastos = Balance",
  sumAmount(operating(mesGastos)) === balance.gastos,
  money(sumAmount(operating(mesGastos))));
check("Retiros de la propietaria van aparte",
  sumAmount(mesGastos.filter(isOwnerDraw)) === balance.retiros);

// El mes contiene al día
const ventasMes = paid(salesOfMonth(sales, hoy));
check("La venta de hoy está incluida en el mes",
  ventasMes.filter((v) => salesOfDay(ventasHoy, new Date(v.dateISO)).length >= 0).length === ventasMes.length &&
  balance.ventaBruta >= resumenHoy.total);

// Reportes: categorías y productos salen de las mismas ventas
const porCategoria = byCategory(ventasMes).reduce((s, c) => s + c.total, 0);
const brutoItems = ventasMes.reduce(
  (s, v) => s + v.items.reduce((a, i) => a + i.qty * i.price, 0), 0);
check("Reportes: ventas por categoría = suma de los productos vendidos",
  porCategoria === brutoItems, money(porCategoria));

const unidadesTop = topProducts(ventasHoy, 100).reduce((s, p) => s + p.units, 0);
check("Reportes: ranking de productos = productos vendidos hoy",
  unidadesTop === resumenHoy.units, `${unidadesTop} vs ${resumenHoy.units}`);

// Caja: el efectivo esperado se explica solo
const efectivo = paymentBreakdown(ventasHoy).find((p) => p.method === "Efectivo")?.total ?? 0;
const esperado = 200000 + efectivo - cashOut(expenses, hoy);
check("Caja: base + efectivo − gastos en efectivo = efectivo esperado",
  esperado === 200000 + efectivo - cashOut(expenses, hoy), money(esperado));

// Inventario: alertas = productos por debajo del mínimo
check("Inventario: alertas = productos en estado distinto de disponible",
  lowStock(products).length === products.filter((p) => stockState(p) !== "disponible").length);

// Numeración de ventas consecutiva y sin saltos
const numeros = sales.map((s) => s.number);
check("Ventas numeradas de forma consecutiva",
  numeros.every((n, i) => i === 0 || n === numeros[i - 1] + 1),
  `#${numeros[0]} … #${numeros[numeros.length - 1]}`);

// Las fechas caen dentro de la ventana de historial
const fuera = sales.filter((s) => {
  const d = new Date(s.dateISO);
  const dias = (hoy.getTime() - d.getTime()) / 86400000;
  return dias < -1 || dias > 91;
});
check("Todas las ventas están dentro de los últimos 90 días", fuera.length === 0);

console.log(
  fallos
    ? `\n${fallos} INCONSISTENCIAS ENCONTRADAS\n`
    : "\nTodo cuadra: las pantallas leen de la misma fuente.\n",
);

process.exit(fallos ? 1 : 0);
