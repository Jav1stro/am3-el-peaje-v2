import { useEffect } from 'react';
import { useRecorridoStore } from './store/useRecorridoStore';
import Hud from './components/Hud';
import NoiseCanvas from './components/NoiseCanvas';
import MachineLayer from './components/MachineLayer';
import LevelRouter from './screens/LevelRouter';
import FinalScreen from './screens/FinalScreen';

export default function App() {
  const finished = useRecorridoStore((s) => s.finished);
  const chaos = useRecorridoStore((s) => s.chaos());

  // La clase de caos vive en <html> para que los selectores `.chaos-N body`
  // y `.chaos-N body::after` del CSS funcionen.
  useEffect(() => {
    document.documentElement.className = chaos > 0 ? `chaos-${chaos}` : '';
  }, [chaos]);

  return (
    <>
      <MachineLayer chaos={chaos} />
      <NoiseCanvas chaos={chaos} />
      <Hud />
      {finished ? <FinalScreen /> : <LevelRouter />}
    </>
  );
}
