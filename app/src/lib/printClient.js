// Envía el dibujo a peaje-core, que lo imprime como ticket térmico en la sala
// (ver ADR 0005). peaje-core corre en una Raspberry y se expone por un túnel
// HTTPS; VITE_PEAJE_CORE_URL dice adónde, y se hornea en build.
//
// Sin la variable, la obra funciona completa: el final simplemente no imprime.
// Con el dibujo viajan los textos del ticket, que son voz de la máquina:
// ninguna respuesta del visitante llega al papel.

import { TICKET_ENCABEZADO, piePara } from '../data/ticketText';

const BASE = import.meta.env.VITE_PEAJE_CORE_URL;

export async function sendDrawingToPrint(dataUrl) {
  if (!BASE) {
    console.warn('[impresion] Sin VITE_PEAJE_CORE_URL: impresión desactivada.');
    return { ok: false, reason: 'sin-config' };
  }

  const blob = await (await fetch(dataUrl)).blob();
  const body = new FormData();
  body.append('drawing', blob, 'dibujo.png');
  // La voz del ticket es de la obra, no de la estación (ver ADR 0005).
  body.append('header', TICKET_ENCABEZADO);
  body.append('footer', piePara());

  try {
    const res = await fetch(`${BASE}/printer/drawing`, { method: 'POST', body });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    return { ok: true };
  } catch (err) {
    console.warn('[impresion] No se pudo emitir el ticket:', err.message);
    return { ok: false, reason: err.message };
  }
}
