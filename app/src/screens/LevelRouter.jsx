import { useCallback, useRef, useState } from 'react';
import { useRecorridoStore } from '../store/useRecorridoStore';
import { ERROR_DISPLAY_MS, ERROR_EN_VERIFICACION } from '../data/recorridoConfig';
import { verificationFor } from '../data/verificaciones';
import ProcessingOverlay from '../components/ProcessingOverlay';
import CheckboxLevel from '../tipos-de-nivel/CheckboxLevel';
import ImageLevel from '../tipos-de-nivel/ImageLevel';
import DistortedLevel from '../tipos-de-nivel/DistortedLevel';
import OptionsLevel from '../tipos-de-nivel/OptionsLevel';
import TextLevel from '../tipos-de-nivel/TextLevel';
import StatementLevel from '../tipos-de-nivel/StatementLevel';
import PuzzleLevel from '../tipos-de-nivel/PuzzleLevel';
import PrioridadesLevel from '../tipos-de-nivel/PrioridadesLevel';
import TosLevel from '../tipos-de-nivel/TosLevel';
import CameraLevel from '../tipos-de-nivel/CameraLevel';
import VoiceLevel from '../tipos-de-nivel/VoiceLevel';
import MotionLevel from '../tipos-de-nivel/MotionLevel';
import SketchLevel from '../tipos-de-nivel/SketchLevel';
import DrawingLevel from '../tipos-de-nivel/DrawingLevel';

const LEVEL_COMPONENTS = {
  checkbox: CheckboxLevel,
  image: ImageLevel,
  distorted: DistortedLevel,
  options: OptionsLevel,
  text: TextLevel,
  statement: StatementLevel,
  puzzle: PuzzleLevel,
  prioridades: PrioridadesLevel,
  tos: TosLevel,
  camera: CameraLevel,
  voice: VoiceLevel,
  motion: MotionLevel,
  sketch: SketchLevel,
  drawing: DrawingLevel,
};

export default function LevelRouter() {
  const recorrido = useRecorridoStore((s) => s.recorrido);
  const index = useRecorridoStore((s) => s.index);
  const advance = useRecorridoStore((s) => s.advance);

  const [processing, setProcessing] = useState(null); // mensaje del overlay
  const [flowError, setFlowError] = useState(null); // error no verificable
  // El mismo error, pero declarado dentro del overlay (ERROR_EN_VERIFICACION).
  // Va aparte de `processing` para no recrear la variante: si cambiara, las
  // métricas y los pasos volverían a arrancar de cero.
  const [verifError, setVerifError] = useState(null);
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

      // Teatro de verificación: NO aleatorio. Si el nivel trae su respuesta y
      // tiene una cita, la verificación la retoma; si no, la variante que toca
      // según la posición del nivel dentro de su sección (en orden con el pool).
      const posInSection = state.recorrido
        .slice(0, state.index + 1)
        .filter((l) => l.section === current.section).length - 1;
      const verification = verificationFor(current.section, posInSection, current, opts?.respuesta);
      setProcessing(verification);
      const processingMs = verification.durationMs;

      setTimeout(() => {
        // En las secciones que lo piden, el error se declara en el mismo panel
        // de la verificación y de ahí se avanza: no se vuelve al nivel.
        if (errorMsg && ERROR_EN_VERIFICACION.includes(current.section)) {
          setVerifError(errorMsg);
          setTimeout(() => {
            setProcessing(null);
            setVerifError(null);
            busyRef.current = false;
            advance();
          }, ERROR_DISPLAY_MS);
          return;
        }
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
      {processing && <ProcessingOverlay variant={processing} error={verifError} />}
    </>
  );
}
