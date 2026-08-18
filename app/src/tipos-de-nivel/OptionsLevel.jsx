import { useState } from 'react';
import { useRecorridoStore } from '../store/useRecorridoStore';

// Opción múltiple. Una opción puede ser un string o `{ label, cita }`: la cita
// es la forma en que esa respuesta se lee cuando otro nivel la retoma más
// adelante (ver CONTEXT.md → Expediente).
const etiqueta = (o) => (typeof o === 'string' ? o : o.label);
const cita = (o) => (typeof o === 'string' ? o.toLowerCase() : o.cita ?? o.label);

export default function OptionsLevel({ level, stepLabel, onDone }) {
  const {
    logo = 'Verificación conductual',
    question,
    body,
    options,
    multi,
    record,
  } = level;

  const [selected, setSelected] = useState(() => new Set());
  const [hint, setHint] = useState(null);
  const registrar = useRecorridoStore((s) => s.registrar);

  const select = (i) => {
    setSelected((prev) => {
      if (multi) {
        const next = new Set(prev);
        next.has(i) ? next.delete(i) : next.add(i);
        return next;
      }
      return new Set([i]);
    });
  };

  const enviar = () => {
    if (selected.size === 0) return setHint('Seleccioná una opción antes de continuar.');
    // El sistema se queda con la respuesta sólo si el nivel lo declara.
    if (record) {
      registrar(record, [...selected].map((i) => cita(options[i])).join(' y '));
    }
    onDone();
  };

  return (
    <>
      <div className="card-header">
        <div className="card-logo">
          {logo} · {stepLabel}
        </div>
        <div className="card-title">{question}</div>
      </div>
      {body && <div className="grid-instruction">{body}</div>}
      <div className="options-list">
        {options.map((o, i) => (
          <div
            key={etiqueta(o)}
            className={`option-item${selected.has(i) ? ' selected' : ''}`}
            onClick={() => select(i)}
          >
            <div className="option-radio" />
            {etiqueta(o)}
          </div>
        ))}
      </div>
      {hint && <div className="error-banner">{hint}</div>}
      <button className="btn btn-primary" onClick={enviar}>
        Verificar
      </button>
    </>
  );
}
