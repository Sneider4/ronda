"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  FlaskConical,
  Lightbulb,
  Lock,
  UserCheck,
  X,
} from "lucide-react";
import { allNavItems, findNavItem } from "./nav";
import { findGuide, sectionKey } from "./guides";
import { useCurrentUser } from "@/store/demo-store";

/**
 * Botón de ayuda de la esquina inferior derecha.
 *
 * Responde la pregunta de quien está viendo la demostración por primera vez:
 * "¿dónde estoy y para qué sirve esta pantalla?". La primera vez que se entra
 * a una sección el botón hace un pulso para que se note; después se queda
 * quieto y solo abre si lo tocan.
 */

/** Secciones cuya guía ya se abrió: el pulso no se repite */
const SEEN_KEY = "ronda-guia-vista-v1";

/** "Mesas, Ventas y Caja" */
const listar = (partes: string[]) =>
  partes.length <= 1
    ? (partes[0] ?? "")
    : `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;

export function HelpButton() {
  const pathname = usePathname();
  const seccion = sectionKey(pathname);
  const item = findNavItem(pathname);
  const guide = findGuide(pathname);
  const { employee, role, can } = useCurrentUser();

  const [open, setOpen] = useState(false);
  // null mientras no se ha leído el navegador: evita el pulso en el primer
  // render, cuando el servidor y el cliente todavía deben coincidir.
  const [seen, setSeen] = useState<string[] | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SEEN_KEY);
      setSeen(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setSeen([]);
    }
  }, []);

  // Al cambiar de sección el panel se cierra: su contenido ya no corresponde
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
    setSeen((prev) => {
      if (prev?.includes(seccion)) return prev;
      const next = [...(prev ?? []), seccion];
      try {
        window.localStorage.setItem(SEEN_KEY, JSON.stringify(next));
      } catch {
        // Sin acceso al navegador: el pulso vuelve en la próxima visita
      }
      return next;
    });
  }, [seccion]);

  if (!guide) return null;

  const titulo = item?.label ?? (seccion === "/acerca" ? "Acerca del sistema" : "Ronda");
  const subtitulo =
    item?.description ??
    (seccion === "/acerca" ? "Quién lo desarrolla y cómo contactarlo" : "");

  // Un mesero que abre una dirección que no le corresponde no ve la guía de
  // esa pantalla, sino la razón por la que no puede entrar.
  const bloqueada = !!item && !can(item.permission);
  const permitidas = allNavItems.filter((i) => can(i.permission));
  const notaRol =
    role === "Administrador"
      ? `${employee.name} entra como ${role} y ve todas las secciones del sistema.`
      : `${employee.name} entra como ${role}. Por eso el menú de la izquierda solo muestra ${listar(
          permitidas.map((i) => i.label),
        )}.`;

  const pulsa = seen !== null && !seen.includes(seccion);

  return (
    <div
      ref={wrapRef}
      className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6"
    >
      {open && (
        <div
          role="dialog"
          aria-labelledby="guia-titulo"
          className="max-h-[min(70vh,34rem)] w-[min(21.5rem,calc(100vw-2rem))] origin-bottom-right animate-[scale-in_0.18s_cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-ink-950/15"
        >
          <header className="sticky top-0 flex items-start gap-3 border-b border-slate-100 bg-white/95 px-4 py-3.5 backdrop-blur">
            <div className="min-w-0 flex-1">
              <h2
                id="guia-titulo"
                className="text-[15px] font-semibold tracking-tight text-slate-900"
              >
                {titulo}
              </h2>
              {subtitulo && (
                <p className="mt-0.5 text-[12.5px] leading-snug text-slate-500">
                  {subtitulo}
                </p>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar la ayuda"
              className="-mr-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </header>

          <div className="space-y-4 px-4 py-4">
            {bloqueada ? (
              <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-100 ring-inset">
                <Lock size={16} className="mt-0.5 shrink-0 text-slate-400" />
                <p className="text-[13px] leading-relaxed text-slate-600">
                  Esta sección no está disponible para el usuario que está
                  viendo el sistema en este momento. {notaRol}
                </p>
              </div>
            ) : (
              <>
                <section>
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                    Qué es esta pantalla
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-700">
                    {guide.queEs}
                  </p>
                </section>

                <section>
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                    Qué puede hacer acá
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {guide.acciones.map((accion) => (
                      <li
                        key={accion}
                        className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-600"
                      >
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                        {accion}
                      </li>
                    ))}
                  </ul>
                </section>

                {guide.pruebe && (
                  <section className="flex items-start gap-2.5 rounded-xl bg-brand-50 p-3.5 ring-1 ring-brand-100 ring-inset">
                    <Lightbulb size={16} className="mt-0.5 shrink-0 text-brand-700" />
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.14em] text-brand-800 uppercase">
                        Pruebe esto
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-brand-900">
                        {guide.pruebe}
                      </p>
                    </div>
                  </section>
                )}

                <section className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-100 ring-inset">
                  <UserCheck size={16} className="mt-0.5 shrink-0 text-slate-400" />
                  <p className="text-[12.5px] leading-relaxed text-slate-600">
                    {notaRol}
                  </p>
                </section>
              </>
            )}
          </div>

          <Link
            href="/acerca"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-[12.5px] leading-snug text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <FlaskConical size={15} className="shrink-0 text-brand-600" />
            <span>
              Los datos son de ejemplo.{" "}
              <span className="font-semibold text-brand-700">
                Ver de qué se trata esta demostración →
              </span>
            </span>
          </Link>
        </div>
      )}

      <button
        onClick={toggle}
        aria-expanded={open}
        aria-label={
          open ? "Cerrar la ayuda de esta sección" : "¿Qué es esta pantalla?"
        }
        title="¿Qué es esta pantalla?"
        className={[
          "flex h-12 w-12 items-center justify-center rounded-full bg-ink-950 text-white shadow-lg shadow-ink-950/25 transition-all duration-150 hover:bg-ink-800 active:scale-95",
          !open && pulsa ? "pulse-ring" : "",
        ].join(" ")}
      >
        {open ? <X size={20} /> : <CircleHelp size={22} className="text-brand-400" />}
      </button>
    </div>
  );
}
