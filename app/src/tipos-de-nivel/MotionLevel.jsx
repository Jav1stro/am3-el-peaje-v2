import { useCallback, useEffect, useRef, useState } from 'react';

// Verificación de movimiento: el sistema pide inclinar el teléfono.
//
// Lo que hay que inclinar es el vaso de agua — el mismo que la obra promete y
// no da. Acá por fin te lo entrega, y lo primero que te pide es que lo vuelques.
// El sensor es real; la "calibración" que el sistema dice hacer con eso, no.
const UMBRAL = 40; // grados de inclinación a partir de los cuales se derrama
const DERRAME_MS = 1600; // cuánto hay que sostener la inclinación

export default function MotionLevel({ level, stepLabel, onDone }) {
  const {
    logo = 'Verificación de movimiento',
    title = 'Calibración del acelerómetro',
    subtitle = 'El sistema necesita registrar el movimiento de su dispositivo',
    instruction = 'Incliná el teléfono hasta vaciar el vaso.',
  } = level ?? {};

  const [phase, setPhase] = useState('idle'); // idle | ready | done
  const [angulo, setAngulo] = useState(0);
  const [derramado, setDerramado] = useState(0); // 0..1
  const [modo, setModo] = useState('sensor'); // sensor | arrastre
  const anguloRef = useRef(0);
  const dragRef = useRef(null);
  const derramadoRef = useRef(0);

  // Un solo bucle acumula el derrame mientras el vaso esté inclinado, sin
  // importar si el ángulo viene del giroscopio o del dedo. El total vive en un
  // ref y los setState quedan afuera del cálculo: si el avance se decidiera
  // adentro del updater de `setDerramado`, ese código correría en fase de
  // render y React descartaría el cambio de fase.
  useEffect(() => {
    if (phase !== 'ready') return;
    let ultimo = performance.now();
    let raf;
    const tick = (ahora) => {
      const dt = ahora - ultimo;
      ultimo = ahora;
      if (Math.abs(anguloRef.current) > UMBRAL) {
        derramadoRef.current = Math.min(derramadoRef.current + dt / DERRAME_MS, 1);
        setDerramado(derramadoRef.current);
        if (derramadoRef.current >= 1) {
          setPhase('done');
          return; // vaso vacío: se corta el bucle
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const escucharSensor = useCallback(() => {
    let llego = false;
    const onOrient = (e) => {
      if (e.gamma == null) return;
      llego = true;
      const g = Math.max(-90, Math.min(90, e.gamma));
      anguloRef.current = g;
      setAngulo(g);
    };
    window.addEventListener('deviceorientation', onOrient);
    // Si el sensor no existe (escritorio, permiso mudo), el nivel no puede
    // bloquear: se cae al arrastre con el dedo o el mouse.
    const t = setTimeout(() => {
      if (!llego) setModo('arrastre');
    }, 1500);
    return () => {
      window.removeEventListener('deviceorientation', onOrient);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'ready' || modo !== 'sensor') return;
    return escucharSensor();
  }, [phase, modo, escucharSensor]);

  const empezar = async () => {
    // iOS 13+ exige pedir el permiso desde un gesto del usuario.
    const pedir = window.DeviceOrientationEvent?.requestPermission;
    if (typeof pedir === 'function') {
      try {
        const res = await window.DeviceOrientationEvent.requestPermission();
        if (res !== 'granted') setModo('arrastre');
      } catch {
        setModo('arrastre');
      }
    }
    setPhase('ready');
  };

  const onPointerDown = (e) => {
    if (modo !== 'arrastre' || phase !== 'ready') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, base: anguloRef.current };
  };

  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const g = Math.max(-90, Math.min(90, dragRef.current.base + (e.clientX - dragRef.current.x) * 0.6));
    anguloRef.current = g;
    setAngulo(g);
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const agua = Math.round((1 - derramado) * 100);

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
        {modo === 'arrastre' && phase === 'ready'
          ? 'Sensor no disponible. Arrastrá el vaso para inclinarlo.'
          : instruction}
      </div>
      <div
        className="motion-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="motion-glass" style={{ transform: `rotate(${angulo}deg)` }}>
          <div className="motion-water" style={{ height: `${agua}%` }} />
        </div>
        <div className="camera-status">
          {phase === 'done'
            ? 'Movimiento registrado'
            : `Inclinación ${Math.round(angulo)}° · Contenido ${agua}%`}
        </div>
      </div>
      <button
        className="btn btn-primary"
        disabled={phase === 'ready'}
        onClick={() => (phase === 'idle' ? empezar() : onDone())}
      >
        {phase === 'done' ? 'Confirmar' : 'Iniciar verificación'}
      </button>
    </>
  );
}
