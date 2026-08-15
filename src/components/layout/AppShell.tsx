"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Toaster } from "@/components/ui/Toaster";

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="no-print min-h-screen bg-[#f4f5f7]">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="lg:pl-64">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <main
          key={pathname}
          className="mx-auto max-w-[1440px] animate-[fade-in_0.22s_ease-out] px-4 py-5 sm:px-6 sm:py-6"
        >
          {children}
        </main>
        <footer className="px-6 pb-8 text-center text-[12px] text-slate-400">
          Ronda · Sistema de gestión para bares — versión de demostración
        </footer>
      </div>

      <Toaster />
    </div>
  );
}
