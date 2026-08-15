/** Formateo en español colombiano — pesos, fechas y horas. */

const nf = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

/** Espacio duro (U+00A0): evita que "$ 1.805.500" se parta en dos líneas. */
const NBSP = " ";

/** 25000 → "$ 25.000" */
export function money(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${NBSP}${nf.format(Math.abs(Math.round(value)))}`;
}

/** 25000 → "25.000" (sin símbolo) */
export function number(value: number): string {
  return nf.format(Math.round(value));
}

/** 1284000 → "$ 1,3 M" — para ejes de gráficos */
export function moneyCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `$${NBSP}${(value / 1_000_000)
      .toFixed(abs >= 10_000_000 ? 0 : 1)
      .replace(".", ",")}${NBSP}M`;
  }
  if (abs >= 1000) return `$${NBSP}${Math.round(value / 1000)}k`;
  return `$${NBSP}${value}`;
}

export function percent(value: number, digits = 0): string {
  return `${value.toFixed(digits).replace(".", ",")}${NBSP}%`;
}

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const WEEKDAYS_LONG = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
];

const pad = (n: number) => String(n).padStart(2, "0");

export const toDate = (value: string | Date) =>
  value instanceof Date ? value : new Date(value);

/** "15/08/2026" */
export function shortDate(value: string | Date): string {
  const d = toDate(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** "15 de agosto de 2026" */
export function longDate(value: string | Date): string {
  const d = toDate(value);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

/** "Sábado, 15 de agosto" */
export function weekdayDate(value: string | Date): string {
  const d = toDate(value);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

/** "Sáb 15" */
export function dayLabel(value: string | Date): string {
  const d = toDate(value);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()}`;
}

export function weekdayShort(value: string | Date): string {
  return WEEKDAYS[toDate(value).getDay()];
}

/** "10:42 PM" */
export function timeOfDay(value: string | Date): string {
  const d = toDate(value);
  const h = d.getHours();
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(d.getMinutes())} ${suffix}`;
}

/** 22 → "10 PM" — etiquetas de eje horario */
export function hourLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12} ${suffix}`;
}

/** 22 → "10p" — etiquetas compactas para ejes angostos */
export function hourLabelShort(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${h >= 12 ? "p" : "a"}`;
}

/** Tiempo transcurrido: "1 h 36 min" */
export function elapsed(since: string | Date, now: Date = new Date()): string {
  const ms = Math.max(0, now.getTime() - toDate(since).getTime());
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${pad(m)} min`;
}

export const isSameDay = (a: string | Date, b: string | Date) => {
  const d1 = toDate(a);
  const d2 = toDate(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
