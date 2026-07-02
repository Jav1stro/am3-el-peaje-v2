import { useState } from 'react';

export default function ImageLevel({ level, stepLabel, onDone }) {
  const [selected, setSelected] = useState(() => new Set());
  const [hint, setHint] = useState(null);

  const toggle = (i) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <>
      <div className="card-header">
        <div className="card-logo">Verificación de imagen · {stepLabel}</div>
        <div className="card-title">Selección de imágenes</div>
      </div>
      <div className="grid-instruction">{level.instruction}</div>
      <div className="image-grid">
        {level.tiles.map((src, i) => (
          <div
            key={src}
            className={`image-tile${selected.has(i) ? ' selected' : ''}`}
            onClick={() => toggle(i)}
          >
            <img src={src} alt={`img_${i + 1}`} />
          </div>
        ))}
      </div>
      {hint && <div className="error-banner">{hint}</div>}
      <button
        className="btn btn-primary"
        onClick={() =>
          selected.size > 0 ? onDone() : setHint('Seleccioná al menos una imagen.')
        }
      >
        Verificar
      </button>
    </>
  );
}
