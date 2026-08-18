// ─────────────────────────────────────────────────────────────────────────────
// HERRAMIENTA DE DESARROLLO — NO ES PARTE DE LA OBRA. Se borra antes de la sala.
// Para sacarla: borrar esta carpeta y los dos enganches marcados con "montaje"
// (uno en src/main.jsx, otro en src/store/useRecorridoStore.js).
// ─────────────────────────────────────────────────────────────────────────────
//
// Permite decidir, por sección, qué niveles entran y cuáles abren y cierran.
// La decisión viaja en la URL: recargar mantiene el montaje pero el recorrido
// empieza de cero igual (CONTEXT.md → Empezar de cero sigue intacto), y el
// enlace se le puede pasar a otra persona para que vea exactamente lo mismo.

import { ENTRADAS, cabezaDe, nivelesDe } from '../secciones';
import { SECTION_LEVEL_COUNTS } from '../data/recorridoConfig';

// Una cadena se identifica por el id de su primer eslabón: es una unidad.
export const idDe = (entrada) => cabezaDe(entrada).id;
export const seccionDe = (entrada) => cabezaDe(entrada).section;
export const largoDe = (entrada) => nivelesDe(entrada).length;

export const entradasDeSeccion = (section) => ENTRADAS.filter((e) => seccionDe(e) === section);

// Etiqueta legible para el panel: el id manda, el texto del nivel ayuda a
// recordar de qué se trata.
export function textoDe(entrada) {
  const l = cabezaDe(entrada);
  const propio = l.question ?? l.instruction ?? l.text ?? l.body ?? l.word ?? '';
  const cola = nivelesDe(entrada).slice(1).map((n) => n.id);
  return {
    id: l.id,
    tipo: l.type,
    texto: propio,
    cadena: cola.length ? cola : null,
    largo: largoDe(entrada),
  };
}

export function montajePorDefecto() {
  return {
    sortear: true,
    secciones: SECTION_LEVEL_COUNTS.map((count, s) => {
      const entradas = entradasDeSeccion(s);
      const conAncla = (a) => entradas.find((e) => cabezaDe(e).anchor === a);
      return {
        count,
        ids: entradas.map(idDe),
        apertura: conAncla('first') ? idDe(conAncla('first')) : null,
        cierre: conAncla('last') ? idDe(conAncla('last')) : null,
      };
    }),
  };
}

// ── URL ──────────────────────────────────────────────────────────────────────

export function leerMontaje(search = window.location.search) {
  const p = new URLSearchParams(search);
  const hayAlgo = [0, 1, 2].some((i) => p.has(`s${i}`)) || p.has('fijo');
  if (!hayAlgo) return null;

  const base = montajePorDefecto();
  return {
    sortear: p.get('fijo') !== '1',
    secciones: base.secciones.map((def, i) => {
      const ids = p.get(`s${i}`);
      const [apertura, cierre] = (p.get(`a${i}`) ?? '').split(':');
      return {
        count: p.has(`n${i}`) ? Number(p.get(`n${i}`)) : def.count,
        ids: ids === null ? def.ids : ids === '' ? [] : ids.split(','),
        apertura: apertura || null,
        cierre: cierre || null,
      };
    }),
  };
}

export function urlDeMontaje(montaje) {
  const p = new URLSearchParams();
  montaje.secciones.forEach((s, i) => {
    p.set(`s${i}`, s.ids.join(','));
    p.set(`n${i}`, String(s.count));
    p.set(`a${i}`, `${s.apertura ?? ''}:${s.cierre ?? ''}`);
  });
  if (!montaje.sortear) p.set('fijo', '1');
  return `?${p.toString()}`;
}

// ── Aplicación al sorteo ─────────────────────────────────────────────────────

// Reescribe el ancla de una entrada según lo elegido en el panel.
function conAncla(entrada, anchor) {
  const niveles = nivelesDe(entrada).map((l, i) =>
    i === 0 ? { ...l, anchor } : { ...l, anchor: undefined }
  );
  return Array.isArray(entrada) ? niveles : niveles[0];
}

export function entradasDe(montaje) {
  const out = [];
  ENTRADAS.forEach((entrada) => {
    const cfg = montaje.secciones[seccionDe(entrada)];
    if (!cfg) return out.push(entrada);
    const id = idDe(entrada);
    if (!cfg.ids.includes(id)) return;
    const anchor = id === cfg.apertura ? 'first' : id === cfg.cierre ? 'last' : undefined;
    out.push(conAncla(entrada, anchor));
  });
  return out;
}

// ── Avisos: la pantalla deja romper la obra, pero lo dice ────────────────────

export function avisosDe(montaje) {
  const avisos = [];
  const s3 = montaje.secciones[2];
  const marcados = montaje.secciones.flatMap((s) => s.ids);

  if (!marcados.includes('dibujo')) {
    avisos.push('Sin el nivel de dibujo, el recorrido termina sin nada que imprimir.');
  } else if (s3.cierre !== 'dibujo') {
    avisos.push('El dibujo no cierra la sección 3: el visitante puede seguir dibujando y que después pasen otros niveles.');
  }
  if (marcados.includes('agua-recordatorio') && !marcados.includes('agua-cuando')) {
    avisos.push(
      montaje.sortear
        ? 'La cita del agua no puede salir sin su pregunta: el sorteo la va a descartar.'
        : 'La cita del agua va a usar el texto de respaldo porque su pregunta no está marcada.'
    );
  }
  montaje.secciones.forEach((s, i) => {
    if (s.ids.length === 0) return avisos.push(`La sección ${i + 1} quedó vacía.`);
    if (!montaje.sortear) return;
    const disponibles = entradasDeSeccion(i)
      .filter((e) => s.ids.includes(idDe(e)))
      .reduce((n, e) => n + largoDe(e), 0);
    if (disponibles < s.count) {
      avisos.push(
        `La sección ${i + 1} pide ${s.count} niveles y sólo hay ${disponibles} marcados: se van a ver ${disponibles}.`
      );
    }
  });
  return avisos;
}
