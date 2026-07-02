// Pool de niveles de la obra, organizado en un archivo por sección.
// Ver CONTEXT.md → Sección. Acá solo se ensambla: cada archivo de sección
// exporta su pool y este índice le asigna el número de sección.
//
// `errorMsg`: el nivel es un "error no verificable" — muestra el error y
// avanza igual. Nunca bloquea.
// `anchor: 'last'`: nivel fijo al final de su sección, fuera del sorteo.

import mecanica from './seccion-1-mecanica';
import intima from './seccion-2-intima';
import cuerpo from './seccion-3-cuerpo';

export const SECTIONS = [
  { id: 'mecanica', name: 'Verificación mecánica' },
  { id: 'intima', name: 'Extracción de lo íntimo' },
  { id: 'cuerpo', name: 'El cuerpo en juego' },
];

const POOLS = [mecanica, intima, cuerpo];

export const LEVELS = POOLS.flatMap((pool, section) =>
  pool.map((level) => ({ ...level, section }))
);
