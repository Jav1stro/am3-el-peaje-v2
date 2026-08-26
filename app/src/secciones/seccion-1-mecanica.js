import { asset } from '../lib/asset';

// Sección 1 — Verificación mecánica
// Captchas tradicionales: el sistema verifica gestos.
//
// El agua todavía no se nombra como disputa (ver CONTEXT.md → El agua): acá
// entra como trámite, mezclada con niveles neutros que sostienen la fachada.
// La proporción es deliberada — si la sección 1 grita el tema, el destape del
// recelo de la máquina pierde el golpe. Hoy son tres neutros (el puzzle y las
// dos tandas de rostros) y cuatro de agua entre los siete sorteables: la
// proporción quedó dada vuelta respecto del arranque, y todos los captchas de
// texto distorsionado que sobreviven hablan de agua.

export default [
  // Nivel de transición inicial: siempre abre la sección 1, fuera del sorteo.
  { id: 'checkbox', type: 'checkbox', anchor: 'first' },
  {
    // Las ocho definitivas del desglose. Ninguna es una fuente de agua potable:
    // son embotelladora, data center, aspersores, salto, plataforma petrolera,
    // desagüe al mar, laguna salada y duna. El agua aparece como infraestructura,
    // como mercancía o como ausencia — nunca como algo de lo que se pueda tomar.
    id: 'fuente-agua',
    type: 'image',
    instruction: 'Seleccioná todas las imágenes que muestren una fuente de agua potable.',
    tiles: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => asset(`/imagenes/img_fuente_${n}.jpg`)),
  },
  // Las ocho caras del desglose, en dos tandas de cuatro. Ninguna existe: son
  // rostros generados. Los dos niveles son sorteables por separado — con que
  // salga uno, el remate ya se dijo.
  {
    id: 'persona-real-1',
    type: 'image',
    grid: 'caras',
    instruction: '¿Cuál es una persona real?',
    tiles: [1, 2, 3, 4].map((n) => asset(`/imagenes/img_persona_${n}.jpg`)),
    errorMsg: 'ERR-BIO-0x2F · Ninguna de las personas que seleccionaste existe. Continúe.',
  },
  {
    id: 'persona-real-2',
    type: 'image',
    grid: 'caras',
    instruction: '¿Cuál es una persona real?',
    tiles: [5, 6, 7, 8].map((n) => asset(`/imagenes/img_persona_${n}.jpg`)),
    errorMsg: 'ERR-BIO-0x2F · Ninguna de las personas que seleccionaste existe. Continúe.',
  },
  // Los tres del agua. No están garantizados ni en orden: el sorteo puede
  // traer uno solo, o "polidipsia" antes que "sed". Cada uno se lee solo.
  {
    id: 'sed',
    type: 'distorted',
    word: 'sed',
    placeholder: 'Escribí el texto que ves arriba',
  },
  {
    // El 1 va en violeta: lo pone la máquina, no el idioma. Por eso se aceptan
    // las dos lecturas: el que transcribe literal y el que lee "sequía" y
    // escribe la palabra. Para exigir el 1, borrar 'sequia' de `answers`.
    id: 'sequia',
    type: 'distorted',
    word: 'sequ1a',
    answers: ['sequ1a', 'sequia'],
    placeholder: 'Transcribí el texto',
  },
  {
    id: 'polidipsia',
    type: 'distorted',
    word: 'polidipsia',
    placeholder: 'Escribí el texto que ves arriba',
  },
  {
    id: 'puzzle',
    type: 'puzzle',
    instruction: 'Ordená los fragmentos para reconstruir la imagen.',
    pieces: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => asset(`/imagenes/img_juego_${n}.jpg`)),
  },
  {
    // Nivel de transición: siempre cierra la sección 1, puente hacia la 2.
    id: 'tos',
    type: 'tos',
    anchor: 'last',
  },
];
