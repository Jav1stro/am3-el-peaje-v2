import { useState } from 'react';

export default function OptionsLevel({ level, stepLabel, onDone }) {
  const [selected, setSelected] = useState(() => new Set());
  const [hint, setHint] = useState(null);

  const select = (i) => {
    setSelected((prev) => {
      if (level.multi) {
        const next = new Set(prev);
        next.has(i) ? next.delete(i) : next.add(i);
        return next;
      }
      return new Set([i]);
    });
  };

  return (
    <>
      <div className="card-header">
        <div className="card-logo">Verificación conductual · {stepLabel}</div>
        <div className="card-title">{level.question}</div>
      </div>
      <div className="options-list">
        {level.options.map((o, i) => (
          <div
            key={o}
            className={`option-item${selected.has(i) ? ' selected' : ''}`}
            onClick={() => select(i)}
          >
            <div className="option-radio" />
            {o}
          </div>
        ))}
      </div>
      {hint && <div className="error-banner">{hint}</div>}
      <button
        className="btn btn-primary"
        onClick={() =>
          selected.size > 0 ? onDone() : setHint('Seleccioná una opción antes de continuar.')
        }
      >
        Verificar
      </button>
    </>
  );
}
