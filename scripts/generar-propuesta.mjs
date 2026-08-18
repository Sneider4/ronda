/**
 * Genera "Ronda - Propuesta comercial.docx"
 *   node scripts/generar-propuesta.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { AlignmentType, Document, Packer, Paragraph, TextRun } from "docx";
import {
  COLORS,
  FONT,
  NUMERACION,
  SECCION,
  bullet,
  callout,
  encabezado,
  espacio,
  h1,
  h2,
  h3,
  numbered,
  p,
  pie,
  rich,
  separador,
  tabla,
} from "./doc-lib.mjs";

const cfg = JSON.parse(
  readFileSync(new URL("../src/config/contacto.json", import.meta.url), "utf8"),
);
const dev = cfg.desarrollador;
const cli = cfg.cliente;

const PROVEEDOR = dev.nombre || "[Su nombre / empresa]";
const CONTACTO =
  [dev.telefono, dev.correo].filter(Boolean).join(" · ") || "[teléfono] · [correo]";
const ENLACE = cfg.producto.url || "[enlace de la demostración]";
const CLIENTE = cli.propietaria || "[Nombre de la propietaria]";
const NEGOCIO = cli.negocio || "[Nombre del bar]";
const CIUDAD = cli.ciudad || dev.ciudad || "[Ciudad]";
const FECHA = new Date().toLocaleDateString("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const money = (n) => "$ " + n.toLocaleString("es-CO");

const portada = [
  espacio(1200),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: "RONDA", bold: true, size: 72, color: COLORS.ink, font: FONT }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 500 },
    children: [
      new TextRun({
        text: "Sistema de gestión para bares",
        size: 26,
        color: COLORS.marca,
        font: FONT,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text: "Propuesta comercial",
        bold: true,
        size: 40,
        color: COLORS.ink,
        font: FONT,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 800 },
    children: [
      new TextRun({
        text: "Digitalización de la administración del bar",
        size: 24,
        color: COLORS.gris,
        font: FONT,
      }),
    ],
  }),
  tabla(
    [
      { titulo: "", ancho: 3200 },
      { titulo: "", ancho: 6400 },
    ],
    [
      ["Dirigida a", `${CLIENTE} — ${NEGOCIO}, ${CIUDAD}`],
      ["Presentada por", PROVEEDOR],
      ["Contacto", CONTACTO],
      ["Fecha", FECHA],
      ["Validez de la oferta", "30 días calendario"],
      ["Demostración en línea", ENLACE],
    ],
  ),
  new Paragraph({ pageBreakBefore: true, children: [] }),
];

const contenido = [
  // Resumen
  h1("1. En una página"),
  p(
    `Hoy ${NEGOCIO} se administra con cuaderno, memoria y confianza. Eso funciona mientras usted está presente, pero deja tres huecos: no se sabe con certeza cuánto se vendió, no se sabe qué se está acabando hasta que un cliente pide algo que no hay, y no se sabe cuánto quedó realmente al final del mes.`,
  ),
  p(
    "Ronda es un sistema hecho para bares como el suyo: mesas, cuentas, inventario, ventas, gastos y cierre de caja en una sola pantalla, en español, sencillo de usar por cualquier persona del equipo y sin cambiar la forma de trabajar del negocio.",
  ),
  p("Lo que usted obtiene, desde la primera noche:"),
  bullet("Saber cuánto vendió hoy, sin esperar al cierre."),
  bullet("Ver qué mesa está ocupada y cuánto debe cada una, en tiempo real."),
  bullet("Recibir aviso antes de quedarse sin producto."),
  bullet("Tener el historial completo de ventas, con su comprobante."),
  bullet("Cerrar la caja con una diferencia calculada, no estimada."),
  bullet("Ver cuánto entró, cuánto salió y cuánto le quedó cada mes."),
  bullet("Que su personal vea solo lo que le corresponde."),
  espacio(),
  callout(
    "Ya lo puede probar",
    `La demostración está en línea y funciona con datos de ejemplo: ${ENLACE}. Puede abrir una mesa, agregar productos, cobrar, ver el comprobante y revisar el balance del mes.`,
  ),

  // Problema
  h1("2. El problema que resolvemos"),
  p("Estas son preguntas que hoy el bar no puede responder con exactitud:"),
  tabla(
    [
      { titulo: "Pregunta", ancho: 4800, destacar: true },
      { titulo: "Hoy", ancho: 2400 },
      { titulo: "Con Ronda", ancho: 2400 },
    ],
    [
      ["¿Cuánto vendí hoy?", "Al cierre, contando", "En tiempo real"],
      ["¿Cuánto debe la mesa 4?", "En el cuaderno", "En la pantalla"],
      ["¿Qué se está acabando?", "Cuando falta", "Con aviso anticipado"],
      ["¿Qué es lo que más vendo?", "Por intuición", "Con datos"],
      ["¿A qué hora se mueve el bar?", "Por intuición", "Gráfico por hora"],
      ["¿Cuadró la caja?", "Aproximado", "Diferencia exacta"],
      ["¿Cuánto me quedó este mes?", "Difícil de saber", "Un solo número"],
    ],
  ),
  espacio(),
  h3("El costo de no saber"),
  p(
    "En un bar, las pérdidas no aparecen de golpe: se van en pequeñas fugas diarias — cuentas mal sumadas, producto que sale sin registrar, mesas que se van sin pagar completo, compras hechas a destiempo. Un cálculo conservador:",
  ),
  tabla(
    [
      { titulo: "Concepto", ancho: 5200, destacar: true },
      { titulo: "Estimado mensual", ancho: 4400, align: AlignmentType.RIGHT },
    ],
    [
      ["Diferencias de caja (aprox. $25.000 por noche)", money(750000)],
      ["Producto que sale sin registrar", money(400000)],
      ["Ventas perdidas por quedarse sin producto", money(350000)],
      ["Total estimado que hoy se pierde", money(1500000)],
    ],
  ),
  espacio(),
  p(
    "No hace falta que las cifras sean exactas: basta con que la mitad lo sea para que el sistema se pague solo varias veces al mes.",
    { italics: true },
  ),

  // Solución
  h1("3. Qué incluye el sistema"),
  tabla(
    [
      { titulo: "Módulo", ancho: 2600, destacar: true },
      { titulo: "Qué hace", ancho: 4200 },
      { titulo: "Para qué le sirve", ancho: 2800 },
    ],
    [
      ["Mesas", "Estado del salón, cuentas abiertas, tiempo y mesero", "Saber qué pasa en el salón"],
      ["Pedidos", "Carta por categorías, toque para agregar", "Tomar el pedido sin papel"],
      ["Cobro", "Efectivo, tarjeta, transferencia, Nequi, propina y cambio", "Cobrar sin equivocarse"],
      ["Comprobante", "Documento del bar, imprimible", "Respaldo para el cliente"],
      ["Inventario", "Existencias, mínimos y alertas de reposición", "No quedarse sin producto"],
      ["Productos", "Carta, precios, costos y ganancia por producto", "Saber qué deja plata"],
      ["Ventas", "Historial completo con filtros por fecha y mesa", "Revisar cualquier día"],
      ["Gastos", "Compras, arriendo, nómina, servicios y cuentas por pagar", "Controlar lo que sale"],
      ["Balance", "Entró, salió y quedó, mes a mes y día a día", "Saber cuánto ganó"],
      ["Caja", "Arqueo del turno y diferencia de caja", "Cuadrar todas las noches"],
      ["Reportes", "Lo más vendido, horas pico, mejor día", "Comprar y programar mejor"],
      ["Empleados", "Roles y permisos por usuario", "Cuidar su información"],
    ],
  ),
  espacio(),
  h3("Funciona en lo que ya tiene"),
  p(
    "El sistema abre en el navegador de un computador, una tablet o un celular. No requiere instalar programas ni comprar equipos especiales.",
  ),

  // Sin internet
  h1("4. Qué pasa si se va el internet"),
  p(
    "Es la pregunta correcta: un bar no puede dejar de vender porque falle la conexión. El sistema se entrega preparado para seguir trabajando sin internet.",
  ),
  bullet(
    "La aplicación se instala en el equipo del bar y guarda las operaciones localmente: se puede seguir abriendo mesas, tomando pedidos y cobrando.",
  ),
  bullet(
    "Cuando vuelve la conexión, todo lo registrado se sincroniza automáticamente con el servidor, sin que nadie tenga que hacer nada.",
  ),
  bullet(
    "Si son varios equipos, el punto principal del bar (barra o caja) hace de centro: los demás se conectan a él por la red local, que sigue funcionando aunque el proveedor de internet falle.",
  ),
  bullet(
    "Los comprobantes se imprimen desde la impresora del bar, que trabaja en la red local y tampoco depende de internet.",
  ),
  espacio(),
  callout(
    "Recomendación de contingencia",
    "Para que la caída de la luz tampoco lo detenga, se recomienda una UPS pequeña para el equipo de caja y la impresora. Con eso, el bar sigue operando con normalidad.",
  ),

  // Alcance
  h1("5. Alcance del servicio"),
  h3("Incluye"),
  bullet("Configuración del bar: mesas, zonas, usuarios y roles."),
  bullet("Carga de la carta completa con precios y costos."),
  bullet("Carga del inventario inicial y de los mínimos de cada producto."),
  bullet("Personalización del comprobante con los datos del establecimiento."),
  bullet("Capacitación al equipo (dos sesiones) y guía impresa."),
  bullet("Acompañamiento presencial la primera noche de operación."),
  bullet("Soporte y ajustes menores durante el primer mes."),
  bullet("Copias de seguridad automáticas de la información."),
  espacio(),
  h3("No incluye"),
  bullet("Facturación electrónica ni reportes tributarios ante la DIAN."),
  bullet("Equipos: computador, tablet, celular o impresora."),
  bullet("Servicio de internet ni instalación de red."),
  bullet("Integración con datáfonos o pasarelas de pago."),
  bullet("Integración con plataformas de domicilios."),
  espacio(),
  callout(
    "Sobre la facturación electrónica",
    "El bar hoy no factura electrónicamente y el sistema no se presenta como una solución tributaria. Lo que emite es un comprobante interno del establecimiento, y así lo dice el propio documento. Si en el futuro la DIAN lo exige o usted lo necesita, se integra con un proveedor autorizado y se cotiza por separado.",
    COLORS.rojo,
  ),

  // Cronograma
  h1("6. Cronograma de implementación"),
  tabla(
    [
      { titulo: "Etapa", ancho: 2200, destacar: true },
      { titulo: "Qué se hace", ancho: 5400 },
      { titulo: "Tiempo", ancho: 2000, align: AlignmentType.CENTER },
    ],
    [
      ["1. Levantamiento", "Visita al bar, carta, precios, mesas y forma de trabajo", "2 días"],
      ["2. Configuración", "Carga de productos, inventario, usuarios y comprobante", "1 semana"],
      ["3. Pruebas", "Revisión con usted de precios y funcionamiento", "2 días"],
      ["4. Capacitación", "Dos sesiones con el equipo (meseros y caja)", "2 días"],
      ["5. Arranque", "Primera noche en operación con acompañamiento", "1 noche"],
      ["6. Ajustes", "Correcciones y afinamiento del primer mes", "4 semanas"],
    ],
  ),
  espacio(),
  p("Tiempo total hasta la puesta en marcha: entre tres y cuatro semanas."),

  // Inversión
  h1("7. Inversión"),
  p(
    "Dos alternativas, según qué tanto quiera controlar desde el primer día. La mensualidad incluye alojamiento del sistema, copias de seguridad, soporte y mejoras.",
  ),
  tabla(
    [
      { titulo: "", ancho: 3400, destacar: true },
      { titulo: "Plan Barra", ancho: 3100, align: AlignmentType.CENTER },
      { titulo: "Plan Negocio (recomendado)", ancho: 3100, align: AlignmentType.CENTER },
    ],
    [
      ["Mesas, pedidos y cobro", "Sí", "Sí"],
      ["Comprobante de venta", "Sí", "Sí"],
      ["Historial de ventas", "Sí", "Sí"],
      ["Cierre de caja", "Sí", "Sí"],
      ["Inventario y alertas", "No", "Sí"],
      ["Costos y ganancia por producto", "No", "Sí"],
      ["Gastos y cuentas por pagar", "No", "Sí"],
      ["Balance mensual", "No", "Sí"],
      ["Reportes del negocio", "No", "Sí"],
      ["Permisos por rol", "Básicos", "Completos"],
      ["Implementación (pago único)", money(900000), money(1400000)],
      ["Mensualidad", money(120000) + " / mes", money(190000) + " / mes"],
    ],
  ),
  espacio(),
  h3("Opción de prueba"),
  p(
    `Si prefiere empezar de a poco: plan piloto de cuatro semanas por ${money(400000)}, con la carta cargada y capacitación incluida. Si decide continuar, ese valor se abona a la implementación.`,
  ),
  espacio(),
  h3("Forma de pago"),
  bullet("50 % al aceptar la propuesta y 50 % en la puesta en marcha."),
  bullet("La mensualidad empieza a cobrarse el segundo mes de operación."),
  bullet("Sin cláusula de permanencia: puede cancelar avisando con 30 días."),
  bullet("Si cancela, se le entrega toda su información en un archivo de Excel."),

  // Soporte
  h1("8. Soporte y garantía"),
  bullet("Soporte por WhatsApp y teléfono de lunes a domingo, en horario del bar."),
  bullet("Atención de fallas críticas (que impidan vender) el mismo día."),
  bullet("Copias de seguridad automáticas diarias."),
  bullet("Correcciones de errores sin costo mientras el servicio esté activo."),
  bullet("Cambios de precios, productos y usuarios los hace usted misma, sin depender de nadie."),
  espacio(),
  callout(
    "Compromiso",
    "Si durante el primer mes el sistema no le sirve para administrar el bar, se suspende el servicio y no se cobran mensualidades adicionales.",
    COLORS.verde,
  ),

  // Siguiente paso
  h1("9. El siguiente paso"),
  numbered("Revisar juntos la demostración en el bar (30 minutos)."),
  numbered("Elegir el plan y confirmar la fecha de arranque."),
  numbered("Levantamiento de la carta y los precios reales del negocio."),
  numbered("Capacitación del equipo y primera noche acompañada."),
  espacio(),
  p(
    "Si le parece bien, podemos empezar el levantamiento esta misma semana y tener el sistema funcionando antes del próximo fin de semana grande.",
  ),
  espacio(300),
  separador(),
  h3("Aceptación"),
  p("Firmando este documento se acepta la propuesta en el plan seleccionado:"),
  espacio(200),
  tabla(
    [
      { titulo: "Plan seleccionado", ancho: 3200 },
      { titulo: "Fecha de inicio", ancho: 3200 },
      { titulo: "Valor acordado", ancho: 3200 },
    ],
    [["", "", ""]],
  ),
  espacio(500),
  tabla(
    [
      { titulo: "", ancho: 4800, align: AlignmentType.CENTER },
      { titulo: "", ancho: 4800, align: AlignmentType.CENTER },
    ],
    [
      ["_______________________________", "_______________________________"],
      [CLIENTE, PROVEEDOR],
      [NEGOCIO, CONTACTO],
    ],
  ),
  espacio(400),
  p(
    "Esta propuesta es de carácter comercial y no constituye un documento tributario. Los valores están expresados en pesos colombianos e incluyen todos los conceptos descritos.",
    { italics: true, size: 18 },
  ),
];

const doc = new Document({
  creator: "Ronda",
  title: "Ronda — Propuesta comercial",
  description: "Propuesta comercial del sistema de gestión para bares Ronda",
  numbering: NUMERACION,
  sections: [
    {
      ...SECCION,
      headers: { default: encabezado("Ronda · Propuesta comercial") },
      footers: { default: pie(`${PROVEEDOR} · ${CONTACTO}`) },
      children: [...portada, ...contenido],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("docs/Ronda - Propuesta comercial.docx", buffer);
console.log("Listo: docs/Ronda - Propuesta comercial.docx");
