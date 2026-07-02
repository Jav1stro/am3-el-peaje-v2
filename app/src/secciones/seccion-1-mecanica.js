// Sección 1 — Verificación mecánica
// Captchas tradicionales: el sistema verifica gestos.

export default [
  // Nivel de transición inicial: siempre abre la sección 1, fuera del sorteo.
  { id: 'checkbox', type: 'checkbox', anchor: 'first' },
  {
    id: 'semaforos',
    type: 'image',
    instruction: 'Seleccioná todas las imágenes que contengan un semáforo.',
    tiles: [1, 2, 3, 4, 5, 6].map((n) => `/imagenes/img_semaforo_${n}.jpg`),
  },
  {
    id: 'distorsionado-1',
    type: 'distorted',
    img: '/imagenes/img_distorsionada_1.jpg',
    placeholder: 'Escribí el texto que ves arriba',
  },
  {
    id: 'agua',
    type: 'image',
    instruction: 'Seleccioná todas las imágenes que muestren agua.',
    tiles: [1, 2, 3, 4, 5, 6].map((n) => `/imagenes/img_agua_${n}.jpg`),
  },
  {
    id: 'distorsionado-2',
    type: 'distorted',
    img: '/imagenes/img_distorsionada_2.jpg',
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
    pieces: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `/imagenes/img_juego_${n}.jpg`),
  },
  {
    // Nivel de transición: siempre cierra la sección 1, puente hacia la 2.
    id: 'tos',
    type: 'tos',
    anchor: 'last',
  },
];
