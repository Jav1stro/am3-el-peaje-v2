import { useRecorridoStore } from '../store/useRecorridoStore';

export default function Hud() {
  const progress = useRecorridoStore((s) => s.progress());

  return (
    <>
      <div id="progress-bar-container">
        <div id="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div id="progress-label">{progress}%</div>
    </>
  );
}
