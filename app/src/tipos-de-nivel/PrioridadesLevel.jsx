import { useEffect, useRef, useState } from 'react';

// Nivel nativo con drag-and-drop real (pointer events → sirve en touch y mouse).
// Concepto intacto: arrastrás tus derechos a casillas de "prescindibilidad";
// al enviar, el sistema convierte tus renuncias en términos de extracción.
const RIGHTS = [
  { id: 'tiempo', label: 'Tiempo libre' },
  { id: 'privacidad', label: 'Privacidad de datos' },
  { id: 'salud', label: 'Salud mental' },
  { id: 'agua', label: 'Acceso al agua' },
];
const SLOT_LABELS = ['1º Prescindible', '2º Prescindible', '3º Prescindible', '4º Prescindible'];
const INJECTION = ['DATA_MINING', 'AD_REVENUE_MAX', 'COOKIE_ID_TRUE', 'ATTENTION_EXTRACTED'];

const labelOf = (id) => RIGHTS.find((r) => r.id === id)?.label ?? '';

export default function PrioridadesLevel({ stepLabel, onDone }) {
  const [slots, setSlots] = useState([null, null, null, null]);
  const [drag, setDrag] = useState(null); // { rightId, x, y, overSlot }
  const [glitching, setGlitching] = useState(false);
  const [tick, setTick] = useState(0);

  const dragRef = useRef(null);
  const slotRefs = useRef([]);
  const doneRef = useRef(false);

  const setDrg = (d) => {
    dragRef.current = d;
    setDrag(d);
  };

  const placed = slots.filter(Boolean);
  const pool = RIGHTS.filter((r) => !placed.includes(r.id) && drag?.rightId !== r.id);
  const anyFilled = placed.length > 0;
  const interacting = drag !== null || anyFilled;

  // Detecta la casilla bajo el puntero.
  const hitTest = (x, y) => {
    let over = null;
    slotRefs.current.forEach((el, i) => {
      if (!el || slots[i] !== null) return; // sólo casillas vacías reciben
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) over = i;
    });
    return over;
  };

  // Listeners globales de arrastre (una sola vez).
  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      setDrg({ ...d, x: e.clientX, y: e.clientY, overSlot: hitTest(e.clientX, e.clientY) });
    };
    const onUp = () => {
      const d = dragRef.current;
      if (!d) return;
      if (d.overSlot != null) {
        setSlots((prev) => {
          const next = [...prev];
          next[d.overSlot] = d.rightId;
          return next;
        });
      }
      setDrg(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    // slots se lee dentro de hitTest vía closure fresca en cada render del efecto
  }, [slots]);

  // Glitch de envío: las renuncias se convierten en términos de extracción.
  useEffect(() => {
    if (!glitching) return;
    const started = Date.now();
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      if (Date.now() - started > 1300 && !doneRef.current) {
        doneRef.current = true;
        clearInterval(interval);
        onDone();
      }
    }, 90);
    return () => clearInterval(interval);
  }, [glitching, onDone]);

  const startDrag = (e, rightId, fromSlot = null) => {
    if (glitching) return;
    e.preventDefault();
    if (fromSlot !== null) {
      setSlots((prev) => {
        const next = [...prev];
        next[fromSlot] = null;
        return next;
      });
    }
    setDrg({ rightId, x: e.clientX, y: e.clientY, overSlot: null });
  };

  const submit = () => {
    if (!anyFilled || glitching) return;
    setDrg(null);
    setGlitching(true);
  };

  const slotDisplay = (i) => {
    if (glitching) return INJECTION[(i + tick) % INJECTION.length];
    return slots[i] !== null ? labelOf(slots[i]).toUpperCase() : null;
  };

  return (
    <>
      <div className="card-header">
        <div className="card-logo">Validación de valor extraccional · {stepLabel}</div>
        <div className="card-title">Arrastrá tus derechos fundamentales</div>
        <div className="card-subtitle">
          Depositá tus derechos en las casillas de prescindibilidad para obtener el código de acceso.
        </div>
      </div>

      <div className="grid-instruction">
        [ ZONA DE DEPÓSITO
        <span className={`prio-hidden${interacting ? ' revealed' : ''}`}> Y RENUNCIA VOLUNTARIA</span> ]
      </div>

      <div className="prio-slots">
        {SLOT_LABELS.map((label, i) => {
          const content = slotDisplay(i);
          const filled = content !== null;
          const isOver = drag && drag.overSlot === i;
          const droppable = drag && !filled;
          return (
            <div
              key={label}
              ref={(el) => (slotRefs.current[i] = el)}
              className={`prio-slot${filled ? ' filled' : ''}${droppable ? ' droppable' : ''}${isOver ? ' over' : ''}`}
              onPointerDown={filled && !glitching ? (e) => startDrag(e, slots[i], i) : undefined}
            >
              <span className="prio-slot-label">{label}:</span>
              {filled ? (
                <span className="prio-slot-content">
                  {content} <span className="prio-lock">🔒</span>
                </span>
              ) : (
                <span className="prio-slot-empty">(vacío. Arrastrá un derecho aquí)</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="prio-pool">
        {pool.map((r) => (
          <div
            key={r.id}
            className="prio-chip"
            onPointerDown={(e) => startDrag(e, r.id)}
          >
            <span className="prio-grip">⣿</span>
            {r.label}
          </div>
        ))}
        {pool.length === 0 && !drag && !glitching && (
          <div className="prio-pool-empty">Todos los derechos fueron depositados.</div>
        )}
      </div>

      <button className="btn btn-primary" disabled={!anyFilled || glitching} onClick={submit}>
        {glitching ? 'Procesando renuncia…' : 'Enviar orden de prioridad'}
      </button>

      {drag && (
        <div className="prio-ghost" style={{ left: drag.x, top: drag.y }}>
          <span className="prio-grip">⣿</span>
          {labelOf(drag.rightId)}
        </div>
      )}
    </>
  );
}
