import { useEffect, useRef, useState } from 'react';
import { useRecorridoStore } from '../store/useRecorridoStore';
import { sendDrawingToPrint } from '../lib/printClient';

export default function FinalScreen() {
  const drawing = useRecorridoStore((s) => s.drawing);
  // El final no promete un ticket antes de tenerlo: arranca en silencio y sólo
  // habla si la estación confirmó la emisión. Si no hay estación —sin señal,
  // apagada, sin configurar— el visitante nunca se entera de que había un
  // papel, en vez de esperarlo frente a una impresora vacía (ver ADR 0005).
  const [status, setStatus] = useState('');
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;
    if (!drawing) return;
    sendDrawingToPrint(drawing).then((result) => {
      if (result.ok) setStatus('Documento emitido. Retírelo de la impresora.');
    });
  }, [drawing]);

  return (
    <div className="card">
      <div className="final-screen">
        <div className="final-check">✓</div>
        <div className="final-title">Verificación completada. Accediste a la fuente de agua.</div>
        <div className="final-status">{status}</div>
      </div>
    </div>
  );
}
