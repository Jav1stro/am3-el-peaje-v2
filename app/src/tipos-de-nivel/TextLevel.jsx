import { useState } from 'react';
import { useRecorridoStore } from '../store/useRecorridoStore';

// Pregunta abierta: el visitante escribe una respuesta libre.
// La mecánica no evalúa nada — sólo exige que el campo no esté vacío.
// Lo escrito no se guarda ni se manda a ningún lado: vive en el estado del
// componente y muere al avanzar (ver CLAUDE.md → Lo que NO hacer).
//
// Todos los textos vienen del nivel: la mecánica es compartida entre
// secciones (ver CONTEXT.md → Tipo de nivel), la voz la pone cada nivel.
export default function TextLevel({ level, stepLabel, onDone }) {
  const {
    logo = 'Registro declarativo',
    question,
    subtitle,
    body,
    // El campo va vacío: la máquina pregunta y no ofrece nada. Un placeholder
    // sería una pista sobre qué se espera, y acá lo que se espera es
    // exactamente lo que no hay que sugerir. Los captchas de texto
    // distorsionado sí lo usan, pero ahí es una instrucción, no una pista.
    placeholder = '',
    emptyHint = 'Completá el campo antes de continuar.',
    record,
  } = level;

  const [value, setValue] = useState('');
  const [hint, setHint] = useState(null);
  const registrar = useRecorridoStore((s) => s.registrar);

  const enviar = () => {
    if (!value.trim()) return setHint(emptyHint);
    if (record) registrar(record, value.trim());
    onDone();
  };

  return (
    <>
      <div className="card-header">
        <div className="card-logo">
          {logo} · {stepLabel}
        </div>
        {body && <div className="card-body">{body}</div>}
        <div className="card-title">{question}</div>
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
      </div>
      <input
        type="text"
        className="text-input"
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {hint && <div className="error-banner">{hint}</div>}
      <button className="btn btn-primary" onClick={enviar}>
        Verificar
      </button>
    </>
  );
}
