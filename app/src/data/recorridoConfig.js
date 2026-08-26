// Configuración del recorrido.
// Cantidad de niveles a sortear por sección (se recorta al tamaño del pool
// si el pool todavía es más chico).
// La S2 tiene un pool grande (26 niveles): acá se decide cuántos ve cada
// visitante. Ojo que una cadena consume tantos lugares como eslabones tiene.
// La S3 pasó de 2 a 4 al sumar las mecánicas de cuerpo del desglose: el vaso
// (anclado) más tres sorteadas entre cámara, emociones, voz, movimiento y
// felicidad. Subirla más alarga bastante el tramo de permisos de sensores.
export const SECTION_LEVEL_COUNTS = [7, 6, 4];

// Rampa de caos por sección: [caos al entrar, caos al salir].
// Los saltos entre secciones son deliberadamente más grandes que los saltos
// entre niveles de una misma sección.
export const SECTION_CHAOS_RAMPS = [
  [0, 3],
  [5, 7],
  [8, 9],
];

// Cuántos niveles de la MISMA mecánica (tipo de nivel) puede traer una sección.
// Sin tope el azar tiende a la monotonía: la S2 tiene doce niveles de opciones
// y siete de texto contra uno de cada otra cosa, así que un visitante podía
// recibir cinco pantallas de "elegir de una lista" al hilo.
//   S1 en 2 — con eso el puzzle entra siempre, y es el único captcha neutro que
//             queda para sostener la fachada (ver CONTEXT.md → El agua).
//   S2 en 2 — corta los recorridos de 3, 4 y 5 pantallas de escribir.
//   S3 en 1 — impide que salgan las dos de cámara en el mismo recorrido.
// Es una preferencia, no un recorte: si el tope impide llenar los lugares de la
// sección, el sorteo lo ignora antes que dejar la sección corta.
export const SECTION_TYPE_CAPS = [2, 2, 1];

// Después de sortear, reordena para que no caigan dos niveles seguidos con la
// misma mecánica. No cambia qué entra, sólo el orden.
export const SEPARAR_MECANICAS = true;

// El teatro de verificación (variantes, textos y duraciones por sección)
// vive en src/data/verificaciones.js.

// Cuánto queda visible el "error no verificable" antes de avanzar (ms)
export const ERROR_DISPLAY_MS = 2400;
