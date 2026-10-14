import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const GLITCH_CHARS = '#$%&@/\\01?!▓░';

// Cómo nombra la máquina lo que le diste, según cuánto disimula.
const CITA_LABEL = ['Dato ingresado', 'Respuesta registrada', 'MUESTRA'];

function scramble(text, intensity = 0.18) {
  return text
    .split('')
    .map((ch) =>
      ch !== ' ' && Math.random() < intensity
        ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        : ch
    )
    .join('');
}

function BarBody({ variant }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!variant.broken) {
      // arranca en 0 y se anima hasta casi completar durante la verificación
      const t = setTimeout(() => setWidth(92), 60);
      return () => clearTimeout(t);
    }
    // barra rota: avanza a saltos y se resetea sola
    const interval = setInterval(() => {
      setWidth((w) => (w > 85 || Math.random() < 0.15 ? Math.random() * 30 : w + Math.random() * 22));
    }, 260);
    return () => clearInterval(interval);
  }, [variant.broken]);

  return (
    <div className="processing-bar-bg">
      <div
        className="processing-bar"
        style={{
          width: `${width}%`,
          transition: variant.broken ? 'width 0.2s linear' : `width ${variant.durationMs}ms ease-out`,
        }}
      />
    </div>
  );
}

function MetricsBody({ variant }) {
  const [values, setValues] = useState(() => variant.bars.map(() => 0));

  useEffect(() => {
    // Con reloj y no contando ticks: el navegador estrangula los intervalos y
    // las barras quedaban a medio camino cuando la verificación ya terminaba
    // (ver CameraLevel).
    const total = variant.durationMs * 0.85;
    const inicio = performance.now();
    const interval = setInterval(() => {
      const t = Math.min((performance.now() - inicio) / total, 1);
      setValues(variant.bars.map((b) => Math.round(t * b.target)));
      if (t >= 1) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [variant]);

  return (
    <div className="processing-metrics">
      {variant.bars.map((b, i) => (
        <div className="metric-row" key={b.label}>
          <span className="metric-label">{b.label}</span>
          <div className="metric-bar-bg">
            <div className="metric-bar" style={{ width: `${values[i]}%` }} />
          </div>
          <span>{values[i]}%</span>
        </div>
      ))}
    </div>
  );
}

function StepsBody({ variant }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    const stepMs = variant.durationMs / (variant.steps.length + 0.5);
    const interval = setInterval(() => {
      setDone((d) => Math.min(d + 1, variant.steps.length));
    }, stepMs);
    return () => clearInterval(interval);
  }, [variant]);

  return (
    <div className="processing-steps">
      {variant.steps.map((s, i) => (
        <div className={`processing-step${i < done ? '' : ' pending'}`} key={s}>
          {i < done ? '✓' : '·'} {s}
        </div>
      ))}
    </div>
  );
}

function GlitchText({ text }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const interval = setInterval(() => setDisplay(scramble(text)), 90);
    return () => clearInterval(interval);
  }, [text]);

  return <div className="processing-glitch">{display}</div>;
}

export default function ProcessingOverlay({ variant, error }) {
  const isGlitch = variant.style === 'glitch';
  // El overlay adopta el diseño de la sección (limpio / violeta / terminal).
  const classes = [`proc-s${variant.section ?? 0}`, isGlitch ? 'glitched' : ''].join(' ').trim();

  // En <body>, fuera de #root, por lo mismo que MachineLayer: en caos 9 el
  // temblor de #root lo achicaría y el panel dejaría de quedar centrado en la
  // pantalla.
  return createPortal(
    <div id="processing-overlay" className={classes}>
      {/* Sólo el panel es opaco: el resto del overlay es un velo leve, para
          que la máquina de fondo siga a la vista mientras se "verifica". */}
      <div
        className={`processing-panel${variant.cita ? ' con-cita' : ''}${error ? ' con-error' : ''}`}
      >
        {/* Lo que dijo el visitante va arriba, como el expediente sobre el que
            la máquina trabaja; lo que la máquina hace con eso, abajo. */}
        {variant.cita && (
          <div className="processing-cita">
            <div className="processing-cita-label">{CITA_LABEL[variant.section] ?? CITA_LABEL[0]}</div>
            <blockquote className="processing-cita-texto">{variant.cita}</blockquote>
          </div>
        )}

        {variant.style === 'spinner' && <div className="spinner" />}
        {variant.style === 'glitch' && <div className="spinner spinner-broken" />}
        {(variant.style === 'bar') && <BarBody variant={variant} />}
        {variant.style === 'metrics' && <MetricsBody variant={variant} />}
        {variant.style === 'steps' && <StepsBody variant={variant} />}

        {isGlitch ? (
          <GlitchText text={variant.text} />
        ) : (
          <div className="processing-text">{variant.text}</div>
        )}
        {variant.detalle && <div className="processing-detalle">{variant.detalle}</div>}
        <div className="processing-code">{variant.code}</div>

        {/* El veredicto: el error no verificable, declarado en el mismo panel
            cuando la sección lo pide (ERROR_EN_VERIFICACION). */}
        {error && (
          <div className="processing-error" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
