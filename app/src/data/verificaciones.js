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
  ],

  // ── Sección 2: invasivo, analiza el interior, esperas más largas. ─────────
  [
    {
      style: 'metrics',
      text: 'Analizando perfil emocional...',
      code: 'PSY-SCAN-0x22',
      duration: 3000,
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
      duration: 3200,
      steps: ['Registrando respuestas', 'Cruzando con su historial', 'Actualizando su perfil', 'Archivando'],
    },
    { style: 'bar', text: 'Extrayendo valor conductual...', code: 'EXT-VAL-0x33', duration: 2800 },
    { style: 'spinner', text: 'Evaluando su transparencia...', code: 'PSY-TRN-0x29', duration: 2600 },
  ],

  // ── Sección 3: roto, terminal, el sistema ya no disimula. ─────────────────
  [
    { style: 'glitch', text: 'V3R1F1C4ND0 CU3RP0...', code: 'ERR-SYS-0xFF', duration: 2600 },
    { style: 'bar', text: 'CALIBRANDO SUJETO', code: 'CAL-SUJ-0x66', duration: 3200, broken: true },
    {
      style: 'metrics',
      text: 'Midiendo lo que queda...',
      code: 'RES-HMN-0x00',
      duration: 3000,
      bars: [
        { label: 'Humanidad residual', target: 12 },
        { label: 'Resistencia', target: 7 },
      ],
    },
    { style: 'glitch', text: '¿VERIFICANDO AL VERIFICADOR?', code: '0x?????', duration: 2400 },
  ],
];

// Verificación determinística: la que corresponde a la posición `step`
// (0-based) dentro de la sección. Recorre el pool en orden y vuelve a empezar
// si la sección tiene más niveles que variantes.
export function verificationFor(section, step) {
  const pool = VERIFICATION_POOLS[section] ?? VERIFICATION_POOLS[0];
  const i = ((step % pool.length) + pool.length) % pool.length;
  const variant = pool[i];
  return { ...variant, durationMs: variant.duration, section };
}
