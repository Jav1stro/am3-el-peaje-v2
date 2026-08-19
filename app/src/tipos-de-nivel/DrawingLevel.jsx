import { useEffect, useRef, useState } from 'react';
import { useRecorridoStore } from '../store/useRecorridoStore';

export default function DrawingLevel({ level, stepLabel, onDone }) {
  const {
    logo = 'Registro final',
    title = 'Dibuje su identidad',
    subtitle = 'El sistema emitirá su documento físico a partir de este registro',
  } = level ?? {};
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [hint, setHint] = useState(null);
  const setDrawing = useRecorridoStore((s) => s.setDrawing);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#202124';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
    setHasStrokes(true);
  };

  const move = (e) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    drawingRef.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    setHasStrokes(false);
  };

  const submit = () => {
    if (!hasStrokes) return setHint('El registro gráfico no puede estar vacío.');
    setDrawing(canvasRef.current.toDataURL('image/png'));
    onDone();
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
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      />
      {hint && <div className="error-banner">{hint}</div>}
      <button className="btn btn-primary" onClick={submit}>
        Emitir documento
      </button>
      <button className="btn btn-secondary" onClick={clear}>
        Borrar
      </button>
    </>
  );
}
