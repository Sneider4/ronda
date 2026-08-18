/**
 * Genera "Ronda - Manual de usuario.docx"
 *   node scripts/generar-manual.mjs
 */

import { writeFileSync } from "node:fs";
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

import { readFileSync } from "node:fs";

const cfg = JSON.parse(
  readFileSync(new URL("../src/config/contacto.json", import.meta.url), "utf8"),
);
const dev = cfg.desarrollador;
const cli = cfg.cliente;

const PROVEEDOR = dev.nombre || "[Su nombre / empresa]";
const CONTACTO = [dev.telefono, dev.correo].filter(Boolean).join(" · ") || "[teléfono] · [correo]";
const ENLACE = cfg.producto.url || "[enlace de la aplicación]";
const CLIENTE = cli.propietaria || "[Nombre de la propietaria]";
const NEGOCIO = cli.negocio || "[Nombre del bar]";

const portada = [
  espacio(1400),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: "RONDA", bold: true, size: 72, color: COLORS.ink, font: FONT }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
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
    spacing: { after: 120 },
    children: [
      new TextRun({ text: "Manual de usuario", bold: true, size: 40, color: COLORS.ink, font: FONT }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 900 },
    children: [
      new TextRun({
        text: "Guía completa para el manejo diario del bar",
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
      ["Preparado para", `${CLIENTE} — ${NEGOCIO}`],
      ["Preparado por", PROVEEDOR],
      ["Contacto", CONTACTO],
      ["Versión del documento", "1.0"],
      ["Aplicación", ENLACE],
    ],
  ),
  espacio(400),
  callout(
    "Sobre esta versión",
    "Este manual describe la versión de demostración del sistema. Todo lo que aparece aquí funciona y se puede probar, pero los datos son de ejemplo: ninguna operación afecta dinero real. El documento se actualiza cuando el sistema entre en funcionamiento en el bar.",
  ),
  new Paragraph({ pageBreakBefore: true, children: [] }),
];

const contenido = [
  h1("Contenido"),
  ...[
    "1. Qué es Ronda y para qué sirve",
    "2. Cómo entrar al sistema",
    "3. El día a día en seis pasos",
    "4. Dashboard: el resumen del día",
    "5. Mesas: el corazón del sistema",
    "6. Tomar el pedido de una mesa",
    "7. Cobrar una cuenta y entregar el comprobante",
    "8. Inventario: saber qué hay y qué falta",
    "9. Productos: la carta y los precios",
    "10. Ventas: el historial de todo lo vendido",
    "11. Gastos: lo que sale de la caja",
    "12. Balance del mes: el cuaderno cuadrado",
    "13. Caja: el cierre del turno",
    "14. Reportes: entender el negocio",
    "15. Empleados y permisos",
    "16. Preguntas frecuentes",
    "17. Rutina recomendada del día",
  ].map((t) => p(t, { size: 22, color: COLORS.ink })),
  new Paragraph({ pageBreakBefore: true, children: [] }),

  // 1
  h1("1. Qué es Ronda y para qué sirve"),
  p(
    "Ronda es el sistema que reemplaza el cuaderno de cuentas del bar. Reúne en un solo lugar lo que hoy está repartido entre hojas, memoria y confianza: qué mesa está ocupada, cuánto lleva consumido cada una, qué se vendió, qué queda en la nevera, cuánto se pagó a los proveedores y cuánto quedó al final del mes.",
  ),
  p("Con Ronda, en cualquier momento usted puede responder:"),
  bullet("¿Cuánto he vendido hoy? ¿Y este mes?"),
  bullet("¿Qué mesas están ocupadas y cuánto debe cada una?"),
  bullet("¿Qué producto es el que más se vende? ¿A qué hora se mueve el bar?"),
  bullet("¿Qué se está acabando y hay que comprar antes del fin de semana?"),
  bullet("¿Cuánto salió en compras, arriendo, nómina y servicios?"),
  bullet("¿Cuánto me quedó realmente a mí?"),
  espacio(),
  callout(
    "Lo más importante",
    "Ronda no le pide cambiar la forma de trabajar del bar. Lo que hoy se anota en el cuaderno, se anota en la pantalla; la diferencia es que las cuentas las hace el sistema y nunca se pierden.",
  ),

  // 2
  h1("2. Cómo entrar al sistema"),
  p(
    "Ronda funciona en el navegador (Chrome, Edge o Safari), en cualquier equipo: computador, tablet o celular. No hay que instalar nada.",
  ),
  numbered("Abra el navegador y entre a la dirección del sistema: " + ENLACE),
  numbered("El sistema abre en la pantalla que le corresponde a su usuario."),
  numbered("En un celular, el menú aparece con el botón de las tres rayas, arriba a la izquierda."),
  espacio(),
  h3("Un consejo para el punto de venta"),
  p(
    "En el equipo de la barra conviene dejar la página abierta como una pestaña fija, o agregarla a la pantalla de inicio de la tablet: así queda como si fuera una aplicación instalada.",
  ),

  // 3
  h1("3. El día a día en seis pasos"),
  p("Una noche normal en el bar se maneja así:"),
  numbered("Al abrir: revise el Dashboard y la caja (base inicial del turno)."),
  numbered("Llega un cliente: en Mesas, toque una mesa libre y agregue lo que pidió."),
  numbered("Piden más: vuelva a la mesa y agregue; la cuenta se actualiza sola."),
  numbered("Piden la cuenta: el mesero marca “Pidió la cuenta”; la mesa se pone azul."),
  numbered("Cobro: se elige el medio de pago, se entrega el comprobante y la mesa queda libre."),
  numbered("Al cerrar: se cuenta el efectivo y se cierra la caja del turno."),

  // 4
  h1("4. Dashboard: el resumen del día"),
  p(
    "Es la primera pantalla. Arriba están las cinco cifras que resumen la noche: la venta de hoy, la venta del mes, cuántas mesas están ocupadas, cuánto suman las cuentas abiertas y cuántos productos se han vendido.",
  ),
  h3("Qué más encuentra aquí"),
  bullet("Ventas de los últimos 7 días, para comparar cómo va la semana."),
  bullet("Cómo pagaron hoy: efectivo, tarjeta, transferencia y Nequi."),
  bullet("Lo más vendido del día."),
  bullet("El estado del salón mesa por mesa, con lo que debe cada una."),
  bullet("Las alertas de inventario: lo que se está acabando."),
  bullet("Las últimas ventas, con acceso directo al comprobante."),
  bullet("El horario de mayor movimiento del día."),
  espacio(),
  callout(
    "Para qué le sirve",
    "El dashboard es la foto del negocio en un vistazo. Si solo tiene un minuto al día para mirar el sistema, mírelo aquí.",
  ),

  // 5
  h1("5. Mesas: el corazón del sistema"),
  p(
    "La pantalla de Mesas muestra el salón completo. Cada mesa tiene un color y un estado:",
  ),
  tabla(
    [
      { titulo: "Estado", ancho: 2200, destacar: true },
      { titulo: "Qué significa", ancho: 7400 },
    ],
    [
      ["Disponible", "La mesa está libre y lista para recibir clientes."],
      ["Ocupada", "Hay clientes consumiendo. Muestra el mesero, el tiempo y el total."],
      ["Por pagar", "Los clientes ya pidieron la cuenta. Es el turno de la caja."],
      ["Reservada", "Está apartada para alguien, con nombre y hora de llegada."],
    ],
  ),
  espacio(),
  p(
    "Arriba puede filtrar por estado (solo ocupadas, solo por pagar…) y ver el total de consumo en curso: la plata que está en el salón sin cobrar.",
  ),
  h3("Abrir una mesa"),
  numbered("Toque una mesa disponible."),
  numbered("Toque “Agregar producto”."),
  numbered("Elija los productos: la mesa queda ocupada automáticamente."),

  // 6
  h1("6. Tomar el pedido de una mesa"),
  p(
    "Al tocar “Agregar producto” se abre la carta. Puede buscar por nombre o filtrar por categoría: cervezas, licores, cócteles, bebidas y snacks.",
  ),
  bullet("Cada toque suma una unidad; aparece un número verde confirmando."),
  bullet("Abajo se ve, en todo momento, cuánto lleva la cuenta."),
  bullet("Al terminar, toque “Listo” y vuelve al detalle de la mesa."),
  espacio(),
  h3("Corregir una cuenta"),
  p(
    "En el detalle de la mesa, cada producto tiene los botones – y + para cambiar la cantidad, y el bote de basura para quitarlo. El total se recalcula solo.",
  ),
  h3("Cambiar el mesero de una mesa"),
  p(
    "En el recuadro “Atiende” se puede cambiar quién está atendiendo esa mesa. Eso queda registrado en la venta.",
  ),
  espacio(),
  callout(
    "Si un producto está agotado",
    "El sistema nunca frena una venta: si no hay existencias registradas, igual se puede vender y el inventario queda en negativo. Cuando se cargue el surtido, esas unidades se descuentan solas. Vea el capítulo 8.",
  ),

  // 7
  h1("7. Cobrar una cuenta y entregar el comprobante"),
  numbered("En el detalle de la mesa, toque “Cerrar cuenta”."),
  numbered("Elija el medio de pago: efectivo, tarjeta, transferencia o Nequi."),
  numbered("Si quiere, agregue la propina voluntaria (5 % o 10 %)."),
  numbered("Si paga en efectivo, escriba con cuánto paga y el sistema calcula el cambio."),
  numbered("Toque “Confirmar pago”."),
  espacio(),
  p("Al confirmar, tres cosas pasan al tiempo:"),
  bullet("Se genera la venta con su número consecutivo."),
  bullet("Se descuenta el inventario de lo que se consumió."),
  bullet("La mesa queda libre para el siguiente cliente."),
  espacio(),
  h3("El comprobante"),
  p(
    "Aparece el comprobante de venta del establecimiento, con el detalle de lo consumido, el total y el medio de pago. Se puede imprimir con el botón “Imprimir”.",
  ),
  callout(
    "Importante: no es factura electrónica",
    "Este documento es un comprobante interno del bar, para el cliente y para el control del negocio. No tiene validez tributaria ni reemplaza la facturación electrónica de la DIAN. El propio comprobante lo dice al pie.",
    COLORS.rojo,
  ),

  // 8
  h1("8. Inventario: saber qué hay y qué falta"),
  p(
    "El inventario muestra todos los productos con sus existencias, el mínimo que debería haber y su estado:",
  ),
  tabla(
    [
      { titulo: "Estado", ancho: 2200, destacar: true },
      { titulo: "Qué significa", ancho: 7400 },
    ],
    [
      ["Disponible", "Hay suficiente producto."],
      ["Stock bajo", "Está por debajo del mínimo: toca comprar pronto."],
      ["Agotado", "No queda nada registrado."],
      ["Por cuadrar", "Se vendió más de lo que había: falta ingresar el surtido."],
    ],
  ),
  espacio(),
  h3("Alertas de reposición"),
  p(
    "Arriba aparece el bloque de alertas con los productos que necesitan reposición, y en la campana de la barra superior queda el aviso con el número. Es la forma de no volver a quedarse sin cerveza un sábado.",
  ),
  h3("Registrar la llegada de mercancía"),
  numbered("Toque “Reponer” en el producto (o “Ingresar”, si está por cuadrar)."),
  numbered("Elija la cantidad recibida: 6, 12, 24, 30 o escriba otra."),
  numbered("Confirme. El sistema le muestra con cuántas unidades queda."),
  espacio(),
  callout(
    "Vender sin existencias",
    "Cuando llega el surtido y se vende el mismo día antes de ingresarlo, el producto queda en negativo y aparece en “Falta ingresar mercancía”. Al registrar la entrada, esas unidades se descuentan automáticamente y todo cuadra. El sistema deja el faltante a la vista para que nunca se convierta en un hueco silencioso.",
  ),

  // 9
  h1("9. Productos: la carta y los precios"),
  p(
    "Aquí se administra la carta del bar. De cada producto se guarda el nombre, la presentación, la categoría, el precio de venta, el costo de compra, las existencias y el stock mínimo.",
  ),
  bullet("“Nuevo producto” agrega un producto a la carta."),
  bullet("El lápiz permite editar precios, costos y existencias."),
  bullet("El bote de basura lo saca de la carta (pide confirmación)."),
  espacio(),
  h3("La ganancia se calcula sola"),
  p(
    "Al escribir el precio de venta y el costo de compra, el sistema muestra cuánto gana por unidad y en qué porcentaje. Es la forma rápida de ver si un producto vale la pena o si hay que subirle el precio.",
  ),

  // 10
  h1("10. Ventas: el historial de todo lo vendido"),
  p(
    "Todas las ventas quedan guardadas con su número, fecha, hora, mesa, empleado, medio de pago y total. Nada se borra.",
  ),
  h3("Filtros disponibles"),
  bullet("Por periodo: hoy, un día específico, últimos 7 días, este mes o todo."),
  bullet("Por medio de pago."),
  bullet("Por mesa."),
  bullet("Por número de venta."),
  espacio(),
  p(
    "Al elegir “Un día” aparece un calendario y el botón “Ver resumen del día”, que abre el resumen completo de esa fecha. Tocando cualquier venta se abre su comprobante.",
  ),

  // 11
  h1("11. Gastos: lo que sale de la caja"),
  p(
    "Un negocio no se entiende solo con lo que entra. En Gastos se registra todo lo que sale: compras a proveedores, arriendo, nómina, servicios públicos, mantenimiento, música y los retiros de la propietaria.",
  ),
  h3("Registrar un gasto"),
  numbered("Toque “Registrar gasto”."),
  numbered("Escriba en qué se gastó, elija la categoría y el proveedor."),
  numbered("Escriba el valor y cómo se pagó."),
  numbered("Indique si ya se pagó o si queda pendiente (con fecha de plazo)."),
  espacio(),
  h3("Cuentas por pagar"),
  p(
    "Los gastos marcados como pendientes aparecen arriba, en “Cuentas por pagar”, con la fecha de vencimiento y un botón para marcarlas como pagadas cuando se cancelen. En el menú lateral queda el contador de pendientes.",
  ),
  callout(
    "Dos aclaraciones que hace el sistema",
    "1) Los gastos pagados en efectivo se descuentan del efectivo esperado de la caja, para que el arqueo cuadre. 2) Los retiros de la propietaria se registran, pero se muestran aparte: no son un gasto del bar, son la plata que usted ya se llevó.",
  ),

  // 12
  h1("12. Balance del mes: el cuaderno cuadrado"),
  p(
    "Esta es la pantalla del dueño. Muestra tres números grandes: cuánto entró por ventas, cuánto salió en gastos y cuánto le quedó al negocio, con el margen y una proyección de cómo cerraría el mes si sigue igual.",
  ),
  h3("Lo que entró"),
  p(
    "Se detalla la venta del mes con propina, se restan las propinas (que son del equipo) y los descuentos, y queda la venta real del negocio. Debajo se ve cómo pagaron los clientes.",
  ),
  h3("Lo que salió"),
  p("Los gastos del mes ordenados por categoría, para ver en qué se va la plata."),
  h3("Día por día"),
  p(
    "La tabla final es el cuaderno de siempre: cada día con sus ventas, propinas, gastos y lo que quedó, y el total del mes al pie. Tocando cualquier día se abre el resumen completo de esa noche: lo que se vendió, a qué hora, qué se movió más y cada venta con su comprobante.",
  ),
  h3("Comparar meses"),
  p(
    "Arriba puede cambiar de mes. Cuando el mes va corriendo, la comparación se hace contra los mismos días del mes anterior, para que sea justa.",
  ),

  // 13
  h1("13. Caja: el cierre del turno"),
  p(
    "La caja resume el turno: total vendido, desglose por medio de pago, número de ventas, productos vendidos, ticket promedio, propinas, descuentos, devoluciones y gastos pagados en efectivo.",
  ),
  h3("El efectivo esperado"),
  p("El sistema calcula cuánto debería haber en la caja:"),
  bullet("Base inicial del turno"),
  bullet("+ Ventas en efectivo"),
  bullet("− Gastos pagados en efectivo"),
  espacio(),
  h3("Cerrar la caja"),
  numbered("Revise en “Antes de cerrar” que no queden mesas sin cobrar."),
  numbered("Toque “Cerrar caja”."),
  numbered("Cuente el efectivo real y escríbalo."),
  numbered("El sistema muestra si sobra, si falta o si cuadra exacto."),
  numbered("Confirme el cierre. Queda el resumen del turno."),
  espacio(),
  callout(
    "El dato que más cuida el bolsillo",
    "La diferencia de caja es la señal temprana de que algo no está bien: cuentas mal cobradas, producto que sale sin registrar o errores de digitación. Si se revisa todas las noches, los problemas se detectan en días, no en meses.",
  ),

  // 14
  h1("14. Reportes: entender el negocio"),
  p("Reportes responde las preguntas de fondo, con datos y no con impresiones:"),
  bullet("Producto más vendido del periodo."),
  bullet("Hora de mayor venta."),
  bullet("Día con mayores ventas."),
  bullet("Categoría que más aporta (cervezas, licores, cócteles…)."),
  bullet("Ventas por día, por hora y promedio por día de la semana."),
  espacio(),
  p(
    "Se puede ver el periodo de los últimos 7 o 30 días. Sirve para decidir qué comprar, cuánto personal poner y en qué horario conviene una promoción.",
  ),

  // 15
  h1("15. Empleados y permisos"),
  p(
    "Cada empleado tiene un rol y cada rol ve solo lo que le corresponde. La información del negocio es de la propietaria.",
  ),
  tabla(
    [
      { titulo: "Acción", ancho: 4200, destacar: true },
      { titulo: "Administrador", ancho: 1800, align: AlignmentType.CENTER },
      { titulo: "Caja", ancho: 1600, align: AlignmentType.CENTER },
      { titulo: "Mesero", ancho: 2000, align: AlignmentType.CENTER },
    ],
    [
      ["Tomar pedidos y abrir mesas", "Sí", "Sí", "Sí"],
      ["Cobrar y cerrar cuentas", "Sí", "Sí", "No"],
      ["Ver existencias y alertas", "Sí", "Sí", "No"],
      ["Aplicar descuentos", "Sí", "No", "No"],
      ["Modificar precios y productos", "Sí", "No", "No"],
      ["Registrar gastos", "Sí", "Sí", "No"],
      ["Cerrar la caja del turno", "Sí", "Sí", "No"],
      ["Ver el balance del mes", "Sí", "No", "No"],
      ["Ver reportes del negocio", "Sí", "No", "No"],
    ],
  ),
  espacio(),
  p(
    "Un mesero solo ve la pantalla de Mesas. No ve la venta del día, ni las existencias, ni los reportes, y no puede cobrar: marca que la mesa pidió la cuenta y la caja se encarga.",
  ),
  p(
    "Para comprobarlo, en el menú de su nombre (arriba a la derecha) está la opción “Ver el sistema como”, que permite entrar como cualquier empleado y ver exactamente lo que él ve.",
  ),

  // 16
  h1("16. Preguntas frecuentes"),
  ...[
    [
      "¿Puedo vender un producto que está agotado?",
      "Sí. El sistema nunca bloquea una venta. El producto queda en negativo y aparece en el inventario como “Por cuadrar” hasta que se registre la entrada de mercancía.",
    ],
    [
      "¿El mesero se entera de que algo se acabó?",
      "No. Para él todos los productos se ven igual. Las existencias y las alertas solo las ve quien tenga el permiso de inventario.",
    ],
    [
      "¿Qué pasa si me equivoco al agregar un producto?",
      "En el detalle de la mesa puede cambiar la cantidad o eliminar el producto antes de cobrar. Después del cobro, la venta queda registrada como está.",
    ],
    [
      "¿Esto sirve para la DIAN?",
      "No. El comprobante es un documento interno del bar. Si más adelante necesita facturación electrónica, se conecta con un proveedor autorizado y se cotiza aparte.",
    ],
    [
      "¿Se pierde la información si cierro el navegador?",
      "En la versión de demostración, lo que haga se conserva durante el día en el mismo equipo. En la versión de producción la información queda guardada en la base de datos del sistema.",
    ],
    [
      "¿Puedo usarlo en el celular?",
      "Sí. La aplicación se adapta a celular, tablet y computador. Los meseros pueden tomar el pedido desde el celular.",
    ],
    [
      "¿Cuántas personas pueden usarlo al tiempo?",
      "Las que necesite: cada empleado entra con su usuario en su propio equipo.",
    ],
    [
      "¿Y si se va el internet?",
      "Está previsto que el sistema siga funcionando sin conexión y sincronice cuando vuelva el servicio. Ese punto se detalla en la propuesta comercial.",
    ],
    [
      "¿Cómo dejo la demostración como nueva?",
      "En el menú de su nombre, “Reiniciar datos de la demostración”.",
    ],
  ].flatMap(([q, a]) => [h3(q), p(a)]),

  // 17
  h1("17. Rutina recomendada del día"),
  h3("Al abrir"),
  bullet("Revisar el Dashboard: cómo viene la semana."),
  bullet("Revisar las alertas de inventario antes de que llegue el proveedor."),
  bullet("Confirmar la base de la caja."),
  h3("Durante la noche"),
  bullet("Registrar cada pedido en la mesa correspondiente, sin acumular."),
  bullet("Marcar “Pidió la cuenta” cuando el cliente la solicite."),
  bullet("Cobrar desde el sistema, no de memoria."),
  h3("Al cerrar"),
  bullet("Verificar que no queden mesas abiertas."),
  bullet("Registrar los gastos del día que se pagaron en efectivo."),
  bullet("Contar el efectivo y cerrar la caja."),
  bullet("Mirar el resumen del día: cuánto entró, cuánto salió, cuánto quedó."),
  espacio(),
  separador(),
  p(
    "Cualquier duda sobre el manejo del sistema, comuníquese con " +
      PROVEEDOR +
      " — " +
      CONTACTO +
      ".",
    { italics: true },
  ),
];

const doc = new Document({
  creator: "Ronda",
  title: "Ronda — Manual de usuario",
  description: "Manual de usuario del sistema de gestión para bares Ronda",
  numbering: NUMERACION,
  sections: [
    {
      ...SECCION,
      headers: { default: encabezado("Ronda · Manual de usuario") },
      footers: { default: pie("Ronda · Sistema de gestión para bares") },
      children: [...portada, ...contenido],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("docs/Ronda - Manual de usuario.docx", buffer);
console.log("Listo: docs/Ronda - Manual de usuario.docx");
