import { useCallback, useRef, useState } from 'react';
import { useRecorridoStore } from '../store/useRecorridoStore';
import { ERROR_DISPLAY_MS } from '../data/recorridoConfig';
import { verificationFor } from '../data/verificaciones';
import ProcessingOverlay from '../components/ProcessingOverlay';
import CheckboxLevel from '../tipos-de-nivel/CheckboxLevel';
import ImageLevel from '../tipos-de-nivel/ImageLevel';
import DistortedLevel from '../tipos-de-nivel/DistortedLevel';
import OptionsLevel from '../tipos-de-nivel/OptionsLevel';
import PuzzleLevel from '../tipos-de-nivel/PuzzleLevel';
import PrioridadesLevel from '../tipos-de-nivel/PrioridadesLevel';
import TosLevel from '../tipos-de-nivel/TosLevel';
import CameraLevel from '../tipos-de-nivel/CameraLevel';
import SketchLevel from '../tipos-de-nivel/SketchLevel';
import DrawingLevel from '../tipos-de-nivel/DrawingLevel';

const LEVEL_COMPONENTS = {
  checkbox: CheckboxLevel,
  image: ImageLevel,
  distorted: DistortedLevel,
  options: OptionsLevel,
  puzzle: PuzzleLevel,
  prioridades: PrioridadesLevel,
  tos: TosLevel,
  camera: CameraLevel,
  sketch: SketchLevel,
  drawing: DrawingLevel,
};

export default function LevelRouter() {
  const recorrido = useRecorridoStore((s) => s.recorrido);
  const index = useRecorridoStore((s) => s.index);
  const advance = useRecorridoStore((s) => s.advance);

  const [processing, setProcessing] = useState(null); // mensaje del overlay
  const [flowError, setFlowError] = useState(null); // error no verificable
  const busyRef = useRef(false);

  const level = recorrido[index];

  // Un nivel completado siempre avanza (ver CONTEXT.md → Nivel). Si el nivel
  // es "no verificable" (o la cámara fue negada), se declara el error y se
  // avanza igual.
  const handleDone = useCallback(
    (opts) => {
      if (busyRef.current) return;
      busyRef.current = true;
      const state = useRecorridoStore.getState();
      const current = state.recorrido[state.index];
      const errorMsg = opts?.errorOverride ?? current.errorMsg ?? null;

      // Teatro de verificación: NO aleatorio. La variante que toca según la
      // posición del nivel dentro de su sección (avanza en orden con el pool).
      const posInSection = state.recorrido
        .slice(0, state.index + 1)
        .filter((l) => l.section === current.section).length - 1;
      const verification = verificationFor(current.section, posInSection);
      setProcessing(verification);
      const processingMs = verification.durationMs;

      setTimeout(() => {
        setProcessing(null);
        if (errorMsg) {
          setFlowError(errorMsg);
          setTimeout(() => {
            setFlowError(null);
            busyRef.current = false;
            advance();
          }, ERROR_DISPLAY_MS);
        } else {
          busyRef.current = false;
          advance();
        }
      }, processingMs);
    },
    [advance]
  );

  if (!level) return null;
  const LevelComponent = LEVEL_COMPONENTS[level.type];
  const stepLabel = `${index + 1}/${recorrido.length}`;

  return (
    <>
      <div className="card">
        <LevelComponent key={level.id} level={level} stepLabel={stepLabel} onDone={handleDone} />
        {flowError && <div className="error-banner">{flowError}</div>}
      </div>
      {processing && <ProcessingOverlay variant={processing} />}
    </>
  );
}
