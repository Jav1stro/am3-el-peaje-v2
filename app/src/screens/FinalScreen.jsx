import { useEffect, useRef, useState } from 'react';
import { useRecorridoStore } from '../store/useRecorridoStore';
import { sendDrawingToPrint } from '../lib/printRelay';

export default function FinalScreen() {
  const drawing = useRecorridoStore((s) => s.drawing);
  const [status, setStatus] = useState('Emitiendo documento físico...');
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;
    if (!drawing) {
      setStatus('Sin registro gráfico para emitir.');
      return;
    }
    sendDrawingToPrint(drawing).then((result) => {
      setStatus(
        result.ok
          ? 'Documento emitido. Retírelo de la impresora.'
          : ''
      );
    });
  }, [drawing]);

  return (
    <div className="card">
      <div className="final-screen">
        <div className="final-check">✓</div>
        <div className="final-title">Verificación completada</div>
        <div className="final-status">{status}</div>
      </div>
    </div>
  );
}
