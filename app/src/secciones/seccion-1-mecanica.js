import { asset } from '../lib/asset';

// Sección 1 — Verificación mecánica
// Captchas tradicionales: el sistema verifica gestos.
//
// El agua todavía no se nombra como disputa (ver CONTEXT.md → El agua): acá
// entra como trámite, mezclada con niveles neutros que sostienen la fachada.
// La proporción es deliberada — si la sección 1 grita el tema, el destape del
// recelo de la máquina pierde el golpe.

export default [
  // Nivel de transición inicial: siempre abre la sección 1, fuera del sorteo.
  { id: 'checkbox', type: 'checkbox', anchor: 'first' },
  {
    id: 'semaforos',
    type: 'image',
    instruction: 'Seleccioná todas las imágenes que contengan un semáforo.',
    tiles: [1, 2, 3, 4, 5, 6].map((n) => asset(`/imagenes/img_semaforo_${n}.jpg`)),
  },
  {
    id: 'distorsionado-1',
    type: 'distorted',
    img: asset('/imagenes/img_distorsionada_1.jpg'),
    placeholder: 'Escribí el texto que ves arriba',
  },
  {
    // PENDIENTE: reemplazar los 6 tiles por /imagenes/img_fuente_1..6.jpg
    // cuando lleguen las fotos. Por ahora usa las de `agua` como provisorias.
    id: 'fuente-agua',
    type: 'image',
    instruction: 'Seleccioná todas las imágenes que muestren una fuente de agua potable.',
    tiles: [1, 2, 3, 4, 5, 6].map((n) => asset(`/imagenes/img_agua_${n}.jpg`)),
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
    // El 1 va en violeta: lo pone la máquina, no el idioma.
    id: 'sequia',
    type: 'distorted',
    word: 'sequ1a',
    placeholder: 'Transcribí el texto',
  },
  {
    id: 'polidipsia',
    type: 'distorted',
    word: 'polidipsia',
    placeholder: 'Escribí el texto que ves arriba',
  },
  {
    id: 'agua',
    type: 'image',
    instruction: 'Seleccioná todas las imágenes que muestren agua.',
    tiles: [1, 2, 3, 4, 5, 6].map((n) => asset(`/imagenes/img_agua_${n}.jpg`)),
  },
  {
    id: 'distorsionado-2',
    type: 'distorted',
    img: asset('/imagenes/img_distorsionada_2.jpg'),
    placeholder: 'Transcribí el texto',
  },
  {
    id: 'pregunta-agua',
    type: 'options',
    question: '¿Cuándo fue la última vez que tomaste agua?',
    options: ['Hace un momento', 'No recuerdo', 'Estoy intentando', 'No corresponde'],
    errorMsg: 'ERR-HMN-0x4A2 · Respuesta no verificable. Continúe.',
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
