// ─────────────────────────────────────────────────────────────────────────────
// PANEL DE MONTAJE — la pantalla donde se arma el montaje (CONTEXT.md).
// No es parte de la obra: el visitante no llega nunca acá. Pero sí del
// dispositivo — es la herramienta con la que se monta la función, de pie en la
// sala y desde un teléfono, antes de abrir. Por eso viaja con la obra y no se
// borra: si alguna vez se saca, es borrando src/montaje/ entera y los dos
// enganches marcados con "montaje" (uno en src/main.jsx, otro en
// src/store/useRecorridoStore.js).
//
// Los estilos viven en montaje.css, al lado. No tocan base.css ni lo heredan:
// main.jsx carga uno u otro, nunca los dos.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import { SECTIONS } from '../secciones';
import './montaje.css';
import {
  avisosDe,
  entradasDeSeccion,
  idDe,
  largoDe,
  leerMontaje,
  montajePorDefecto,
  textoDe,
  urlDeMontaje,
} from './montaje';

export default function PantallaMontaje() {
  // Si la URL ya trae un montaje, el panel abre con ése: así se puede tomar el
  // enlace de otra persona, verlo y retocarlo.
  const [montaje, setMontaje] = useState(() => leerMontaje() ?? montajePorDefecto());
  // Qué secciones están desplegadas. Arrancan las tres cerradas: así las tres
  // cabeceras entran juntas en una pantalla de teléfono y se abre la que se va
  // a tocar. No viaja en la URL ni se guarda — la URL lleva el montaje, y abrir
  // o cerrar una sección es estado de mirada, no de montaje.
  const [abiertas, setAbiertas] = useState(() => SECTIONS.map(() => false));
  const [copiado, setCopiado] = useState(false);
  // El tooltip del tope. Existía como `title`, que en un teléfono no se ve
  // nunca: no hay hover. Es uno solo para las tres secciones porque la
  // explicación es la misma.
  const [ayudaTope, setAyudaTope] = useState(false);
  const avisos = useMemo(() => avisosDe(montaje), [montaje]);
  const url = useMemo(() => urlDeMontaje(montaje), [montaje]);

  const plegar = (i) => setAbiertas((a) => a.map((v, j) => (j === i ? !v : v)));

  const cambiarSeccion = (i, parche) =>
    setMontaje((m) => ({
      ...m,
      secciones: m.secciones.map((s, j) => (j === i ? { ...s, ...parche } : s)),
    }));

  const alternar = (i, id) =>
    setMontaje((m) => ({
      ...m,
      secciones: m.secciones.map((s, j) => {
        if (j !== i) return s;
        const dentro = s.ids.includes(id);
        const ids = dentro ? s.ids.filter((x) => x !== id) : [...s.ids, id];
        return {
          ...s,
          ids,
          // Si se apaga un nivel que era ancla, deja de serlo.
          apertura: dentro && s.apertura === id ? null : s.apertura,
          cierre: dentro && s.cierre === id ? null : s.cierre,
        };
      }),
    }));

  // Marca o desmarca la sección entera. Si ya estaba completa, la vacía.
  const alternarSeccion = (i) =>
    setMontaje((m) => ({
      ...m,
      secciones: m.secciones.map((s, j) => {
        if (j !== i) return s;
        const todos = entradasDeSeccion(i).map(idDe);
        const ids = todos.every((id) => s.ids.includes(id)) ? [] : todos;
        return {
          ...s,
          ids,
          // Al vaciar la sección, lo que era ancla deja de existir.
          apertura: ids.includes(s.apertura) ? s.apertura : null,
          cierre: ids.includes(s.cierre) ? s.cierre : null,
        };
      }),
    }));

  const enlace = window.location.origin + window.location.pathname + url;

  const empezar = () => {
    window.location.search = url;
  };

  // Sin select(): en un teléfono levanta el teclado y tapa media pantalla para
  // nada. El acuse alcanza para saber que salió.
  const copiar = () => {
    navigator.clipboard?.writeText(enlace).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1600);
  };

  return (
    <div className="mtj">
      <h1>Montaje</h1>
      <p>Cómo queda armada la obra para esta función. El enlace de abajo la comparte entera.</p>

      <div className="mtj-modo">
        <button
          className={montaje.sortear ? 'on' : ''}
          onClick={() => setMontaje((m) => ({ ...m, sortear: true }))}
        >
          Sortear
        </button>
        <button
          className={!montaje.sortear ? 'on' : ''}
          onClick={() => setMontaje((m) => ({ ...m, sortear: false }))}
        >
          Fijo, en orden
        </button>
      </div>

      {montaje.sortear && (
        <label className="mtj-check mtj-separar">
          <input
            type="checkbox"
            checked={montaje.separar}
            onChange={() => setMontaje((m) => ({ ...m, separar: !m.separar }))}
          />
          Separar mecánicas: que no caigan dos niveles seguidos que se jueguen igual
        </label>
      )}

      {avisos.length > 0 && (
        <div className="mtj-avisos">
          <ul>
            {avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {SECTIONS.map((seccion, i) => {
        const cfg = montaje.secciones[i];
        const entradas = entradasDeSeccion(i);
        const marcadas = entradas.filter((e) => cfg.ids.includes(idDe(e)));
        // Una cadena marcada aporta tantos niveles como eslabones tiene.
        const nivelesMarcados = marcadas.reduce((n, e) => n + largoDe(e), 0);
        // En modo fijo la cantidad no se elige: es la que marcaste.
        const aMostrar = montaje.sortear ? cfg.count : nivelesMarcados;
        const abierta = abiertas[i];
        return (
          <section className="mtj-sec" key={seccion.id}>
            <div className="mtj-cab">
              <label>
                <input
                  type="checkbox"
                  aria-label="Marcar o desmarcar todos los niveles de la sección"
                  checked={marcadas.length === entradas.length}
                  // Ni todas ni ninguna: el check queda a medio camino.
                  ref={(el) => {
                    if (el) el.indeterminate = marcadas.length > 0 && marcadas.length < entradas.length;
                  }}
                  onChange={() => alternarSeccion(i)}
                />
              </label>
              <button className="mtj-plegar" aria-expanded={abierta} onClick={() => plegar(i)}>
                <span className="mtj-flecha">▶</span>
                <h2>
                  {i + 1}. {seccion.name}
                </h2>
                <span className="mtj-cuenta">
                  {marcadas.length}/{entradas.length} · <b>{aMostrar}</b>
                </span>
              </button>
            </div>

            {abierta && (
              <>
                <div className="mtj-ctrl">
                  <label>
                    mostrar
                    {montaje.sortear ? (
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={cfg.count}
                        onChange={(e) => cambiarSeccion(i, { count: Number(e.target.value) })}
                      />
                    ) : (
                      <b>{nivelesMarcados}</b>
                    )}
                  </label>
                  {montaje.sortear && (
                    <label>
                      tope por mecánica
                      <input
                        type="number"
                        min="0"
                        max="9"
                        value={cfg.tope ?? 0}
                        onChange={(e) => cambiarSeccion(i, { tope: Number(e.target.value) })}
                      />
                      <button
                        type="button"
                        className="mtj-ayuda"
                        aria-expanded={ayudaTope}
                        aria-label="Qué es el tope por mecánica"
                        onClick={() => setAyudaTope((v) => !v)}
                      >
                        ?
                      </button>
                    </label>
                  )}
                  {['apertura', 'cierre'].map((cual) => (
                    <label key={cual}>
                      {cual === 'apertura' ? 'abre' : 'cierra'}
                      <select
                        value={cfg[cual] ?? ''}
                        onChange={(e) => cambiarSeccion(i, { [cual]: e.target.value || null })}
                      >
                        <option value="">—</option>
                        {marcadas.map((e) => (
                          <option key={idDe(e)} value={idDe(e)}>
                            {idDe(e)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>

                {montaje.sortear && ayudaTope && (
                  <p className="mtj-nota">
                    Cuántos niveles de la misma mecánica entran en la sección. Con 2, no van a
                    salir tres captchas de imagen. <b>0 = sin tope.</b> Si el tope no alcanza
                    para llenar la sección, el sorteo lo pasa por alto antes que dejarla corta.
                  </p>
                )}

                {entradas.map((entrada) => {
                  const info = textoDe(entrada);
                  const on = cfg.ids.includes(info.id);
                  return (
                    <label className="mtj-fila" key={info.id}>
                      <input type="checkbox" checked={on} onChange={() => alternar(i, info.id)} />
                      <span>
                        <span className="mtj-meta">
                          <span className="mtj-id">{info.id}</span>
                          <span className="mtj-tipo">{info.tipo}</span>
                          {info.cadena && <span className="mtj-tag">cadena ×{info.largo}</span>}
                          {cfg.apertura === info.id && <span className="mtj-tag">abre</span>}
                          {cfg.cierre === info.id && <span className="mtj-tag">cierra</span>}
                        </span>
                        {info.texto && <span className="mtj-txt">{info.texto}</span>}
                      </span>
                    </label>
                  );
                })}
              </>
            )}
          </section>
        );
      })}

      <div className="mtj-pie">
        <button className="mtj-empezar" onClick={empezar}>
          Empezar
        </button>
        <div className="mtj-link">
          <input readOnly value={enlace} />
          <button className="mtj-copiar" data-copiado={copiado ? 'si' : 'no'} onClick={copiar}>
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>
    </div>
  );
}
