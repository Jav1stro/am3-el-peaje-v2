// Configuración del recorrido.
// Cantidad de niveles a sortear por sección (se recorta al tamaño del pool
// si el pool todavía es más chico).
// La S2 tiene un pool grande (17 niveles): acá se decide cuántos ve cada
// visitante. Ojo que una cadena consume tantos lugares como eslabones tiene.
export const SECTION_LEVEL_COUNTS = [7, 6, 2];

// Rampa de caos por sección: [caos al entrar, caos al salir].
// Los saltos entre secciones son deliberadamente más grandes que los saltos
// entre niveles de una misma sección.
export const SECTION_CHAOS_RAMPS = [
  [0, 3],
  [5, 7],
  [8, 9],
];

// El teatro de verificación (variantes, textos y duraciones por sección)
// vive en src/data/verificaciones.js.

// Cuánto queda visible el "error no verificable" antes de avanzar (ms)
export const ERROR_DISPLAY_MS = 2400;
