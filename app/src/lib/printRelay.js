import { supabase } from './supabase';

const BUCKET = 'dibujos';
const CHANNEL = 'el-peaje-v2:imprenta';

// Sube el dibujo (dataURL) y avisa a la estación de impresión de la sala.
// El dibujo es anónimo: sin identificadores del visitante (ver ADR 0002).
export async function sendDrawingToPrint(dataUrl) {
  if (!supabase) {
    console.warn('[printRelay] Sin Supabase configurado: impresión desactivada.');
    return { ok: false, reason: 'sin-config' };
  }

  const blob = await (await fetch(dataUrl)).blob();
  const path = `dibujo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/png',
  });
  if (uploadError) return { ok: false, reason: uploadError.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const channel = supabase.channel(CHANNEL);
  await new Promise((resolve) => {
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') resolve();
    });
  });
  await channel.send({
    type: 'broadcast',
    event: 'imprimir',
    payload: { url: data.publicUrl },
  });
  supabase.removeChannel(channel);

  return { ok: true };
}
