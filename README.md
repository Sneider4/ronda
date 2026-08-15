# Ronda · Sistema de gestión para bares

Demo comercial de un sistema de administración para un bar tradicional
colombiano. Muestra, con datos ficticios pero coherentes, cómo se vería y
funcionaría el día a día del negocio: mesas, cuentas, pedidos, inventario,
ventas, caja y reportes.

> Es una **demostración**: no hay backend, base de datos, login real ni
> facturación electrónica. Todo el estado vive en memoria del navegador.

---

## Cómo ejecutarlo

```bash
npm install
npm run dev      # http://localhost:3000
```

Para producción:

```bash
npm run build
npm start
```

### Despliegue en Vercel

1. Subir el repositorio a GitHub.
2. En Vercel: **New Project → Import** el repositorio.
3. Framework: *Next.js* (se detecta solo). No hay variables de entorno.
4. **Deploy**.

---

## Guion sugerido para la presentación

1. **Dashboard** — “así ve el negocio apenas abre el sistema”: venta del día,
   venta del mes, mesas ocupadas, cuánto hay consumido sin cobrar.
2. **Mesas** — el salón completo con sus estados (disponible, ocupada, por
   pagar, reservada).
3. Abrir la **Mesa 4** → se ve el consumo, quién atiende y hace cuánto está
   abierta.
4. **Agregar producto** → tocar una cerveza → el total de la cuenta cambia al
   instante.
5. **Cerrar cuenta** → elegir método de pago (efectivo muestra el cambio) →
   **Confirmar**.
6. Aparece el **comprobante de venta** del establecimiento, listo para
   imprimir.
7. **Inventario** — control de existencias y el bloque de **alertas**:
   “Corona está por agotarse”, “Whisky Old Parr agotado”. Botón *Reponer*.
8. **Ventas** — historial filtrable por fecha, método de pago y mesa; cada
   venta abre su comprobante.
9. **Reportes** — producto más vendido, hora de mayor movimiento, día con
   mayores ventas, ventas por categoría.
10. **Caja** — resumen del turno, cuánto efectivo debe haber y **Cerrar caja**
    con arqueo y diferencia.

En el menú de usuario (arriba a la derecha) está **Reiniciar datos de la
demostración** para volver al estado inicial antes de una nueva presentación.

---

## Estructura del proyecto

```
src/
├─ app/                    Rutas (App Router)
│  ├─ page.tsx             Dashboard
│  ├─ mesas/               Salón, cuentas, pedidos, cobro
│  ├─ inventario/          Existencias y alertas
│  ├─ productos/           Catálogo (crear, editar, eliminar)
│  ├─ ventas/              Historial + comprobantes
│  ├─ caja/                Cierre de turno
│  ├─ reportes/            Analítica del negocio
│  └─ empleados/           Equipo y permisos por rol
├─ components/
│  ├─ layout/              Sidebar, topbar, shell
│  ├─ ui/                  Botones, tarjetas, modales, badges…
│  ├─ charts/              Gráficos en SVG (sin librerías externas)
│  ├─ mesas/               Tarjeta de mesa, cuenta, pedido, cobro
│  └─ ventas/              Comprobante de venta
├─ data/                   Datos ficticios (catálogo, empleados, semilla)
├─ services/analytics.ts   Cálculos que alimentan todas las pantallas
├─ store/demo-store.tsx    Estado de la demo (React Context)
├─ lib/                    Formato de moneda/fechas, utilidades
└─ types/                  Modelo de dominio
```

### Preparado para crecer

- Todas las pantallas leen sus cifras de `services/analytics.ts`, por lo que
  dashboard, ventas, caja y reportes **siempre cuadran entre sí**.
- Las acciones del negocio (agregar a una mesa, cobrar, reponer stock, crear
  productos) están centralizadas en `store/demo-store.tsx`. Cuando exista un
  backend real basta con reemplazar el cuerpo de cada acción por una llamada
  HTTP: la interfaz no cambia.
- Los tipos de `src/types` son el contrato de datos que usaría ese backend.

---

## Decisiones tomadas para la demo

| Tema | Decisión |
|---|---|
| Nombre del producto | **Ronda** (“otra ronda”), con isotipo de copa dentro de un anillo |
| Negocio de ejemplo | Bar La Ronda — Bogotá D.C. |
| Moneda | Pesos colombianos, formato `$ 25.000` |
| Facturación | **No** hay facturación electrónica ni DIAN: se emite un comprobante interno que lo aclara al pie |
| Datos | Generados con semilla fija: el historial de 30 días es igual en cada carga |
| Gráficos | SVG propio, sin librerías de charts; paleta validada para daltonismo |

## Tecnologías

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
lucide-react. Sin dependencias adicionales.
