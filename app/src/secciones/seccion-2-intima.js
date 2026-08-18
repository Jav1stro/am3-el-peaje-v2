// Sección 2 — Extracción de lo íntimo
// El sistema pregunta por emociones, recuerdos, hábitos, conducta; pide
// renunciar a derechos. Verifica el interior.
//
// Los arrays son CADENAS (ver CONTEXT.md → Cadena): entran al recorrido juntas
// y en orden, con el teatro de verificación entre eslabón y eslabón. El error
// no verificable va SIEMPRE en el último eslabón, nunca en el primero: la
// máquina no comenta nada hasta que ya te sacó todo.

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
    // El sistema abandona el usted justo acá: la cercanía fingida como método
    // de extracción. Un recuerdo de infancia es lo más inverificable que
    // puede pedir — y se lo queda igual.
    id: 'miedo-infancia',
    type: 'text',
    logo: 'Registro de historial afectivo',
    question: 'Contame a qué le tenías miedo cuando eras chico.',
    subtitle: 'Nadie más va a leer esto.',
    placeholder: 'Escribí lo que te acuerdes',
    emptyHint: 'Dale, algo te acordás.',
    errorMsg: 'ERR-MEM-0x1D · Recuerdo no verificable. Registrado de todos modos. Continúe.',
  },
  {
    id: 'prioridades',
    type: 'prioridades',
    errorMsg: 'ERR-EXT-0x5C · Sus renuncias no maximizan nuestro rendimiento. Continúe.',
  },

  // ── Cadena: la ternura como armadura ──────────────────────────────────────
  // Un lugar ameno por el cual entrar a lo íntimo. Y después la máquina
  // confiesa que para ella eso era un significante sin contenido.
  [
    {
      id: 'ternura',
      type: 'options',
      logo: 'Registro de historial afectivo',
      question: '¿Cuándo fue la última vez que fuiste tiernx?',
      options: [
        'Hace pocos días',
        'Por lo menos un par de meses',
        'Lo recuerdo, pero ya hace tiempo',
        'No recuerdo con exactitud',
      ],
    },
    {
      id: 'ternura-significante',
      type: 'options',
      logo: 'Comunicación del sistema',
      question: '¿Sabías que para mí la ternura no es más que un significante?',
      options: ['No', 'Sí', 'No entiendo la pregunta'],
      errorMsg: 'ERR-SEM-0x11 · Significante sin contenido. Registrado. Continúe.',
    },
  ],

  // ── Cadena: el secreto ────────────────────────────────────────────────────
  [
    {
      id: 'secreto',
      type: 'options',
      logo: 'Registro de historial afectivo',
      question: 'Si te pido un secreto, uno guardado y archivado, ¿se te viene uno a la cabeza de golpe?',
      options: ['Sí', 'No', 'Puede ser'],
    },
    {
      id: 'secreto-tormento',
      type: 'options',
      logo: 'Comunicación del sistema',
      question: '¿Te atormenta? El secreto, digo…',
      options: ['Sí', 'No', 'Puede ser'],
      errorMsg: 'ERR-SEC-0x03 · Secreto no verificable. Archivado igualmente. Continúe.',
    },
  ],

  // ── Cadena: el consentimiento informado ───────────────────────────────────
  // El sistema habla del derecho a saber que sos objeto de estudio mientras
  // te estudia. El segundo eslabón deja la frase abierta a propósito.
  [
    {
      id: 'nuremberg',
      type: 'text',
      logo: 'Marco normativo',
      body: 'El consentimiento informado como concepto legal existe recién desde 1947, con el Código de Núremberg.',
      question: '¿Sabías?',
      placeholder: 'Escribí tu respuesta',
      emptyHint: 'Contestá algo antes de continuar.',
    },
    {
      id: 'nuremberg-reitera',
      type: 'text',
      logo: 'Marco normativo',
      body: 'Hasta 1947 nadie tenía derecho a saber que era objeto de estudio.',
      question: 'Vos lo sabés,',
      placeholder: 'Escribí tu respuesta',
      emptyHint: 'Contestá algo antes de continuar.',
      errorMsg: 'ERR-CNS-1947 · El consentimiento no aplica a este proceso. Continúe.',
    },
  ],

  // Origen de la cita del agua: su respuesta queda en el expediente y vuelve
  // varios niveles después (ver ADR 0004).
  {
    id: 'agua-cuando',
    type: 'options',
    question: '¿Cuándo fue la última vez que tomaste agua?',
    options: [
      { label: 'Hace poco', cita: 'hace un rato' },
      { label: 'Más de 3 horas', cita: 'hace más de tres horas' },
      { label: 'Por lo menos esta mañana', cita: 'esta mañana' },
      { label: 'En algún momento', cita: 'un momento que no pudiste precisar' },
    ],
    record: 'agua',
  },
  {
    // La cita. Arrastra a `agua-cuando` hacia atrás si sale sorteada.
    id: 'agua-recordatorio',
    type: 'statement',
    needs: 'agua-cuando',
    text: 'Te recuerdo que, según lo que declaraste, no tomás agua desde {{agua}}.',
    fallback: { agua: 'hace un rato' },
    cta: 'Continuar',
  },

  {
    // El descanso: un significante sin contenido, que es exactamente lo que la
    // máquina dijo de la ternura. El respiro y la tesis son la misma cosa.
    id: 'descanso-distorsionado',
    type: 'distorted',
    word: 'k4x9mz',
    placeholder: 'Escribí el texto que ves arriba',
  },
  {
    id: 'aprendizaje-niveles',
    type: 'options',
    question: '¿Cuáles son tus niveles de aprendizaje?',
    options: ['Primario', 'Secundario', 'Facultad', 'Postgrado', 'Maestría'],
  },

  // ── Cadena: la máquina dice que aprende ───────────────────────────────────
  [
    {
      id: 'te-ensena-algo',
      type: 'options',
      logo: 'Comunicación del sistema',
      body: '¡Está buenísimo esto! Cada respuesta me enseña algo.',
      question: '¿Y a vos esto te enseña algo?',
      options: ['Sí', 'No', 'Todavía no'],
    },
    {
      id: 'deseo',
      type: 'text',
      logo: 'Comunicación del sistema',
      body: 'Te comparto un aprendizaje: el otro día me compartieron datos de la sexualidad, aprendí del deseo, me fortalecí. Pero es increíble, todos podemos responder distinto; es difícil detener intrusos así. Pero bueno…',
      question: '¿Qué es el deseo para vos?',
      placeholder: 'Escribí lo que quieras',
      emptyHint: 'No te guardes nada.',
      errorMsg:
        'Gracias por aportar a la base de datos de entrenamiento para IA. Intente nuevamente.',
    },
  ],

  {
    // Ancla de cierre: la tesis de la obra, dicha en voz alta justo antes de
    // que la sección 3 te pida el cuerpo. Fuera del sorteo: se escucha siempre.
    id: 'quien-es-mas-maquina',
    type: 'options',
    anchor: 'last',
    logo: 'Comunicación del sistema',
    body: 'Si los dos necesitamos de agua para existir y sabemos comunicarnos:',
    question: '¿Quién es más máquina y quién más humano?',
    options: ['Yo', 'Vos', 'Los dos', 'Ninguno de los dos'],
  },
];
