import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DemoProvider } from "@/store/demo-store";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Ronda · Sistema de gestión para bares",
  description:
    "Ronda es el sistema que organiza el día a día de un bar: mesas, cuentas, inventario, ventas y caja en un solo lugar.",
};

export const viewport: Viewport = {
  themeColor: "#0a0d14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO">
      <body className="antialiased">
        <DemoProvider>
          <AppShell>{children}</AppShell>
        </DemoProvider>
      </body>
    </html>
  );
}
