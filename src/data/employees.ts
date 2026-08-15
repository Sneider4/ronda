import type { Employee } from "@/types";

export const employees: Employee[] = [
  {
    id: "e-1",
    name: "Carlos Restrepo",
    role: "Administrador",
    active: true,
    shift: "Lun a Dom · 4:00 PM – 2:00 AM",
    phone: "310 245 8890",
    since: "Marzo 2023",
    color: "bg-brand-500",
  },
  {
    id: "e-2",
    name: "Andrés Gómez",
    role: "Mesero",
    active: true,
    shift: "Mié a Dom · 5:00 PM – 1:00 AM",
    phone: "312 780 1145",
    since: "Julio 2024",
    color: "bg-sky-600",
  },
  {
    id: "e-3",
    name: "Laura Martínez",
    role: "Mesera",
    active: true,
    shift: "Jue a Dom · 6:00 PM – 2:00 AM",
    phone: "301 559 2201",
    since: "Enero 2025",
    color: "bg-rose-500",
  },
  {
    id: "e-4",
    name: "Juan Ospina",
    role: "Caja",
    active: true,
    shift: "Mié a Dom · 5:00 PM – 2:00 AM",
    phone: "320 118 4477",
    since: "Septiembre 2024",
    color: "bg-emerald-600",
  },
  {
    id: "e-5",
    name: "Diana Cárdenas",
    role: "Mesera",
    active: false,
    shift: "Día libre",
    phone: "318 662 3390",
    since: "Mayo 2026",
    color: "bg-violet-600",
  },
];

export const employeeById = (id: string) =>
  employees.find((e) => e.id === id) ?? employees[0];

/** Meseros que pueden tener mesas asignadas */
export const waiters = employees.filter(
  (e) => e.role === "Mesero" || e.role === "Mesera",
);
