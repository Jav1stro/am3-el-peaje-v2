import { create } from 'zustand';
import { LEVELS } from '../secciones';
import { SECTION_LEVEL_COUNTS, SECTION_CHAOS_RAMPS } from '../data/recorridoConfig';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sortea el recorrido: secciones en orden fijo, niveles de cada sección al
// azar. Los niveles anclados quedan fuera del sorteo, en su borde fijo:
// 'first' abre la sección, 'last' la cierra (nivel de transición).
function drawRecorrido() {
  const recorrido = [];
  SECTION_LEVEL_COUNTS.forEach((count, section) => {
    const inSection = LEVELS.filter((l) => l.section === section);
    const first = inSection.filter((l) => l.anchor === 'first');
    const last = inSection.filter((l) => l.anchor === 'last');
    const pool = inSection.filter((l) => !l.anchor);
    const slots = Math.max(0, count - first.length - last.length);
    const free = shuffle(pool).slice(0, slots);
    recorrido.push(...first, ...free, ...last);
  });
  return recorrido;
}

// Caos del nivel según su posición: rampa dentro de la sección, salto grande
// al cambiar de sección (ver CONTEXT.md → Caos).
export function chaosFor(recorrido, index) {
  const level = recorrido[index];
  if (!level) return 9;
  const inSection = recorrido.filter((l) => l.section === level.section);
  const pos = inSection.indexOf(level);
  const [from, to] = SECTION_CHAOS_RAMPS[level.section];
  if (inSection.length <= 1) return to;
  return Math.round(from + ((to - from) * pos) / (inSection.length - 1));
}

export const useRecorridoStore = create((set, get) => ({
  recorrido: drawRecorrido(),
  index: 0,
  finished: false,
  drawing: null, // dataURL del nivel de dibujo

  currentLevel() {
    const { recorrido, index } = get();
    return recorrido[index] ?? null;
  },

  chaos() {
    const { recorrido, index, finished } = get();
    return finished ? 0 : chaosFor(recorrido, index);
  },

  progress() {
    const { recorrido, index, finished } = get();
    if (finished) return 100;
    return Math.round((index / recorrido.length) * 100);
  },

  setDrawing(dataUrl) {
    set({ drawing: dataUrl });
  },

  advance() {
    const { recorrido, index } = get();
    if (index + 1 >= recorrido.length) set({ finished: true });
    else set({ index: index + 1 });
  },
}));
