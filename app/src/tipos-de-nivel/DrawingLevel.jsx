import { useEffect, useRef, useState } from 'react';
import { useRecorridoStore } from '../store/useRecorridoStore';
import { PLANTILLAS } from '../lib/plantillas';

export default function DrawingLevel({ level, stepLabel, onDone }) {
  const {
    logo = 'Registro final',
    title = 'Dibuje su identidad',
    subtitle = '',
    cta = 'Emitir documento',
    // Sólo el dibujo que se imprime va al store. Cualquier otro nivel de
    // dibujo es un trámite más y no debe pisar el que sale por la impresora.
    guardar = true,
    // Lo que el lienzo trae dibujado de entrada (ver src/lib/plantillas.js).
    // No cuenta como trazo del visitante y sobrevive a "Borrar".
    plantilla,
  } = level ?? {};
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  // El lado del lienzo en el que se dibuja, fijado al montar. Si la pantalla
  // cambia de ancho después (rotar el teléfono, la barra del navegador), el
  // lienzo se estira por CSS pero sus píxeles siguen siendo éstos: todo se
  // mide contra este lado y no contra el ancho que tenga en pantalla.
  const ladoRef = useRef(0);
  const trazosRef = useRef(0);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [hint, setHint] = useState(null);
  const setDrawing = useRecorridoStore((s) => s.setDrawing);

  // Fondo blanco opaco (la impresora lo exige) y, encima, la plantilla.
  const lienzoInicial = (ctx, size) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    PLANTILLAS[plantilla]?.(ctx, size);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth;
    ladoRef.current = size;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    lienzoInicial(ctx, size);
    ctx.strokeStyle = '#202124';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const k = ladoRef.current / rect.width;
    return { x: (e.clientX - rect.left) * k, y: (e.clientY - rect.top) * k };
  };

  const start = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    trazosRef.current += 1;
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
    lienzoInicial(canvas.getContext('2d'), ladoRef.current);
    trazosRef.current = 0;
    setHasStrokes(false);
  };

  // Qué parte del lienzo tiene trazo, en %. Se cuenta salteando píxeles: es
  // para que la verificación tenga un número que dependa del dibujo, no una
  // medición fina.
  const tinta = () => {
    const canvas = canvasRef.current;
    const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    let total = 0;
    let marcados = 0;
    for (let i = 0; i < data.length; i += 4 * 7) {
      total += 1;
      if (data[i] < 200) marcados += 1;
    }
    return Math.max(1, Math.round((marcados / total) * 100));
  };

  const submit = () => {
    if (!hasStrokes) return setHint('El registro gráfico no puede estar vacío.');
    if (guardar) setDrawing(canvasRef.current.toDataURL('image/png'));
    onDone({ respuesta: { trazos: trazosRef.current, tinta: tinta() } });
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
        {cta}
      </button>
      <button className="btn btn-secondary" onClick={clear}>
        Borrar
      </button>
    </>
  );
}
