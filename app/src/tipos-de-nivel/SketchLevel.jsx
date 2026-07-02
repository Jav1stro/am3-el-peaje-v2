import { useEffect, useRef } from 'react';
import { useRecorridoStore } from '../store/useRecorridoStore';

// Contrato de sketches (ver CLAUDE.md):
//  - El sketch corre autónomo en un iframe y al completarse avisa con:
//      window.parent.postMessage({ type: 'peaje:done' }, '*');
//  - El padre le pasa su nivel de caos y su posición en el recorrido, por query
//    param (síncrono al cargar) y por postMessage { type: 'peaje:chaos', ... }.
//    El helper /sketches/lib/peaje-chaos.js los lee y el sketch se degrada solo.
export default function SketchLevel({ level, onDone }) {
  const chaos = useRecorridoStore((s) => s.chaos());
  const recorrido = useRecorridoStore((s) => s.recorrido);
  const index = useRecorridoStore((s) => s.index);
  const iframeRef = useRef(null);

  const payload = {
    chaos,
    section: level.section,
    step: index + 1, // posición 1-based en el recorrido
    total: recorrido.length,
  };

  useEffect(() => {
    const onMessage = (e) => {
      if (e.data && e.data.type === 'peaje:done') onDone();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onDone]);

  const query = `chaos=${payload.chaos}&section=${payload.section}&step=${payload.step}&total=${payload.total}`;
  const src = `${level.src}?${query}`;

  const handleLoad = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'peaje:chaos', ...payload }, '*');
  };

  return (
    <iframe
      ref={iframeRef}
      className="sketch-frame"
      src={src}
      title={level.id}
      onLoad={handleLoad}
      allow="camera; microphone; accelerometer; gyroscope"
    />
  );
}
