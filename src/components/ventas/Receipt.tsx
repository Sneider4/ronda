"use client";

import type { Sale } from "@/types";
import { BUSINESS } from "@/data/catalog";
import { employeeById } from "@/data/employees";
import { money, shortDate, timeOfDay } from "@/lib/format";
import { LogoMark } from "@/components/ui/Logo";

const Divider = () => (
  <div className="my-3 border-t border-dashed border-slate-300" aria-hidden />
);

/**
 * Comprobante interno del establecimiento.
 * No es una factura electrónica ni tiene validez tributaria: el bar hoy no
 * factura electrónicamente y el documento lo deja explícito al pie.
 */
export function Receipt({ sale }: { sale: Sale }) {
  const employee = employeeById(sale.employeeId);

  return (
    <div className="print-sheet mx-auto w-full max-w-[360px] rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col items-center text-center">
        <LogoMark size={40} />
        <p className="mt-3 text-lg font-bold tracking-tight text-slate-900 uppercase">
          {BUSINESS.name}
        </p>
        <p className="text-[12px] text-slate-500">“{BUSINESS.tagline}”</p>
        <p className="mt-1 text-[11.5px] text-slate-500">NIT: {BUSINESS.nit}</p>
        <p className="text-[11.5px] text-slate-500">{BUSINESS.address}</p>
        <p className="text-[11.5px] text-slate-500">Tel: {BUSINESS.phone}</p>
      </div>

      <Divider />

      <p className="text-center text-[12px] font-bold tracking-[0.18em] text-slate-700 uppercase">
        Comprobante de venta
      </p>

      <dl className="tabular mt-3 space-y-1 text-[12.5px] text-slate-600">
        <div className="flex justify-between">
          <dt>Venta</dt>
          <dd className="font-semibold text-slate-900">#{sale.number}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Mesa</dt>
          <dd className="font-medium text-slate-800">{sale.tableNumber}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Fecha</dt>
          <dd>{shortDate(sale.dateISO)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Hora</dt>
          <dd>{timeOfDay(sale.dateISO)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Atendió</dt>
          <dd>{employee.name}</dd>
        </div>
      </dl>

      <Divider />

      <ul className="space-y-2">
        {sale.items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3">
            <span className="tabular min-w-0 text-[12.5px] text-slate-700">
              <span className="font-semibold text-slate-900">{item.qty} x </span>
              {item.name}
              <span className="block text-[11px] text-slate-400">
                {money(item.price)} c/u
              </span>
            </span>
            <span className="tabular shrink-0 text-[12.5px] font-semibold text-slate-900">
              {money(item.price * item.qty)}
            </span>
          </li>
        ))}
      </ul>

      <Divider />

      <div className="tabular space-y-1 text-[12.5px]">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{money(sale.subtotal)}</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Descuento</span>
            <span>-{money(sale.discount)}</span>
          </div>
        )}
        {sale.tip > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Propina voluntaria</span>
            <span>{money(sale.tip)}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between border-t-2 border-slate-900 pt-3">
        <span className="text-sm font-bold tracking-wide text-slate-900 uppercase">
          Total
        </span>
        <span className="tabular text-xl font-bold text-slate-900">
          {money(sale.total)}
        </span>
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-center">
        <p className="text-[11px] tracking-wide text-slate-500 uppercase">
          Método de pago
        </p>
        <p className="text-[13.5px] font-semibold text-slate-900">
          {sale.paymentMethod}
        </p>
      </div>

      <Divider />

      <p className="text-center text-[12.5px] font-semibold text-slate-800">
        ¡Gracias por su visita!
      </p>
      <p className="mt-2 text-center text-[10.5px] leading-relaxed text-slate-400">
        Este comprobante es una representación demostrativa de consumo interno
        del establecimiento y no corresponde a una factura electrónica.
      </p>
      <p className="mt-2 text-center text-[10px] tracking-wide text-slate-300">
        Generado con Ronda · Sistema de gestión para bares
      </p>
    </div>
  );
}
