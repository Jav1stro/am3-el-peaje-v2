// Teatro de verificación (ver CONTEXT.md): pools EXCLUSIVOS por sección.
// NO es aleatorio: cada nivel muestra la verificación que le toca según su
// posición dentro de la sección (avanza en orden con el recorrido, como el
// pool de niveles). El estilo y la duración escalan con la sección.
//
// Cada variante:
//   style     — presentación: 'spinner' | 'bar' | 'metrics' | 'steps' | 'glitch'
//   text      — mensaje principal
//   code      — código fake que acompaña
//   duration  — ms (fijo, determinístico)
//   bars      — sólo 'metrics': [{ label, target }]
//   steps     — sólo 'steps': líneas que se van tildando
//   broken    — sólo 'bar': barra que avanza a saltos y se resetea
//   cita      — opcional: lo que dijo el visitante, tal cual (ver CITAS abajo)
//   detalle   — opcional: un dato chico debajo del texto
//
// Los textos son ejemplos: editarlos acá, sin tocar componentes.

export const VERIFICATION_POOLS = [
  // ── Sección 1: institucional, limpio, breve. Secuencia deliberada. ─────────
  [
    { style: 'spinner', text: 'Verificando respuesta...', code: 'HMN-PROC-0x01', duration: 1500 },
    { style: 'bar', text: 'Comprobando parámetros...', code: 'HMN-PROC-0x04', duration: 1800 },
    {
      style: 'steps',
      text: 'Validación en curso',
      code: 'HMN-SEQ-0x11',
      duration: 2100,
      steps: ['Validando entrada', 'Contrastando registros', 'Confirmando'],
    },
    { style: 'spinner', text: 'Procesando datos...', code: 'HMN-PROC-0x02', duration: 1600 },
    { style: 'bar', text: 'Cotejando con registros públicos...', code: 'HMN-REG-0x07', duration: 1700 },
    {
      style: 'steps',
      text: 'Control de integridad',
      code: 'HMN-INT-0x09',
      duration: 2000,
      steps: ['Verificando sesión', 'Comprobando origen', 'Emitiendo constancia'],
    },
    // Última de la sección: le toca al nivel de T&C, o sea al puente hacia la
    // sección 2. Es la espera más larga de la S1 a propósito.
    { style: 'spinner', text: 'Aguarde. No actualice la página.', code: 'HMN-PROC-0x0C', duration: 2200 },
  ],

  // ── Sección 2: invasivo, analiza el interior, esperas más largas. ─────────
  [
    {
      style: 'metrics',
      text: 'Analizando perfil emocional...',
      code: 'PSY-SCAN-0x22',
      duration: 3600,
      bars: [
        { label: 'Sinceridad declarada', target: 64 },
        { label: 'Coherencia interna', target: 41 },
        { label: 'Índice de docilidad', target: 88 },
      ],
    },
    {
      style: 'steps',
      text: 'Actualizando su expediente',
      code: 'HMN-INT-0x2F',
      duration: 4000,
      steps: ['Registrando respuestas', 'Cruzando con su historial', 'Actualizando su perfil', 'Archivando'],
    },
    { style: 'bar', text: 'Extrayendo valor conductual...', code: 'EXT-VAL-0x33', duration: 3400 },
    { style: 'spinner', text: 'Evaluando su transparencia...', code: 'PSY-TRN-0x29', duration: 3000 },
  ],

  // ── Sección 3: roto, terminal, el sistema ya no disimula. ─────────────────
  [
    { style: 'glitch', text: 'V3R1F1C4ND0 CU3RP0...', code: 'ERR-SYS-0xFF', duration: 3200 },
    { style: 'bar', text: 'CALIBRANDO SUJETO', code: 'CAL-SUJ-0x66', duration: 4000, broken: true },
    {
      style: 'metrics',
      text: 'Midiendo lo que queda...',
      code: 'RES-HMN-0x00',
      duration: 3600,
      bars: [
        { label: 'Humanidad residual', target: 12 },
        { label: 'Resistencia', target: 7 },
      ],
    },
    { style: 'glitch', text: '¿VERIFICANDO AL VERIFICADOR?', code: '0x?????', duration: 3000 },
  ],
];

// ── Citas: la verificación retoma lo que el visitante acaba de contestar ────
// Al completarse, cada tipo de nivel le pasa su respuesta al router
// (`onDone({ respuesta })`). Si el nivel tiene una entrada acá, su verificación
// ya no sale del pool: se arma con lo que dijo. Así la máquina "procesa lo que
// le dijiste" (CONTEXT.md → Teatro de verificación) y no un trámite genérico.
//
// Se busca primero por id de nivel y después por tipo. Un nivel que no esté
// en ninguna de las dos, o que llegue sin respuesta, usa el pool de su sección.
//
// Cada entrada es `(respuesta, level) => variante`. Qué trae `respuesta`
// depende del tipo de nivel:
//   options      { elegidas: [label], indices: [i] }
//   text         { texto }
//   distorted    { escrito, intentos }
//   image        { marcadas, total }
//   puzzle       { segundos, movimientos }
//   tos          { segundos, palabras }
//   prioridades  { casillas: [derecho | null] }  (en el orden de las casillas)
//   camera       { permitido }
//   voice        { permitido, pico }  (pico: 0..1, el volumen real más alto)
//   motion       { modo: 'sensor' | 'arrastre', segundos }
//   drawing      { trazos, tinta }    (tinta: % del lienzo con trazo)
//
// Nada de esto sale del teléfono: vive lo que dura la verificación.

const unaSola = (r) => r.elegidas[0];

// Un porcentaje que parece medido. Sale del texto y no del azar: la misma
// respuesta da siempre el mismo número (el teatro no es aleatorio).
function medir(texto, min, max) {
  let h = 7;
  for (const ch of texto) h = (h * 31 + ch.codePointAt(0)) % 9973;
  return min + (h % (max - min + 1));
}

// Las preguntas abiertas de la sección 2: misma verificación, cambia sólo la
// etiqueta con la que la máquina archiva lo que escribiste.
const ARCHIVO = {
  'miedo-infancia': 'miedo',
  tacto: 'tacto',
  'dolor-fisico': 'dolor',
  hambre: 'hambre',
  'evitando-pensar': 'evasión',
  'deseo-sexual': 'deseo',
  deseo: 'deseo',
};

const archivar = (etiqueta) => (r) => ({
  style: 'steps',
  cita: r.texto,
  text: 'Archivando su declaración',
  code: 'PSY-ARC-0x3A',
  duration: 4000,
  steps: ['Registrando su respuesta', `Clasificando como: ${etiqueta}`, 'Transfiriendo a terceros'],
});

export const CITAS_POR_NIVEL = {
  // ── Sección 2 ──
  prioridades: (r, level) => {
    const terminos = level.terminos ?? [];
    const casillas = level.casillas ?? [];
    const agua = r.casillas.findIndex((d) => d && /agua/i.test(d));
    return {
      style: 'steps',
      text:
        agua >= 0
          ? `"${r.casillas[agua]}" declarado ${casillas[agua]?.toLowerCase()}.`
          : 'Tasando sus renuncias...',
      code: 'EXT-REN-0x5C',
      duration: 4000,
      steps: r.casillas
        .map((d, i) => (d ? `${d} → ${terminos[i % terminos.length]}` : null))
        .filter(Boolean),
    };
  },

  emociones: (r) => ({
    style: 'metrics',
    // Espacio duro antes del punto: si el renglón corta, el · no queda solo al
    // principio del siguiente.
    cita: r.elegidas.join('\u00a0· '),
    text: 'Midiendo la intensidad declarada...',
    code: 'PSY-EMO-0x7F',
    duration: 3600,
    bars: r.elegidas.map((e) => ({ label: e, target: medir(e, 34, 92) })),
  }),

  'perfil-conductual': (r) => {
    const metodo = unaSola(r);
    const ninguno = /ninguno/i.test(metodo);
    return {
      style: 'bar',
      cita: metodo,
      text: ninguno
        ? 'Respuesta no verificable. Asignando el método más rentable...'
        : 'Asignando tarifa publicitaria...',
      code: 'EXT-CND-0x31',
      duration: 3400,
    };
  },

  ...Object.fromEntries(Object.entries(ARCHIVO).map(([id, etiqueta]) => [id, archivar(etiqueta)])),

  llanto: (r) => ({
    style: 'bar',
    cita: unaSola(r),
    text: 'Recalculando su vulnerabilidad...',
    code: 'PSY-LLN-0x14',
    duration: 3400,
  }),

  secreto: (r) => ({
    style: 'spinner',
    cita: unaSola(r),
    text:
      unaSola(r) === 'No'
        ? 'Negativa registrada como consentimiento.'
        : 'Consentimiento registrado. Secreto pendiente de cobro.',
    code: 'EXT-SEC-0x0B',
    duration: 3400,
  }),

  'mirada-ajena': (r) => {
    const textos = {
      Sí: 'Miedo confirmado.',
      No: 'Negación registrada.',
      'Puede ser': 'Duda registrada como sí.',
    };
    return {
      style: 'spinner',
      cita: unaSola(r),
      text: textos[unaSola(r)] ?? 'Respuesta registrada.',
      detalle: 'Ajustando su nivel de exposición...',
      code: 'PSY-EXP-0x42',
      duration: 3400,
    };
  },

  // Las opciones van de la más reciente a la más vaga: cuanto más lejos el
  // último vaso, menos agua le queda al visitante según la máquina.
  'agua-cuando': (r) => {
    const hidratacion = [72, 31, 18, 9][r.indices[0]] ?? 20;
    return {
      style: 'metrics',
      cita: unaSola(r),
      text: 'Calculando su sed residual...',
      code: 'H2O-RES-0x09',
      duration: 3600,
      bars: [
        { label: 'Hidratación estimada', target: hidratacion },
        { label: 'Agua para el sistema', target: 100 - hidratacion },
      ],
    };
  },

  'te-ensena-algo': (r) => ({
    style: 'spinner',
    cita: unaSola(r),
    text:
      unaSola(r) === 'Sí'
        ? 'Aprendizaje mutuo registrado. Sólo uno de los dos lo cobra.'
        : 'Aprendizaje unilateral confirmado.',
    code: 'SYS-APR-0x2E',
    duration: 3400,
  }),

  // Puente hacia la sección 3: lo último que la máquina procesa del interior
  // antes de pedir el cuerpo.
  'quien-es-mas-maquina': (r) => {
    const textos = {
      Yo: 'Admisión registrada.',
      Vos: 'Coincidimos.',
      'Los dos': 'Coincidimos. Por eso los dos tenemos sed.',
      'Ninguno de los dos': 'Respuesta no verificable.',
    };
    return {
      style: 'steps',
      cita: unaSola(r),
      text: textos[unaSola(r)] ?? 'Respuesta registrada.',
      code: 'SYS-HMN-0x00',
      duration: 4000,
      steps: ['Cerrando registro de interior', 'Habilitando sensores', 'Siguiente instancia: su cuerpo'],
    };
  },

  // ── Sección 3 ──
  'dibujo-felicidad': (r) => ({
    style: 'metrics',
    text: `FELICIDAD: ${r.trazos} TRAZO${r.trazos === 1 ? '' : 'S'}.`,
    detalle: 'INSUFICIENTE.',
    code: 'GRF-FEL-0x2A',
    duration: 3600,
    bars: [
      { label: 'Lienzo ocupado', target: r.tinta },
      { label: 'Felicidad verificable', target: 3 },
    ],
  }),
};

export const CITAS_POR_TIPO = {
  // ── Sección 1: se cita el gesto, que es lo único que la sección pide ──
  distorted: (r) => ({
    style: 'bar',
    cita: r.escrito,
    text: 'Cotejando con el registro léxico...',
    detalle: r.intentos > 1 ? `Intento ${r.intentos} de 3` : null,
    code: 'HMN-LEX-0x05',
    duration: 2000,
  }),

  image: (r, level) => ({
    style: 'steps',
    text:
      level.grid === 'caras'
        ? `${r.marcadas} de ${r.total} rostros marcados como humanos`
        : `${r.marcadas} de ${r.total} imágenes marcadas`,
    code: 'HMN-IMG-0x03',
    duration: 2100,
    steps: ['Registrando su criterio', 'Comparando con la mayoría', 'Confirmando'],
  }),

  puzzle: (r) => ({
    style: 'spinner',
    text: `Reconstrucción en ${r.segundos} s y ${r.movimientos} movimiento${r.movimientos === 1 ? '' : 's'}.`,
    detalle: 'Tiempo de reacción dentro del rango humano.',
    code: 'HMN-PZL-0x08',
    duration: 2000,
  }),

  // A 200 palabras por minuto, cuánto del documento le dio el tiempo a leer.
  // Es la última de la sección 1: conserva su "Aguarde" y la espera más larga.
  tos: (r) => {
    const necesarios = (r.palabras / 200) * 60;
    const lectura = Math.min(100, Math.round((r.segundos / necesarios) * 100));
    return {
      style: 'spinner',
      text: 'Aguarde. No actualice la página.',
      detalle: `Aceptado en ${r.segundos} s · Lectura estimada: ${lectura}%`,
      code: 'HMN-PROC-0x0C',
      duration: 2200,
    };
  },

  // ── Sección 3: el cuerpo, con lo que el sensor realmente leyó ──
  camera: (r) =>
    r.permitido
      ? {
          style: 'glitch',
          text: 'ROSTRO CAPTURADO. PROCESANDO...',
          detalle: 'COPIA ARCHIVADA EN 3 SERVIDORES.',
          code: 'BIO-CAP-0x6B',
          duration: 3400,
        }
      : {
          style: 'glitch',
          text: 'SIN ROSTRO.',
          detalle: 'COMPLETANDO CON UN PROMEDIO.',
          code: 'BIO-AVG-0x00',
          duration: 3400,
        },

  // El volumen es real; los decibeles son una escala que la máquina se inventa
  // sobre él. Que el número se mueva con lo que hizo el visitante es lo que
  // importa.
  voice: (r) =>
    r.permitido
      ? {
          style: 'bar',
          broken: true,
          text: `PICO DE VOZ: ${Math.round(30 + r.pico * 60)} dB`,
          detalle: 'CANSANCIO: CONFIRMADO.',
          code: 'VOZ-FAT-0x08',
          duration: 3600,
        }
      : {
          style: 'bar',
          broken: true,
          text: 'SIN VOZ.',
          detalle: 'SILENCIO REGISTRADO COMO CONSENTIMIENTO.',
          code: 'VOZ-NUL-0x00',
          duration: 3600,
        },

  motion: (r) => ({
    style: 'glitch',
    text: `VASO VACIADO EN ${r.segundos} S.`,
    detalle:
      r.modo === 'arrastre'
        ? 'INCLINACIÓN SIMULADA CON EL DEDO. ANOTADO.'
        : 'CONTENIDO DERRAMADO: 100%.',
    code: 'MOV-H2O-0x1C',
    duration: 3400,
  }),
};

// La verificación que le toca a un nivel. Si el nivel cita (CITAS_POR_NIVEL o
// CITAS_POR_TIPO) y trajo su respuesta, se arma con ella. Si no, la que
// corresponde a la posición `step` (0-based) dentro de la sección: recorre el
// pool en orden y vuelve a empezar si la sección tiene más niveles que
// variantes.
export function verificationFor(section, step, level, respuesta) {
  const citar = level && (CITAS_POR_NIVEL[level.id] ?? CITAS_POR_TIPO[level.type]);
  if (citar && respuesta) {
    const variant = citar(respuesta, level);
    return { ...variant, durationMs: variant.duration, section };
  }
  const pool = VERIFICATION_POOLS[section] ?? VERIFICATION_POOLS[0];
  const i = ((step % pool.length) + pool.length) % pool.length;
  const variant = pool[i];
  return { ...variant, durationMs: variant.duration, section };
}
