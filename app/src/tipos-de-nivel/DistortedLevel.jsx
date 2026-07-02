import { useState } from 'react';

export default function DistortedLevel({ level, stepLabel, onDone }) {
  const [value, setValue] = useState('');
  const [hint, setHint] = useState(null);

  return (
    <>
      <div className="card-header">
        <div className="card-logo">Verificación de texto · {stepLabel}</div>
        <div className="card-title">Escribí el texto que aparece en la imagen</div>
        <div className="card-subtitle">Las letras pueden estar distorsionadas</div>
      </div>
      <div className="distorted-img-container">
        <img src={level.img} alt="texto distorsionado" />
      </div>
      <input
        type="text"
        className="text-input"
        placeholder={level.placeholder}
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {hint && <div className="error-banner">{hint}</div>}
      <button
        className="btn btn-primary"
        onClick={() =>
          value.trim() ? onDone() : setHint('Escribí el texto antes de continuar.')
        }
      >
        Verificar
      </button>
    </>
  );
}
