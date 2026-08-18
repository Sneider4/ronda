"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  FlaskConical,
  Github,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { DEV, PRODUCTO, correoLink, whatsappLink } from "@/config";
import { LogoMark } from "@/components/ui/Logo";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BUSINESS } from "@/data/catalog";

const INCLUYE = [
  ["Mesas y cuentas", "Estado del salón, consumo por mesa y tiempo de ocupación"],
  ["Pedidos", "Carta por categorías, con búsqueda y control de cantidades"],
  ["Cobro y comprobante", "Cuatro medios de pago, propina, cambio e impresión"],
  ["Inventario", "Existencias, mínimos, alertas y entrada de mercancía"],
  ["Productos", "Carta, precios, costos y ganancia por producto"],
  ["Ventas", "Historial completo con filtros y comprobante de cada venta"],
  ["Gastos", "Salidas de dinero y cuentas por pagar"],
  ["Balance del mes", "Cuánto entró, cuánto salió y cuánto quedó, día por día"],
  ["Caja", "Arqueo del turno con diferencia de caja"],
  ["Reportes", "Lo más vendido, horas pico y mejor día"],
  ["Empleados", "Roles y permisos: cada quien ve lo que le corresponde"],
];

const NO_INCLUYE = [
  "Facturación electrónica ni reportes ante la DIAN",
  "Integración con datáfonos o pasarelas de pago",
  "Integración con plataformas de domicilios",
];

export default function AcercaPage() {
  const wa = whatsappLink(
    `Hola ${DEV.nombre}, vi la demostración de ${PRODUCTO.nombre} y quiero conversar sobre el sistema para mi bar.`,
  );
  const mail = correoLink(`Sistema ${PRODUCTO.nombre} para mi bar`);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Aclaración: esto es una muestra, no el sistema definitivo */}
      <Card className="border-brand-300 bg-brand-50/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-ink-950">
            <FlaskConical size={20} />
          </span>
          <div>
            <Badge tone="brand" dot>
              Versión de demostración
            </Badge>
            <h2 className="mt-2 text-[17px] font-semibold tracking-tight text-slate-900">
              Esto es una muestra de cómo funcionaría el sistema en su bar
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-slate-700">
              Todo lo que ve se puede usar: abrir una mesa, tomar el pedido,
              cobrar, imprimir el comprobante, revisar el inventario y ver el
              balance del mes. Sin embargo,{" "}
              <strong className="font-semibold text-slate-900">
                los productos, precios, mesas, empleados y ventas son datos de
                ejemplo
              </strong>
              : sirven para mostrar el funcionamiento, no corresponden a un
              negocio real y ninguna operación mueve dinero.
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-slate-700">
              En la versión definitiva se carga la carta real del bar con sus
              precios, sus mesas y su equipo de trabajo, y la información queda
              guardada de forma permanente y respaldada.
            </p>
          </div>
        </div>
      </Card>

      {/* Presentación */}
      <Card className="grain overflow-hidden border-0 bg-ink-950 p-0">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <LogoMark size={44} />
              <div>
                <p className="text-xl font-semibold tracking-tight text-white">
                  {PRODUCTO.nombre}
                </p>
                <p className="text-[13px] text-white/50">
                  Sistema de gestión para bares · {PRODUCTO.version}
                </p>
              </div>
            </div>
            <p className="mt-5 text-[14px] leading-relaxed text-white/70">
              Esta es una propuesta de cómo se podría digitalizar la
              administración de {BUSINESS.name}: mesas, cuentas, inventario,
              ventas, gastos y cierre de caja en una sola pantalla, pensada para
              manejarse sin conocimientos técnicos.
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-white/45">
              Todo lo que ve funciona y se puede probar. Los datos son de
              ejemplo: ninguna operación afecta dinero real.
            </p>
          </div>

          <div className="w-full rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/10 lg:w-72">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-white/40 uppercase">
              Desarrollado por
            </p>
            <p className="mt-2 text-[17px] font-semibold text-white">
              {DEV.nombre}
            </p>
            <p className="text-[13px] text-brand-300">{DEV.rol}</p>

            <ul className="mt-4 space-y-2.5 text-[13px] text-white/70">
              {DEV.ciudad && (
                <li className="flex items-center gap-2.5">
                  <MapPin size={15} className="shrink-0 text-white/40" />
                  {DEV.ciudad}
                </li>
              )}
              {DEV.telefono && (
                <li className="flex items-center gap-2.5">
                  <Phone size={15} className="shrink-0 text-white/40" />
                  {DEV.telefono}
                </li>
              )}
              {DEV.correo && (
                <li className="flex items-center gap-2.5">
                  <Mail size={15} className="shrink-0 text-white/40" />
                  <span className="truncate">{DEV.correo}</span>
                </li>
              )}
              {DEV.github && (
                <li className="flex items-center gap-2.5">
                  <Github size={15} className="shrink-0 text-white/40" />
                  <a
                    href={DEV.github}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:text-white"
                  >
                    {DEV.github.replace("https://", "")}
                  </a>
                </li>
              )}
            </ul>

            <div className="mt-4 flex flex-col gap-2">
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-400 px-4 py-2.5 text-[13.5px] font-semibold text-ink-950 transition-colors hover:bg-brand-300"
                >
                  <MessageCircle size={16} /> Escribir por WhatsApp
                </a>
              )}
              {mail && (
                <a
                  href={mail}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <Mail size={16} /> Enviar un correo
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Qué incluye */}
      <Card>
        <CardHeader
          title="Qué incluye esta demostración"
          subtitle="Todos los módulos están funcionando y se pueden recorrer"
          icon={<BadgeCheck size={17} />}
        />
        <ul className="grid gap-3 sm:grid-cols-2">
          {INCLUYE.map(([titulo, detalle]) => (
            <li
              key={titulo}
              className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-100 ring-inset"
            >
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              <span>
                <span className="block text-[13.5px] font-semibold text-slate-900">
                  {titulo}
                </span>
                <span className="block text-[12.5px] text-slate-500">{detalle}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Alcance */}
      <Card>
        <CardHeader
          title="Qué no incluye por ahora"
          subtitle="Para que quede claro desde el principio"
          icon={<ShieldCheck size={17} />}
        />
        <ul className="space-y-2">
          {NO_INCLUYE.map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100 ring-inset">
          <p className="text-[12.5px] leading-relaxed text-amber-900">
            El comprobante que emite el sistema es un documento interno del
            establecimiento y no corresponde a una factura electrónica. Si más
            adelante se requiere facturación ante la DIAN, se integra con un
            proveedor autorizado y se cotiza aparte.
          </p>
        </div>
      </Card>

      {/* Siguiente paso */}
      <Card className="border-brand-200 bg-brand-50/50">
        <CardHeader
          title="¿Le sirve para su bar?"
          subtitle="El siguiente paso es cargar la carta y los precios reales del negocio"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="brand" dot>
            Implementación en 3 a 4 semanas
          </Badge>
          <Badge tone="neutral" dot>
            Capacitación del equipo incluida
          </Badge>
          <Badge tone="neutral" dot>
            Acompañamiento la primera noche
          </Badge>
        </div>
        <p className="mt-4 text-[13.5px] leading-relaxed text-slate-600">
          Con la carta real cargada, el sistema queda mostrando los productos y
          precios de {BUSINESS.name} en lugar de los de ejemplo. Para avanzar,
          escríbame por WhatsApp o al correo y coordinamos la visita.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-semibold text-brand-700 hover:text-brand-800"
        >
          Volver al inicio <ArrowUpRight size={14} />
        </Link>
      </Card>
    </div>
  );
}
