import { useEffect, useRef, useState } from 'react';

const METRICS = [
  { label: 'Identidad verificable', target: 73 },
  { label: 'Presencia corporal', target: 91 },
  { label: 'Índice de humanidad', target: 58 },
];

const DENIED_ERROR = 'ERR-BIO-0x00 · Sujeto no colaborativo. Registrado. Continúe.';

export default function CameraLevel({ stepLabel, onDone }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('Iniciando cámara...');
  const [phase, setPhase] = useState('starting'); // starting | ready | analyzing | done
  const [values, setValues] = useState([0, 0, 0]);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus('Cámara activa · Encuadre su rostro');
        setPhase('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('Acceso denegado');
        // Negar el permiso no bloquea: error cínico y el trámite sigue.
        setTimeout(() => onDone({ errorOverride: DENIED_ERROR }), 1500);
      });
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [onDone]);

  const analyze = () => {
    setPhase('analyzing');
    setStatus('Analizando...');
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      setValues(METRICS.map((m) => Math.min(Math.round((elapsed / 3000) * m.target), m.target)));
      if (elapsed >= 3000) {
        clearInterval(interval);
        setStatus('Análisis completado');
        setPhase('done');
      }
    }, 100);
  };

  const submit = () => {
    if (phase === 'ready') analyze();
    else if (phase === 'done') {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      onDone();
    }
  };

  return (
    <>
      <div className="card-header">
        <div className="card-logo">Verificación biométrica · {stepLabel}</div>
        <div className="card-title">Verificación facial</div>
        <div className="card-subtitle">El sistema analizará su identidad visual</div>
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
          {METRICS.map((m, i) => (
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
      <button
        className="btn btn-primary"
        disabled={phase === 'starting' || phase === 'analyzing'}
        onClick={submit}
      >
        {phase === 'done' ? 'Confirmar' : 'Iniciar verificación'}
      </button>
    </>
  );
}
