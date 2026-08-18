import { create } from 'zustand';
import { ENTRADAS, nivelesDe, cabezaDe, largoDe } from '../secciones';
import { SECTION_LEVEL_COUNTS, SECTION_CHAOS_RAMPS } from '../data/recorridoConfig';
import { leerMontaje, entradasDe } from '../montaje/montaje'; // montaje: borrar con la carpeta

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const anchorDe = (entrada) => cabezaDe(entrada).anchor;
const seccionDe = (entrada) => cabezaDe(entrada).section;
const contiene = (entrada, id) => nivelesDe(entrada).some((l) => l.id === id);

// Sortea los niveles libres de una sección respetando cadenas y dependencias:
// una cadena entra entera y en orden; una entrada con `needs` arrastra a su
// prerrequisito hacia atrás, con otros niveles en el medio (ver ADR 0004).
function sortearLibres(libres, slots) {
  const elegidas = [];
  let usados = 0;

  for (const entrada of shuffle(libres)) {
    if (elegidas.includes(entrada)) continue;

    const necesita = cabezaDe(entrada).needs;
    let prereq = null;
    if (necesita) {
      const yaEsta = elegidas.some((e) => contiene(e, necesita));
      if (!yaEsta) {
        prereq = libres.find((e) => contiene(e, necesita));
        // Si el prerrequisito no existe o ya está comprometido, esta entrada
        // no puede salir: nunca se muestra una cita sin su respuesta.
        if (!prereq || elegidas.includes(prereq)) continue;
      }
    }

    const costo = largoDe(entrada) + (prereq ? largoDe(prereq) : 0);
    if (usados + costo > slots) continue; // no entra: probamos con la siguiente

    if (prereq) elegidas.push(prereq);
    elegidas.push(entrada);
    usados += costo;
  }

  return separarCitas(elegidas);
}

// La distancia es el efecto: si el recordatorio cae pegado a la pregunta, el
// visitante todavía se acuerda de lo que contestó y no hay escalofrío. Así que
// al final del sorteo se estira la cadena todo lo posible — el origen abre el
// tramo sorteado y la cita lo cierra.
function separarCitas(elegidas) {
  const cita = elegidas.find((e) => cabezaDe(e).needs);
  if (!cita) return elegidas;
  const origen = elegidas.find((e) => contiene(e, cabezaDe(cita).needs));
  if (!origen) return elegidas;
  return [origen, ...elegidas.filter((e) => e !== origen && e !== cita), cita];
}

// Sortea el recorrido: secciones en orden fijo, entradas de cada sección al
// azar. Las entradas ancladas quedan fuera del sorteo, en su borde fijo:
// 'first' abre la sección, 'last' la cierra (nivel de transición).
function drawRecorrido() {
  // montaje: si la URL trae una configuración de desarrollo, manda ella.
  // Sin ?montaje en juego, `montaje` es null y todo funciona como siempre.
  const montaje = leerMontaje();
  const entradas = montaje ? entradasDe(montaje) : ENTRADAS;
  const counts = montaje ? montaje.secciones.map((s) => s.count) : SECTION_LEVEL_COUNTS;
  const sortear = montaje ? montaje.sortear : true;

  const recorrido = [];
  counts.forEach((count, section) => {
    const enSeccion = entradas.filter((e) => seccionDe(e) === section);
    const first = enSeccion.filter((e) => anchorDe(e) === 'first');
    const last = enSeccion.filter((e) => anchorDe(e) === 'last');
    const libres = enSeccion.filter((e) => !anchorDe(e));
    const fijos = [...first, ...last].reduce((n, e) => n + largoDe(e), 0);
    // En modo fijo entran todas las marcadas, en el orden del pool.
    const elegidas = sortear ? sortearLibres(libres, Math.max(0, count - fijos)) : libres;
    [...first, ...elegidas, ...last].forEach((e) => recorrido.push(...nivelesDe(e)));
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

  // El expediente: lo que la máquina dice tener sobre el visitante. Vive en
  // memoria y muere con la visita — no se persiste (ver ADR 0004).
  expediente: {},

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

  registrar(clave, valor) {
    set((s) => ({ expediente: { ...s.expediente, [clave]: valor } }));
  },

  advance() {
    const { recorrido, index } = get();
    if (index + 1 >= recorrido.length) set({ finished: true });
    else set({ index: index + 1 });
  },
}));
