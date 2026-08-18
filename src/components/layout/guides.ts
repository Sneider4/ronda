/**
 * Guía de cada sección — el contenido del botón de ayuda.
 *
 * El título y el subtítulo no se repiten aquí: salen de `nav.ts`, que ya es la
 * fuente de verdad del nombre de cada sección. Aquí va solo lo que el cliente
 * necesita para no sentirse perdido: qué es esta pantalla, qué puede hacer y
 * qué vale la pena probar.
 *
 * El tono es el de una explicación hablada, sin tecnicismos: quien recorre la
 * demostración maneja un bar, no un sistema.
 */

export interface SectionGuide {
  /** Qué es esta pantalla, en una o dos frases */
  queEs: string;
  /** Lo que se puede hacer aquí */
  acciones: string[];
  /** Una acción concreta que invita a probar el sistema */
  pruebe?: string;
}

export const GUIDES: Record<string, SectionGuide> = {
  "/": {
    queEs:
      "El resumen del día. De un vistazo muestra cuánto se ha vendido, cuántas mesas están ocupadas y cuánta plata hay en cuentas que todavía no se han cobrado.",
    acciones: [
      "Ver la venta de hoy y la del mes",
      "Saber cuántas mesas están ocupadas y cuánto deben",
      "Revisar cómo pagó la gente y qué se vendió más",
    ],
    pruebe:
      "Cobre una mesa en la sección Mesas y vuelva acá: las cifras ya cambiaron.",
  },

  "/mesas": {
    queEs:
      "El plano del salón. Cada tarjeta es una mesa y muestra si está libre, ocupada o si ya pidió la cuenta, con el consumo acumulado y el tiempo que lleva ocupada.",
    acciones: [
      "Abrir una mesa y tomar el pedido desde la carta",
      "Agregar o quitar productos de una cuenta abierta",
      "Cobrar con propina o descuento e imprimir el comprobante",
    ],
    pruebe:
      "Toque una mesa disponible, agregue un par de productos y cóbrela: la venta queda registrada y el inventario baja solo.",
  },

  "/ventas": {
    queEs:
      "El historial de todo lo que se ha cobrado. Cada venta guarda su detalle, quién atendió, cómo se pagó y su comprobante.",
    acciones: [
      "Filtrar por fecha, mesa o medio de pago",
      "Buscar una venta por su número",
      "Abrir el comprobante de cualquier venta y volverlo a imprimir",
    ],
    pruebe:
      "Filtre por efectivo y abra el comprobante de una venta: es el mismo que se le entrega al cliente.",
  },

  "/caja": {
    queEs:
      "El cierre del turno. Reúne todo lo que entró hoy separado por medio de pago y compara el efectivo que debería haber en la caja con el que realmente hay.",
    acciones: [
      "Ver ventas, propinas, descuentos y gastos pagados del turno",
      "Revisar qué cuentas siguen abiertas antes de cerrar",
      "Registrar el efectivo contado y cerrar la caja",
    ],
    pruebe:
      "Cierre la caja escribiendo un valor distinto al esperado: el sistema le muestra el faltante o el sobrante.",
  },

  "/gastos": {
    queEs:
      "El cuaderno de las salidas de dinero: compras a proveedores, servicios, nómina, arreglos y retiros de la propietaria. También lleva lo que está pendiente por pagar.",
    acciones: [
      "Registrar un gasto o una factura por pagar",
      "Marcar una cuenta como pagada cuando se cancele",
      "Ver en qué se va la plata, por categoría",
    ],
    pruebe:
      "Registre un gasto y véalo aparecer de una vez en el balance del mes.",
  },

  "/balance": {
    queEs:
      "Cuánto entró, cuánto salió y cuánto quedó en el mes. Es la pantalla que responde si el bar ganó o perdió.",
    acciones: [
      "Ver ventas, gastos y utilidad del mes en un solo lugar",
      "Revisar en qué se fue el dinero, por categoría",
      "Seguir el resultado día por día",
    ],
    pruebe:
      "Toque cualquier día del listado para ver cómo le fue esa noche.",
  },

  "/inventario": {
    queEs:
      "Las existencias de cada producto, con el mínimo desde el cual el sistema avisa que hay que reponer. El stock baja solo cada vez que se cobra una mesa.",
    acciones: [
      "Ver qué está por agotarse y qué ya se agotó",
      "Registrar la mercancía que acaba de llegar",
      "Saber cuánto vale el inventario que hay guardado",
    ],
    pruebe:
      "Registre una entrada de mercancía de un producto en rojo y mire cómo desaparece la alerta.",
  },

  "/productos": {
    queEs:
      "La carta del bar: nombre, presentación, categoría, precio de venta y costo de compra de cada producto. De acá sale la ganancia que deja cada uno.",
    acciones: [
      "Agregar un producto nuevo o cambiar un precio",
      "Registrar el costo para saber cuánto deja cada venta",
      "Fijar el stock mínimo desde el cual el sistema avisa",
    ],
    pruebe:
      "Cambie el precio de un producto y agréguelo a una mesa: el precio nuevo ya está en la carta.",
  },

  "/reportes": {
    queEs:
      "Lo que dicen las ventas: qué se vende más, a qué horas, qué días y cómo paga la clientela. Sirve para programar turnos y compras.",
    acciones: [
      "Ver los productos y las categorías que más venden",
      "Identificar la hora y el día de mayor movimiento",
      "Comparar el comportamiento de distintos periodos",
    ],
    pruebe:
      "Mire el horario de mayor movimiento y compárelo con el turno que tiene programado.",
  },

  "/empleados": {
    queEs:
      "El equipo de trabajo y lo que puede hacer cada uno. Cada empleado entra con su propio usuario y solo ve lo que le corresponde.",
    acciones: [
      "Ver el rol de cada persona del equipo",
      "Revisar la tabla de permisos por rol",
      "Entender qué información del negocio queda protegida",
    ],
    pruebe:
      "Arriba a la derecha, en su nombre, elija ver el sistema como un mesero: el menú se reduce al instante.",
  },

  "/acerca": {
    queEs:
      "El alcance de esta demostración y los datos de contacto de quien la desarrolló.",
    acciones: [
      "Ver qué incluye y qué no incluye el sistema",
      "Conocer los tiempos de implementación",
      "Escribir por WhatsApp o por correo",
    ],
  },
};

/** Sección a la que pertenece una dirección del navegador */
export const sectionKey = (pathname: string) =>
  pathname === "/" ? "/" : `/${pathname.split("/")[1] ?? ""}`;

/** Guía que corresponde a una dirección del navegador */
export const findGuide = (pathname: string): SectionGuide | undefined =>
  GUIDES[sectionKey(pathname)];
