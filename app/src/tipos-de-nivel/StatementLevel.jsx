import { useRecorridoStore } from '../store/useRecorridoStore';
import { citar } from '../lib/expediente';

// Nivel declarativo: la máquina afirma algo y el visitante sólo puede seguir.
// No hay pregunta, no hay campo, no hay elección — es el único tipo de nivel
// donde el sistema habla sin pedir nada, y por eso se usa cuando lo que dice
// es algo que ya le sacó (ver CONTEXT.md → Expediente).
export default function StatementLevel({ level, stepLabel, onDone }) {
  const expediente = useRecorridoStore((s) => s.expediente);
  const {
    logo = 'Comunicación del sistema',
    text,
    body,
    cta = 'Continuar',
    fallback,
  } = level;

  return (
    <>
      <div className="card-header">
        <div className="card-logo">
          {logo} · {stepLabel}
        </div>
        <div className="card-title">{citar(text, expediente, fallback)}</div>
      </div>
      {body && <div className="grid-instruction">{citar(body, expediente, fallback)}</div>}
      <button className="btn btn-primary" onClick={() => onDone()}>
        {cta}
      </button>
    </>
  );
}
