import contacto from "./contacto.json";

/**
 * Datos de quien desarrolla y presenta la demostración.
 * Se editan en un único archivo (src/config/contacto.json) y de ahí salen:
 * el pie de página, la pantalla "Acerca de" y los documentos de Word.
 */
export const CONTACTO = contacto;

export const DEV = contacto.desarrollador;
export const PRODUCTO = contacto.producto;

/** Enlace directo a WhatsApp con un mensaje ya escrito */
export const whatsappLink = (mensaje: string) =>
  DEV.whatsapp
    ? `https://wa.me/${DEV.whatsapp}?text=${encodeURIComponent(mensaje)}`
    : null;

export const correoLink = (asunto: string) =>
  DEV.correo ? `mailto:${DEV.correo}?subject=${encodeURIComponent(asunto)}` : null;
