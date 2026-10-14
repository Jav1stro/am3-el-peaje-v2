import { useRef, useState } from 'react';

// Permutación aleatoria que no sea la identidad
function shuffledOrder(n) {
  let arr;
  do {
    arr = [...Array(n).keys()];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (arr.every((v, i) => v === i));
  return arr;
}

export default function PuzzleLevel({ level, stepLabel, onDone }) {
  const [order, setOrder] = useState(() => shuffledOrder(level.pieces.length));
  const [picked, setPicked] = useState(null);
  const [hint, setHint] = useState(null);
  const inicio = useRef(performance.now());
  const movimientos = useRef(0);
  const solved = order.every((v, i) => v === i);

  const tap = (pos) => {
    if (solved) return;
    if (picked === null) return setPicked(pos);
    if (picked === pos) return setPicked(null);
    setOrder((prev) => {
      const next = [...prev];
      [next[picked], next[pos]] = [next[pos], next[picked]];
      return next;
    });
    movimientos.current += 1;
    setPicked(null);
  };

  const terminar = () =>
    onDone({
      respuesta: {
        segundos: Math.round((performance.now() - inicio.current) / 1000),
        movimientos: movimientos.current,
      },
    });

  return (
    <>
      <div className="card-header">
        <div className="card-logo">Verificación visual · {stepLabel}</div>
        <div className="card-title">Ordená los fragmentos</div>
        <div className="card-subtitle">{level.instruction}</div>
      </div>
      <div className="puzzle-hint">Tocá una pieza y luego otra para intercambiarlas</div>
      <div className="puzzle-grid">
        {order.map((idx, pos) => (
          <div
            key={pos}
            className={`puzzle-piece${picked === pos ? ' selected-piece' : ''}${solved ? ' correct' : ''}`}
            onClick={() => tap(pos)}
          >
            <img src={level.pieces[idx]} alt={`pieza ${idx + 1}`} />
          </div>
        ))}
      </div>
      {hint && <div className="error-banner">{hint}</div>}
      <button
        className="btn btn-primary"
        onClick={() =>
          solved ? terminar() : setHint('Completá el rompecabezas antes de continuar.')
        }
      >
        Verificar
      </button>
    </>
  );
}
