import { create } from 'zustand';
import { ENTRADAS, nivelesDe, cabezaDe, largoDe } from '../secciones';
import {
  SECTION_LEVEL_COUNTS,
  SECTION_CHAOS_RAMPS,
  SECTION_TYPE_CAPS,
  SEPARAR_MECANICAS,
} from '../data/recorridoConfig';
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
//
// `tope` limita cuántos niveles de la misma mecánica entran en la sección. Sin
// él, un visitante podía recibir cinco pantallas de "elegir de una lista" al
// hilo: el pool de la S2 tiene doce niveles de opciones contra uno de cada
// otra cosa, así que el azar solo tiende a la monotonía.
function sortearLibres(libres, slots, tope) {
  const elegidas = [];
  const porTipo = {};
  let usados = 0;

  const registrar = (entrada) => {
    for (const l of nivelesDe(entrada)) porTipo[l.type] = (porTipo[l.type] ?? 0) + 1;
  };
  const respetaTope = (entrada, otra) => {
    if (!tope) return true;
    const cuenta = { ...porTipo };
    for (const e of [otra, entrada]) {
      if (!e) continue;
      for (const l of nivelesDe(e)) {
        cuenta[l.type] = (cuenta[l.type] ?? 0) + 1;
        if (cuenta[l.type] > tope) return false;
      }
    }
    return true;
  };

  const barajadas = shuffle(libres);

  // Dos pasadas. La primera respeta el tope; si con eso la sección no llega a
  // llenar sus lugares, la segunda lo ignora. Antes un recorrido con mecánicas
  // repetidas que uno más corto que lo configurado: el tope es una preferencia
  // de composición, no una regla que pueda recortar la obra.
  for (const conTope of [true, false]) {
    for (const entrada of barajadas) {
      if (usados >= slots) break;
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

      if (conTope && !respetaTope(entrada, prereq)) continue;

      const costo = largoDe(entrada) + (prereq ? largoDe(prereq) : 0);
      if (usados + costo > slots) continue; // no entra: probamos con la siguiente

      if (prereq) {
        elegidas.push(prereq);
        registrar(prereq);
      }
      elegidas.push(entrada);
      registrar(entrada);
      usados += costo;
    }
    if (usados >= slots || !tope) break;
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

// Reordena lo ya sorteado para que no caigan dos niveles seguidos con la misma
// mecánica. No cambia QUÉ entra —eso ya lo decidió el sorteo—, sólo el orden:
// la monotonía se siente en el momento, y tres "escribí algo" al hilo pesan más
// que el balance general de la sección.
//
// `tipoAntes` y `tipoDespues` son las mecánicas de los niveles anclados que
// rodean al tramo sorteado. Sin ellas el reordenamiento se equivoca en el
// borde: `dibujo-felicidad` terminaba pegado a `dibujo` —los dos de dibujar—
// en uno de cada cuatro recorridos.
//
// Es una preferencia, no una garantía: si entraron cuatro de opciones y una de
// texto no hay con qué intercalar, y entonces se acomoda lo mejor posible.
// Respeta lo que el sorteo ya decidió: la cadena viaja entera y en orden, y el
// origen de una cita sigue abriendo el tramo con la cita al cierre.
function separarMecanicas(elegidas, tipoAntes, tipoDespues) {
  if (elegidas.length < 2) return elegidas;

  const cita = elegidas.find((e) => cabezaDe(e).needs);
  const origen = cita && elegidas.find((e) => contiene(e, cabezaDe(cita).needs));
  const fijas = new Set([cita, origen].filter(Boolean));
  const medio = elegidas.filter((e) => !fijas.has(e));

  // En una cadena manda el último eslabón para lo que sigue y el primero para
  // lo que viene antes.
  const abre = (e) => cabezaDe(e).type;
  const cierra = (e) => nivelesDe(e)[largoDe(e) - 1].type;

  const roces = (orden) => {
    let n = 0;
    let previo = tipoAntes;
    for (const e of orden) {
      if (previo && abre(e) === previo) n += 1;
      previo = cierra(e);
    }
    if (tipoDespues && previo === tipoDespues) n += 1;
    return n;
  };

  const armar = (m) => [...(origen ? [origen] : []), ...m, ...(cita ? [cita] : [])];

  // Con seis entradas o menos alcanza con probar unas cuantas barajadas y
  // quedarse con la mejor: es más simple y más robusto que un acomodo voraz,
  // que se puede quedar sin salida por haber elegido bien al principio.
  let mejor = armar(medio);
  let mejorRoces = roces(mejor);
  for (let i = 0; i < 60 && mejorRoces > 0; i += 1) {
    const candidato = armar(shuffle(medio));
    const r = roces(candidato);
    if (r < mejorRoces) {
      mejor = candidato;
      mejorRoces = r;
    }
  }
  return mejor;
}

// Sortea el recorrido: secciones en orden fijo, entradas de cada sección al
// azar. Las entradas ancladas quedan fuera del sorteo, en su borde fijo:
// 'first' abre la sección, 'last' la cierra (nivel de transición).
// Se exporta para poder medir el sorteo sin levantar la app: es la pieza que
// decide la composición de cada visita y conviene poder correrla miles de veces.
export function drawRecorrido() {
  // montaje: si la URL trae una configuración de desarrollo, manda ella.
  // Sin ?montaje en juego, `montaje` es null y todo funciona como siempre.
  const montaje = leerMontaje();
  const entradas = montaje ? entradasDe(montaje) : ENTRADAS;
  const counts = montaje ? montaje.secciones.map((s) => s.count) : SECTION_LEVEL_COUNTS;
  const topes = montaje ? montaje.secciones.map((s) => s.tope) : SECTION_TYPE_CAPS;
  const sortear = montaje ? montaje.sortear : true;
  const separar = montaje ? montaje.separar : SEPARAR_MECANICAS;

  const recorrido = [];
  counts.forEach((count, section) => {
    const enSeccion = entradas.filter((e) => seccionDe(e) === section);
    const first = enSeccion.filter((e) => anchorDe(e) === 'first');
    const last = enSeccion.filter((e) => anchorDe(e) === 'last');
    const libres = enSeccion.filter((e) => !anchorDe(e));
    const fijos = [...first, ...last].reduce((n, e) => n + largoDe(e), 0);
    // En modo fijo entran todas las marcadas, en el orden del pool: el panel de
    // montaje manda y no se le reordena nada por debajo.
    let elegidas = libres;
    if (sortear) {
      elegidas = sortearLibres(libres, Math.max(0, count - fijos), topes[section]);
      if (separar) {
        const ultimoDe = (lista) =>
          lista.length ? nivelesDe(lista[lista.length - 1]).at(-1).type : null;
        const primeroDe = (lista) => (lista.length ? cabezaDe(lista[0]).type : null);
        elegidas = separarMecanicas(elegidas, ultimoDe(first), primeroDe(last));
      }
    }
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
