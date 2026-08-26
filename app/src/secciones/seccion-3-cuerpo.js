// Sección 3 — El cuerpo en juego
// Cámara, micrófono y movimiento. Ya no verifica lo que decís: verifica el
// cuerpo que lo dice. Todas las mecánicas piden un permiso real del teléfono y
// no miden nada — la lectura la inventa el sistema.
// El nivel de dibujo del vaso cierra siempre la sección (anchor: 'last').

export default [
  {
    // Misma mecánica que `camara`, otra excusa: ahora dice leer lo que sentís.
    id: 'emociones-cara',
    type: 'camera',
    logo: 'Lectura emocional',
    title: 'Detección de emociones',
    subtitle: 'El sistema inferirá su estado afectivo a partir de su rostro',
    metrics: [
      { label: 'Afecto detectado', target: 67 },
      { label: 'Coincidencia con su declaración', target: 22 },
      { label: 'Índice de humanidad', target: 49 },
    ],
    errorMsg: 'ERR-EMO-0x6B · Lo que muestra su cara no coincide con lo que declaró. Continúe.',
  },
  {
    id: 'cansancio-voz',
    type: 'voice',
    instruction: 'Suspire cerca del micrófono.',
    errorMsg: 'ERR-VOZ-0x08 · Cansancio no verificable. Registrado. Continúe.',
  },
  {
    id: 'movimiento',
    type: 'motion',
    title: 'Calibración del acelerómetro',
    instruction: 'Incliná el teléfono hasta vaciar el vaso.',
    errorMsg: 'ERR-MOV-0x1C · Movimiento registrado sin propósito asignable. Continúe.',
  },
  {
    // El único dibujo que no se imprime: `guardar: false` para que no pise el
    // del vaso, que es el que sale por la impresora.
    id: 'dibujo-felicidad',
    type: 'drawing',
    guardar: false,
    logo: 'Registro gráfico',
    title: 'Dibujá la felicidad.',
    subtitle: 'El sistema no puede procesar descripciones verbales de este concepto',
    cta: 'Enviar registro',
    errorMsg: 'ERR-GRF-0x2A · Concepto no representable. Registrado igualmente. Continúe.',
  },
  {
    // Lo último que hace el visitante es dibujar el vaso que la obra le
    // prometió y nunca le dio (ver los T&C y CONTEXT.md → El agua). Ese dibujo
    // es lo que sale por la impresora: se va con el agua en papel.
    id: 'dibujo',
    type: 'drawing',
    anchor: 'last',
    title: 'Dibujá el vaso de agua.',
  },
];
