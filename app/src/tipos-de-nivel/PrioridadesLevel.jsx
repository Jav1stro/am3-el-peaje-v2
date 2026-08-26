import { useEffect, useRef, useState } from 'react';

// Nivel nativo con drag-and-drop real (pointer events → sirve en touch y mouse).
// Concepto intacto: arrastrás tus derechos a casillas de "prescindibilidad";
// al enviar, el sistema convierte tus renuncias en términos de extracción.
//
// Todos los textos los pone el nivel (ver CONTEXT.md → Tipo de nivel). Los de
// acá abajo son sólo el valor por defecto: los que manda son los del archivo de
// la sección, para que se editen sin abrir este componente.
const DERECHOS = ['Tiempo libre', 'Privacidad de datos', 'Salud mental', 'Acceso al agua'];
const CASILLAS = ['1º Prescindible', '2º Prescindible', '3º Prescindible', '4º Prescindible'];
const TERMINOS = ['DATA_MINING', 'AD_REVENUE_MAX', 'COOKIE_ID_TRUE', 'ATTENTION_EXTRACTED'];

export default function PrioridadesLevel({ level, stepLabel, onDone }) {
  const {
    logo = 'Validación de valor extraccional',
    title = 'Arrastrá tus derechos fundamentales',
    subtitle = 'Depositá tus derechos en las casillas de prescindibilidad para obtener el código de acceso.',
    zona = 'ZONA DE DEPÓSITO',
    // Se revela recién cuando el visitante empieza a arrastrar: primero
    // deposita, después se entera de que estaba renunciando.
    zonaOculta = 'Y RENUNCIA VOLUNTARIA',
    derechos = DERECHOS,
    casillas = CASILLAS,
    terminos = TERMINOS,
    casillaVacia = '(vacío. Arrastrá un derecho aquí)',
    poolVacio = 'Todos los derechos fueron depositados.',
    cta = 'Enviar orden de prioridad',
    ctaProcesando = 'Procesando renuncia…',
  } = level ?? {};

  // Un derecho se identifica por su posición en la lista: así el texto de cada
  // uno se edita sin tocar ningún id.
  const labelOf = (i) => derechos[i] ?? '';

  const [slots, setSlots] = useState(() => casillas.map(() => null));
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
  const pool = derechos
    .map((label, i) => ({ i, label }))
    .filter((r) => !placed.includes(r.i) && drag?.rightId !== r.i);
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
    if (glitching) return terminos[(i + tick) % terminos.length];
    return slots[i] !== null ? labelOf(slots[i]).toUpperCase() : null;
  };

  return (
    <>
      <div className="card-header">
        <div className="card-logo">
          {logo} · {stepLabel}
        </div>
        <div className="card-title">{title}</div>
        <div className="card-subtitle">{subtitle}</div>
      </div>

      <div className="grid-instruction">
        [ {zona}
        <span className={`prio-hidden${interacting ? ' revealed' : ''}`}> {zonaOculta}</span> ]
      </div>

      <div className="prio-slots">
        {casillas.map((label, i) => {
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
                <span className="prio-slot-empty">{casillaVacia}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="prio-pool">
        {pool.map((r) => (
          <div
            key={r.i}
            className="prio-chip"
            onPointerDown={(e) => startDrag(e, r.i)}
          >
            <span className="prio-grip">⣿</span>
            {r.label}
          </div>
        ))}
        {pool.length === 0 && !drag && !glitching && (
          <div className="prio-pool-empty">{poolVacio}</div>
        )}
      </div>

      <button className="btn btn-primary" disabled={!anyFilled || glitching} onClick={submit}>
        {glitching ? ctaProcesando : cta}
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
