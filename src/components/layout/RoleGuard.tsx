"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { findNavItem } from "./nav";
import { useCurrentUser } from "@/store/demo-store";
import { homeFor } from "@/lib/permissions";
import { Button } from "@/components/ui/Button";

/**
 * Cada rol solo entra a lo suyo. Si un mesero abre una dirección que no le
 * corresponde, no ve los datos: ve el aviso de acceso restringido.
 */
export function RoleGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { can, employee, role } = useCurrentUser();

  const item = findNavItem(pathname);
  const allowed = !item || can(item.permission);
  const home = homeFor(role);

  // Al entrar al inicio sin permiso de dashboard, se va directo a su pantalla
  useEffect(() => {
    if (pathname === "/" && !can("dashboard")) router.replace(home);
  }, [pathname, can, router, home]);

  if (allowed) return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card max-w-md p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Lock size={24} />
        </span>
        <h2 className="mt-4 text-[17px] font-semibold tracking-tight text-slate-900">
          Esta sección no está disponible para su usuario
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500">
          {employee.name} entra como <strong>{role}</strong>. La información del
          negocio —inventario, ventas, gastos y reportes— solo la ve quien tiene
          ese permiso.
        </p>
        <Link href={home} className="mt-5 inline-block">
          <Button variant="primary">Volver a mi pantalla</Button>
        </Link>
      </div>
    </div>
  );
}
