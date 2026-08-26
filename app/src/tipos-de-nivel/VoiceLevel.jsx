import { useEffect, useRef, useState } from 'react';

// Validación biométrica de resignación: el sistema pide un suspiro y dice
// medir el cansancio en la voz.
//
// El micrófono es real y el medidor responde al volumen real —lo que se ve
// moverse es la voz de quien está ahí—, pero la conclusión es inventada, igual
// que las métricas de CameraLevel. La máquina no mide cansancio: mide que
// obedeciste.
const METRICS = [
  { label: 'Fatiga vocal', target: 84 },
  { label: 'Resignación detectada', target: 96 },
  { label: 'Índice de humanidad', target: 41 },
];

const DENIED_ERROR = 'ERR-BIO-0x00 · Sujeto no colaborativo. Registrado. Continúe.';
const ESCUCHA_MS = 5000;
const BARRAS = 24;
// Si el visitante deja el diálogo de permiso sin contestar, `getUserMedia` no
// resuelve nunca y el nivel quedaría trabado. Ningún nivel bloquea (ver
// CLAUDE.md → Lo que NO hacer): pasado este tiempo el sistema declara su error
// cínico y sigue.
const ESPERA_PERMISO_MS = 20000;
// Misma pausa que la verificación facial: el análisis termina y el trámite
// sigue solo, sin botón de confirmar (ver CameraLevel).
const PAUSA_FINAL_MS = 1400;

export default function VoiceLevel({ level, stepLabel, onDone }) {
  const {
    logo = 'Verificación biométrica',
    title = 'Verificación de cansancio',
    subtitle = 'El sistema analizará la fatiga en su voz',
    instruction = 'Suspire cerca del micrófono.',
    metrics = METRICS,
  } = level ?? {};

  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const rafRef = useRef(null);
  const finRef = useRef(null);
  const [status, setStatus] = useState('Iniciando micrófono...');
  const [phase, setPhase] = useState('starting'); // starting | ready | listening | done
  const [nivel, setNivel] = useState(0); // volumen real, 0..1
  const [values, setValues] = useState(() => metrics.map(() => 0));

  useEffect(() => {
    let cancelled = false;
    const rendirse = setTimeout(() => {
      if (cancelled) return;
      setStatus('Sin respuesta');
      onDone({ errorOverride: DENIED_ERROR });
    }, ESPERA_PERMISO_MS);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        clearTimeout(rendirse);
        streamRef.current = stream;
        setStatus('Micrófono activo');
        setPhase('ready');
      })
      .catch(() => {
        if (cancelled) return;
        clearTimeout(rendirse);
        setStatus('Acceso denegado');
        // Negar el permiso no bloquea: error cínico y el trámite sigue.
        setTimeout(() => onDone({ errorOverride: DENIED_ERROR }), 1500);
      });
    return () => {
      cancelled = true;
      clearTimeout(rendirse);
      clearTimeout(finRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (ctxRef.current) ctxRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [onDone]);

  const escuchar = () => {
    setPhase('listening');
    setStatus('Escuchando...');

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    // En iOS el contexto puede nacer suspendido aun creándolo desde el gesto:
    // sin esto el analizador devuelve silencio y el medidor queda muerto sin
    // que nada falle a la vista.
    if (ctx.state === 'suspended') ctx.resume();
    ctxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(streamRef.current).connect(analyser);
    const datos = new Uint8Array(analyser.fftSize);

    const inicio = performance.now();
    const tick = () => {
      analyser.getByteTimeDomainData(datos);
      // RMS sobre la onda cruda: 128 es el silencio en un Uint8Array.
      let suma = 0;
      for (const v of datos) suma += ((v - 128) / 128) ** 2;
      setNivel(Math.min(Math.sqrt(suma / datos.length) * 4, 1));

      const t = performance.now() - inicio;
      setValues(metrics.map((m) => Math.min(Math.round((t / ESCUCHA_MS) * m.target), m.target)));

      if (t >= ESCUCHA_MS) {
        setStatus('Análisis completado');
        setPhase('done');
        setNivel(0);
        ctx.close();
        ctxRef.current = null;
        finRef.current = setTimeout(() => {
          if (streamRef.current) streamRef.current.getTracks().forEach((x) => x.stop());
          onDone();
        }, PAUSA_FINAL_MS);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <>
      <div className="card-header">
        <div className="card-logo">
          {logo} · {stepLabel}
        </div>
        <div className="card-title">{title}</div>
        <div className="card-subtitle">{subtitle}</div>
      </div>
      <div className="grid-instruction">{instruction}</div>
      <div className="voice-stage">
        <div className="voice-meter">
          {Array.from({ length: BARRAS }, (_, i) => (
            <div
              key={i}
              className={`voice-bar${nivel * BARRAS > i ? ' on' : ''}`}
              // Arco: las barras del centro son más altas que las de los bordes.
              style={{ height: `${30 + 40 * Math.sin((i / (BARRAS - 1)) * Math.PI)}%` }}
            />
          ))}
        </div>
        <div className="camera-status">{status}</div>
      </div>
      {(phase === 'listening' || phase === 'done') && (
        <div className="biometric-metrics">
          {metrics.map((m, i) => (
            <div className="metric-row" key={m.label}>
              <span className="metric-label">{m.label}</span>
              <div className="metric-bar-bg">
                <div className="metric-bar" style={{ width: `${values[i]}%` }} />
              </div>
              <span>{values[i]}%</span>
            </div>
          ))}
        </div>
      )}
      <button className="btn btn-primary" disabled={phase !== 'ready'} onClick={escuchar}>
        {phase === 'listening' ? 'Escuchando…' : phase === 'done' ? 'Verificación completa' : 'Iniciar verificación'}
      </button>
    </>
  );
}
