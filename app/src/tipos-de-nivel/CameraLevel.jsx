import { useEffect, useRef, useState } from 'react';

// La mecánica es una sola —pedir la cara, medir algo que no se mide— y los
// textos los pone cada nivel (ver CONTEXT.md → Tipo de nivel): el mismo
// componente sirve para la verificación facial y para la lectura de emociones.
const METRICS = [
  { label: 'Identidad verificable', target: 73 },
  { label: 'Presencia corporal', target: 91 },
  { label: 'Índice de humanidad', target: 58 },
];

const DENIED_ERROR = 'ERR-BIO-0x00 · Sujeto no colaborativo. Registrado. Continúe.';
// Si el visitante deja el diálogo de permiso sin contestar, `getUserMedia` no
// resuelve nunca y el nivel quedaría trabado. Ningún nivel bloquea (ver
// CLAUDE.md → Lo que NO hacer): pasado este tiempo el sistema declara su error
// cínico y sigue.
const ESPERA_PERMISO_MS = 20000;
// Cuánto queda en pantalla el "Análisis completado" con las métricas ya
// dibujadas antes de avanzar solo. El análisis termina y el trámite sigue: el
// sistema no le pide permiso a nadie. Antes había un botón "Confirmar" y no se
// entendía que había que apretarlo — el nivel parecía terminado y trabado.
const PAUSA_FINAL_MS = 1400;
// Cuánto tarda el "análisis" en llenar las métricas.
const ANALISIS_MS = 3000;

export default function CameraLevel({ level, stepLabel, onDone }) {
  const {
    logo = 'Verificación biométrica',
    title = 'Verificación facial',
    subtitle = 'El sistema analizará su identidad visual',
    metrics = METRICS,
  } = level ?? {};
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const analisisRef = useRef(null);
  const [status, setStatus] = useState('Iniciando cámara...');
  const [phase, setPhase] = useState('starting'); // starting | ready | analyzing | done
  const [values, setValues] = useState(() => metrics.map(() => 0));

  useEffect(() => {
    let cancelled = false;
    const rendirse = setTimeout(() => {
      if (cancelled) return;
      setStatus('Sin respuesta');
      onDone({ errorOverride: DENIED_ERROR });
    }, ESPERA_PERMISO_MS);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        clearTimeout(rendirse);
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus('Cámara activa · Encuadre su rostro');
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
      // Sirve para el intervalo del análisis y para la pausa final: los dos
      // viven en el mismo ref y ninguno debe sobrevivir al nivel.
      clearTimeout(analisisRef.current);
      clearInterval(analisisRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [onDone]);

  const analyze = () => {
    setPhase('analyzing');
    setStatus('Analizando...');
    // El tiempo se mide con reloj, no contando ticks: el navegador estrangula
    // los intervalos de las pestañas en segundo plano a uno por segundo, y
    // sumando 100 por tick el análisis de tres segundos duraba treinta si el
    // visitante se iba a otra app y volvía.
    const inicio = performance.now();
    const interval = setInterval(() => {
      const elapsed = performance.now() - inicio;
      setValues(metrics.map((m) => Math.min(Math.round((elapsed / ANALISIS_MS) * m.target), m.target)));
      if (elapsed >= ANALISIS_MS) {
        clearInterval(interval);
        setStatus('Análisis completado');
        setPhase('done');
        analisisRef.current = setTimeout(() => {
          if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
          onDone();
        }, PAUSA_FINAL_MS);
      }
    }, 100);
    analisisRef.current = interval;
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
      <div id="camera-container">
        <video id="camera-video" ref={videoRef} autoPlay playsInline muted />
        <div className="camera-overlay">
          <div className="face-guide">
            <div className="scan-line" />
          </div>
          <div className="camera-status">{status}</div>
        </div>
      </div>
      {(phase === 'analyzing' || phase === 'done') && (
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
      <button className="btn btn-primary" disabled={phase !== 'ready'} onClick={analyze}>
        {phase === 'analyzing' ? 'Analizando…' : phase === 'done' ? 'Verificación completa' : 'Iniciar verificación'}
      </button>
    </>
  );
}
