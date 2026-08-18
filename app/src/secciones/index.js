// Pool de niveles de la obra, organizado en un archivo por sección.
// Ver CONTEXT.md → Sección. Acá solo se ensambla: cada archivo de sección
// exporta su pool y este índice le asigna el número de sección.
//
// Cada ENTRADA del pool es un nivel suelto o una CADENA: un array ordenado de
// niveles que viajan juntos y se sortean como una sola pieza (ver CONTEXT.md →
// Cadena). Nunca aparece la respuesta sin su pregunta.
//
// `errorMsg`: el nivel es un "error no verificable" — muestra el error y
// avanza igual. Nunca bloquea.
// `anchor: 'last'`: entrada fija al final de su sección, fuera del sorteo.
// `needs: '<id>'`: la entrada sólo puede salir si arrastra a la que contiene
// ese nivel, ubicada antes en el recorrido (ver ADR 0004).

import mecanica from './seccion-1-mecanica';
import intima from './seccion-2-intima';
import cuerpo from './seccion-3-cuerpo';

export const SECTIONS = [
  { id: 'mecanica', name: 'Verificación mecánica' },
  { id: 'intima', name: 'Extracción de lo íntimo' },
  { id: 'cuerpo', name: 'El cuerpo en juego' },
];

const POOLS = [mecanica, intima, cuerpo];

const conSeccion = (entrada, section) =>
  Array.isArray(entrada)
    ? entrada.map((level) => ({ ...level, section }))
    : { ...entrada, section };

// Las entradas tal como se sortean (con cadenas todavía agrupadas).
export const ENTRADAS = POOLS.flatMap((pool, section) =>
  pool.map((entrada) => conSeccion(entrada, section))
);

// Vista plana de todos los niveles, para buscar por id.
export const LEVELS = ENTRADAS.flatMap((e) => (Array.isArray(e) ? e : [e]));

// Helpers para tratar entradas sueltas y cadenas por igual.
export const nivelesDe = (entrada) => (Array.isArray(entrada) ? entrada : [entrada]);
export const cabezaDe = (entrada) => nivelesDe(entrada)[0];
export const largoDe = (entrada) => nivelesDe(entrada).length;
