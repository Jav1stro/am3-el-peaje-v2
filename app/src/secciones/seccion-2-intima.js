// Sección 2 — Extracción de lo íntimo
// El sistema pregunta por emociones, hábitos, conducta; pide renunciar a
// derechos. Verifica el interior.

export default [
  {
    id: 'emociones',
    type: 'options',
    question: 'Seleccioná las emociones que estás experimentando actualmente.',
    options: ['Frustración', 'Confusión', 'Curiosidad', 'Alivio'],
    multi: true,
    errorMsg: 'ERR-HMN-0x7F1 · Emoción no verificable. Continúe.',
  },
  {
    id: 'perfil-conductual',
    type: 'options',
    question:
      'Para completar su perfil conductual, indique su método primario de regulación emocional.',
    options: ['Sexo', 'Sustancias', 'Pantallas', 'Ninguno de los anteriores (no verificable)'],
  },
  {
    id: 'prioridades',
    type: 'prioridades',
    errorMsg: 'ERR-EXT-0x5C · Sus renuncias no maximizan nuestro rendimiento. Continúe.',
  },
];
