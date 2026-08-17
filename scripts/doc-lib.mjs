/** Piezas comunes para armar los documentos Word de Ronda. */

import {
  AlignmentType,
  BorderStyle,
  Footer,
  Header,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

export const COLORS = {
  ink: "0F131C",
  gris: "52586B",
  suave: "8A90A0",
  marca: "9A5F0A",
  marcaSuave: "FBEFD7",
  linea: "E2E6ED",
  verde: "17663F",
  rojo: "9F2233",
  fondo: "F6F7F9",
};

export const FONT = "Calibri";
const ANCHO = 9600; // ancho útil de la página en twips

export const h1 = (text) =>
  new Paragraph({
    spacing: { before: 360, after: 160 },
    children: [
      new TextRun({ text, bold: true, size: 34, color: COLORS.ink, font: FONT }),
    ],
  });

export const h2 = (text) =>
  new Paragraph({
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({ text, bold: true, size: 26, color: COLORS.marca, font: FONT }),
    ],
  });

export const h3 = (text) =>
  new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({ text, bold: true, size: 23, color: COLORS.ink, font: FONT }),
    ],
  });

export const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: opts.after ?? 120, line: 288 },
    alignment: opts.align,
    children: [
      new TextRun({
        text,
        size: opts.size ?? 22,
        color: opts.color ?? COLORS.gris,
        bold: opts.bold,
        italics: opts.italics,
        font: FONT,
      }),
    ],
  });

/** Párrafo con fragmentos en negrita: rich("Texto ", ["negrita", true], " normal") */
export const rich = (...parts) =>
  new Paragraph({
    spacing: { after: 120, line: 288 },
    children: parts.map((part) => {
      const [text, bold] = Array.isArray(part) ? part : [part, false];
      return new TextRun({
        text,
        bold,
        size: 22,
        color: bold ? COLORS.ink : COLORS.gris,
        font: FONT,
      });
    }),
  });

export const bullet = (text, level = 0) =>
  new Paragraph({
    bullet: { level },
    spacing: { after: 80, line: 288 },
    children: [
      new TextRun({ text, size: 22, color: COLORS.gris, font: FONT }),
    ],
  });

export const numbered = (text) =>
  new Paragraph({
    numbering: { reference: "pasos", level: 0 },
    spacing: { after: 80, line: 288 },
    children: [
      new TextRun({ text, size: 22, color: COLORS.gris, font: FONT }),
    ],
  });

/** Bloque destacado, para advertencias y consejos */
export const callout = (titulo, texto, color = COLORS.marca) =>
  new Table({
    width: { size: ANCHO, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: COLORS.linea },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.linea },
      left: { style: BorderStyle.SINGLE, size: 18, color },
      right: { style: BorderStyle.SINGLE, size: 2, color: COLORS.linea },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: COLORS.fondo },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: titulo, bold: true, size: 22, color, font: FONT }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: texto, size: 21, color: COLORS.gris, font: FONT }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

const celda = (text, { bold, align, fill, color, size } = {}) =>
  new TableCell({
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text: String(text),
            bold,
            size: size ?? 21,
            color: color ?? (bold ? COLORS.ink : COLORS.gris),
            font: FONT,
          }),
        ],
      }),
    ],
  });

/** Tabla con encabezado. columnas: [{ titulo, ancho, align }] */
export const tabla = (columnas, filas) =>
  new Table({
    width: { size: ANCHO, type: WidthType.DXA },
    columnWidths: columnas.map((c) => c.ancho),
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.linea },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.linea },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: COLORS.linea },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: columnas.map((c) =>
          celda(c.titulo, {
            bold: true,
            fill: COLORS.fondo,
            align: c.align,
            color: COLORS.ink,
          }),
        ),
      }),
      ...filas.map(
        (fila) =>
          new TableRow({
            children: fila.map((valor, i) =>
              celda(valor, {
                align: columnas[i].align,
                bold: i === 0 && columnas[0].destacar,
              }),
            ),
          }),
      ),
    ],
  });

export const espacio = (alto = 200) =>
  new Paragraph({ spacing: { after: alto }, children: [] });

export const separador = () =>
  new Paragraph({
    spacing: { before: 200, after: 200 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.linea },
    },
    children: [],
  });

export const encabezado = (texto) =>
  new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: texto, size: 18, color: COLORS.suave, font: FONT }),
        ],
      }),
    ],
  });

export const pie = (texto) =>
  new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `${texto}   ·   `, size: 18, color: COLORS.suave, font: FONT }),
          new TextRun({ children: [PageNumber.CURRENT], size: 18, color: COLORS.suave, font: FONT }),
        ],
      }),
    ],
  });

export const NUMERACION = {
  config: [
    {
      reference: "pasos",
      levels: [
        {
          level: 0,
          format: "decimal",
          text: "%1.",
          alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: 460, hanging: 260 } } },
        },
      ],
    },
  ],
};

export const SECCION = {
  properties: {
    page: {
      margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 },
    },
  },
};
