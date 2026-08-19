// ─────────────────────────────────────────────────────────────────────────────
// HERRAMIENTA DE DESARROLLO — NO ES PARTE DE LA OBRA. Se borra antes de la sala.
// Los estilos van acá adentro a propósito: nada de esto toca base.css, así que
// borrar la carpeta no deja rastros.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import { SECTIONS } from '../secciones';
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

const ESTILOS = `
.mtj { max-width: 720px; margin: 0 auto; padding: 24px 16px 64px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #202124; }
.mtj h1 { font-size: 17px; margin: 0 0 14px; }
.mtj h1 span { font-weight: 400; font-size: 12px; color: #5f6368; margin-left: 8px; }
.mtj-modo { display: flex; gap: 6px; margin-bottom: 16px; }
.mtj-modo button { flex: 1; padding: 8px 12px; border-radius: 8px; cursor: pointer;
  border: 1px solid #dadce0; background: #fff; font-size: 12.5px; }
.mtj-modo button.on { border-color: #1a73e8; background: #e8f0fe; font-weight: 600; }
.mtj-sec { border: 1px solid #dadce0; border-radius: 10px; margin-bottom: 12px; overflow: hidden; }
.mtj-sec > header { padding: 10px 14px; background: #f8f9fa; border-bottom: 1px solid #dadce0; }
.mtj-cab { display: flex; align-items: center; gap: 10px; }
.mtj-sec h2 { font-size: 13.5px; margin: 0; flex: 1; }
.mtj-sec label { font-size: 12px; color: #5f6368; display: flex; align-items: center; gap: 5px; }
.mtj-ctrl { display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap; }
.mtj-sec input[type=number] { width: 48px; padding: 3px 6px; border: 1px solid #dadce0; border-radius: 6px; font-size: 12.5px; }
.mtj-sec select { padding: 3px 6px; border: 1px solid #dadce0; border-radius: 6px; font-size: 12px; max-width: 150px; }
.mtj-fila { display: flex; gap: 9px; padding: 6px 14px; border-top: 1px solid #f1f3f4; align-items: center; }
.mtj-fila:first-of-type { border-top: none; }
.mtj-fila input[type=checkbox] { width: 15px; height: 15px; flex-shrink: 0; }
.mtj-fila > span { min-width: 0; display: flex; align-items: baseline; gap: 6px; }
.mtj-fila .mtj-id { font-size: 12.5px; font-weight: 600; font-family: ui-monospace, Menlo, monospace; white-space: nowrap; }
.mtj-fila .mtj-txt { font-size: 11.5px; color: #80868b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mtj-total { font-size: 13px; color: #202124; }
.mtj-tag { font-size: 10px; color: #7a2f8f; border: 1px solid #e0d3ea; border-radius: 4px;
  padding: 0 4px; white-space: nowrap; flex-shrink: 0; }
.mtj-avisos { border: 1px solid #f0b4b4; background: #fdf3f3; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; }
.mtj-avisos li { font-size: 12px; color: #a52222; line-height: 1.45; margin-left: 16px; }
.mtj-pie { position: sticky; bottom: 0; background: #fff; border-top: 1px solid #dadce0;
  padding: 14px 0 0; margin-top: 20px; }
.mtj-empezar { width: 100%; padding: 13px; border: none; border-radius: 8px; background: #1a73e8;
  color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; }
.mtj-link { display: flex; gap: 8px; margin-top: 10px; }
.mtj-link input { flex: 1; min-width: 0; padding: 8px 10px; border: 1px solid #dadce0; border-radius: 6px;
  font-size: 11px; font-family: ui-monospace, Menlo, monospace; color: #5f6368; }
.mtj-link button { padding: 8px 14px; border: 1px solid #dadce0; background: #fff; border-radius: 6px;
  font-size: 12px; cursor: pointer; white-space: nowrap; }
`;

export default function PantallaMontaje() {
  // Si la URL ya trae una configuración, el panel abre con ésa: así se puede
  // tomar el enlace de otra persona, verlo y retocarlo.
  const [montaje, setMontaje] = useState(() => leerMontaje() ?? montajePorDefecto());
  const avisos = useMemo(() => avisosDe(montaje), [montaje]);
  const url = useMemo(() => urlDeMontaje(montaje), [montaje]);

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

  const empezar = () => {
    window.location.search = url;
  };

  const copiar = (e) => {
    const input = e.currentTarget.previousSibling;
    input.select();
    navigator.clipboard?.writeText(input.value).catch(() => {});
  };

  return (
    <div className="mtj">
      <style>{ESTILOS}</style>
      <h1>
        Montaje <span>el enlace de abajo comparte esta configuración</span>
      </h1>

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
        return (
          <section className="mtj-sec" key={seccion.id}>
            <header>
              <div className="mtj-cab">
                <h2>
                  {i + 1}. {seccion.name}
                </h2>
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
                    // En modo fijo la cantidad no se elige: es la que marcaste.
                    <b className="mtj-total">{nivelesMarcados}</b>
                  )}
                </label>
              </div>
              <div className="mtj-ctrl">
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
            </header>

            {entradas.map((entrada) => {
              const info = textoDe(entrada);
              const on = cfg.ids.includes(info.id);
              return (
                <label className="mtj-fila" key={info.id}>
                  <input type="checkbox" checked={on} onChange={() => alternar(i, info.id)} />
                  <span>
                    <span className="mtj-id">{info.id}</span>
                    {info.cadena && <span className="mtj-tag">cadena ×{info.largo}</span>}
                    {cfg.apertura === info.id && <span className="mtj-tag">abre</span>}
                    {cfg.cierre === info.id && <span className="mtj-tag">cierra</span>}
                    {info.texto && <span className="mtj-txt">{info.texto}</span>}
                  </span>
                </label>
              );
            })}
          </section>
        );
      })}

      <div className="mtj-pie">
        <button className="mtj-empezar" onClick={empezar}>
          Empezar
        </button>
        <div className="mtj-link">
          <input readOnly value={window.location.origin + window.location.pathname + url} />
          <button onClick={copiar}>Copiar</button>
        </div>
      </div>
    </div>
  );
}
