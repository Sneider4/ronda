"use client";

import { useEffect, useRef, useState } from "react";

/** Ancho real del contenedor — los gráficos se dibujan a la medida disponible. */
export function useMeasure<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}

/** true después del primer render en el navegador (evita desajustes de hidratación). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
