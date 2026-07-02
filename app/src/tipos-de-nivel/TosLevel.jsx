import { useState, useRef, useEffect } from 'react';
import { TOS_BASE, TOS_ADDENDUM_1, TOS_ADDENDUM_2, TOS_CLOSING } from '../data/tosText';

// Portado de El Peaje v1: el documento crece con una adenda cada vez que el
// visitante llega al final del scroll. Solo el tercer fondo habilita el botón.
const PHASE_HEIGHTS = ['260px', '360px', '440px'];

const TEASERS = [
  'ADENDA I — DISPOSICIONES COMPLEMENTARIAS AL TRATAMIENTO DE DATOS CONDUCTUALES...',
  'ADENDA II — CLÁUSULAS ESPECIALES PARA USUARIOS QUE HAN LLEGADO HASTA AQUÍ...',
];

export default function TosLevel({ stepLabel, onDone }) {
  const [phase, setPhase] = useState(0);
  const [canAccept, setCanAccept] = useState(false);
  const scrollRef = useRef(null);
  const addendumRef = useRef(null);

  useEffect(() => {
    if (phase === 0) return;
    const t = setTimeout(() => {
      addendumRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
    return () => clearTimeout(t);
  }, [phase]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 12;
    if (!atBottom) return;
    if (phase === 0) setPhase(1);
    else if (phase === 1) setPhase(2);
    else if (phase === 2) setCanAccept(true);
  }

  const containerHeight = PHASE_HEIGHTS[Math.min(phase, PHASE_HEIGHTS.length - 1)];

  return (
    <>
      <div className="card-header">
        <div className="card-logo">Términos y condiciones · {stepLabel}</div>
        <div className="card-title">Debés leer y aceptar la totalidad del documento</div>
        {phase > 0 && (
          <div className="card-subtitle tos-addendum-notice">
            {phase === 1 ? 'Se ha agregado: Adenda I' : 'Se ha agregado: Adenda II'}
          </div>
        )}
      </div>

      <div className="tos-scroll-wrap">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="tos-scroll"
          style={{ height: containerHeight }}
        >
          <div className="tos-text">{TOS_BASE}</div>
          {phase >= 1 && (
            <div ref={phase === 1 ? addendumRef : null} className="tos-text tos-addendum">
              {TOS_ADDENDUM_1}
            </div>
          )}
          {phase >= 2 && (
            <div ref={phase === 2 ? addendumRef : null} className="tos-text tos-addendum tos-addendum-2">
              {TOS_ADDENDUM_2}
              <p className="tos-closing">{TOS_CLOSING}</p>
            </div>
          )}
        </div>

        {phase < 2 && (
          <div className="tos-teaser" aria-hidden="true">
            {TEASERS[phase]}
          </div>
        )}
      </div>

      <button className="btn btn-primary" disabled={!canAccept} onClick={onDone}>
        Acepto y continúo
      </button>
    </>
  );
}
