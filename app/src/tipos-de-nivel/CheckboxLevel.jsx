import { useState } from 'react';

export default function CheckboxLevel({ onDone }) {
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState(null);

  return (
    <>
      <div className="card-header">
        <div className="card-logo">Sistema de Verificación · v2.4.1</div>
        <div className="card-title">Confirme que no es un robot</div>
      </div>
      <div className="checkbox-container" onClick={() => setChecked((c) => !c)}>
        <div className={`checkbox-box${checked ? ' checked' : ''}`} />
        <div className="checkbox-label">No soy un robot</div>
        <div className="recaptcha-badge">
          <span>reCAPTCHA</span>Privacidad · Términos
        </div>
      </div>
      {hint && <div className="error-banner">{hint}</div>}
      <button
        className="btn btn-primary"
        onClick={() => (checked ? onDone() : setHint('Debe confirmar que no es un robot.'))}
      >
        Verificar
      </button>
    </>
  );
}
