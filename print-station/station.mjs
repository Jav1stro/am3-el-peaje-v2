// Estación de impresión de El Peaje v2.
// Corre en la computadora de la sala con la impresora conectada por USB.
// Escucha el canal de Supabase y, cuando un visitante alcanza el final,
// descarga su dibujo y lo imprime en silencio con `lp` (CUPS, macOS/Linux).
//
// Uso:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... npm start
//   (opcional: PRINTER=nombre_de_impresora — ver `lpstat -p`)

import { createClient } from '@supabase/supabase-js';
import { execFile } from 'node:child_process';
import { writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
const printer = process.env.PRINTER;

if (!url || !key) {
  console.error('Faltan SUPABASE_URL y/o SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(url, key);
const CHANNEL = 'el-peaje-v2:imprenta';

async function imprimir(imageUrl) {
  console.log(`[imprenta] Recibido dibujo: ${imageUrl}`);
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Descarga falló: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  const dir = await mkdtemp(join(tmpdir(), 'peaje-'));
  const file = join(dir, 'dibujo.png');
  await writeFile(file, buffer);

  const args = printer ? ['-d', printer, file] : [file];
  await new Promise((resolve, reject) => {
    execFile('lp', args, (err, stdout) => {
      if (err) return reject(err);
      console.log(`[imprenta] ${stdout.trim()}`);
      resolve();
    });
  });
}

supabase
  .channel(CHANNEL)
  .on('broadcast', { event: 'imprimir' }, ({ payload }) => {
    imprimir(payload.url).catch((err) => console.error('[imprenta] Error:', err.message));
  })
  .subscribe((status) => {
    console.log(`[imprenta] Canal ${CHANNEL}: ${status}`);
  });

console.log('[imprenta] Estación de impresión escuchando...');
