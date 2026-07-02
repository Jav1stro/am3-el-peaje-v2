import { useEffect, useState } from 'react';

const GLITCH_CHARS = '#$%&@/\\01?!▓░';

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
    const stepMs = 100;
    const totalSteps = (variant.durationMs * 0.85) / stepMs;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setValues(variant.bars.map((b) => Math.min(Math.round((step / totalSteps) * b.target), b.target)));
      if (step >= totalSteps) clearInterval(interval);
    }, stepMs);
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

export default function ProcessingOverlay({ variant }) {
  const isGlitch = variant.style === 'glitch';
  // El overlay adopta el diseño de la sección (limpio / violeta / terminal).
  const classes = [`proc-s${variant.section ?? 0}`, isGlitch ? 'glitched' : ''].join(' ').trim();

  return (
    <div id="processing-overlay" className={classes}>
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
      <div className="processing-code">{variant.code}</div>
    </div>
  );
}
