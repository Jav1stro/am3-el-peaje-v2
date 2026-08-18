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
  montajePorDefecto,
  textoDe,
  urlDeMontaje,
} from './montaje';

const ESTILOS = `
.mtj { max-width: 720px; margin: 0 auto; padding: 24px 16px 64px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #202124; }
.mtj h1 { font-size: 20px; margin: 0 0 4px; }
.mtj .mtj-sub { font-size: 13px; color: #5f6368; margin-bottom: 20px; line-height: 1.5; }
.mtj-modo { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.mtj-modo button { flex: 1; min-width: 200px; padding: 10px 14px; border-radius: 8px; cursor: pointer;
  border: 1px solid #dadce0; background: #fff; font-size: 13px; text-align: left; line-height: 1.4; }
.mtj-modo button.on { border-color: #1a73e8; background: #e8f0fe; }
.mtj-modo b { display: block; font-size: 13px; }
.mtj-modo span { color: #5f6368; font-size: 12px; }
.mtj-sec { border: 1px solid #dadce0; border-radius: 10px; margin-bottom: 16px; overflow: hidden; }
.mtj-sec > header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 12px 14px; background: #f8f9fa; border-bottom: 1px solid #dadce0; }
.mtj-sec h2 { font-size: 14px; margin: 0; flex: 1; }
.mtj-sec header label { font-size: 12px; color: #5f6368; display: flex; align-items: center; gap: 6px; }
.mtj-sec header input[type=number] { width: 56px; padding: 4px 6px; border: 1px solid #dadce0; border-radius: 6px; font-size: 13px; }
.mtj-fila { display: flex; gap: 10px; padding: 9px 14px; border-top: 1px solid #f1f3f4; align-items: flex-start; }
.mtj-fila:first-of-type { border-top: none; }
.mtj-fila input[type=checkbox] { margin-top: 2px; width: 16px; height: 16px; flex-shrink: 0; }
.mtj-fila .mtj-id { font-size: 13px; font-weight: 600; font-family: ui-monospace, Menlo, monospace; }
.mtj-fila .mtj-txt { font-size: 12px; color: #5f6368; line-height: 1.4; }
.mtj-tag { font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #7a2f8f;
  border: 1px solid #e0d3ea; border-radius: 4px; padding: 1px 5px; margin-left: 6px; white-space: nowrap; }
.mtj-anclas { display: flex; gap: 12px; padding: 10px 14px; background: #fcfcfd; border-top: 1px solid #f1f3f4; flex-wrap: wrap; }
.mtj-anclas label { font-size: 12px; color: #5f6368; display: flex; align-items: center; gap: 6px; }
.mtj-anclas select { padding: 4px 6px; border: 1px solid #dadce0; border-radius: 6px; font-size: 12px; max-width: 190px; }
.mtj-avisos { border: 1px solid #f0b4b4; background: #fdf3f3; border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; }
.mtj-avisos li { font-size: 12.5px; color: #a52222; line-height: 1.5; margin-left: 16px; }
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
  const [montaje, setMontaje] = useState(montajePorDefecto);
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
      <h1>Montaje del recorrido</h1>
      <p className="mtj-sub">
        Herramienta de desarrollo: elegí qué niveles entran en cada sección y cuáles abren y
        cierran. Al empezar, la configuración queda en la dirección — podés pasarle el enlace a
        otra persona y va a ver exactamente lo mismo. Esta pantalla no existe para quien entra
        por el QR.
      </p>

      <div className="mtj-modo">
        <button
          className={montaje.sortear ? 'on' : ''}
          onClick={() => setMontaje((m) => ({ ...m, sortear: true }))}
        >
          <b>Sortear entre los marcados</b>
          <span>Como la obra real: cada arranque es distinto.</span>
        </button>
        <button
          className={!montaje.sortear ? 'on' : ''}
          onClick={() => setMontaje((m) => ({ ...m, sortear: false }))}
        >
          <b>Usar exactamente los marcados</b>
          <span>Sin azar, en este orden. Para mirar todos lo mismo.</span>
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
        return (
          <section className="mtj-sec" key={seccion.id}>
            <header>
              <h2>
                {i + 1}. {seccion.name}
              </h2>
              <label>
                mostrar
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={cfg.count}
                  disabled={!montaje.sortear}
                  onChange={(e) => cambiarSeccion(i, { count: Number(e.target.value) })}
                />
              </label>
            </header>

            {entradas.map((entrada) => {
              const info = textoDe(entrada);
              const on = cfg.ids.includes(info.id);
              return (
                <label className="mtj-fila" key={info.id}>
                  <input type="checkbox" checked={on} onChange={() => alternar(i, info.id)} />
                  <span>
                    <span className="mtj-id">{info.id}</span>
                    {info.cadena && (
                      <span className="mtj-tag">cadena · {info.largo} niveles</span>
                    )}
                    {cfg.apertura === info.id && <span className="mtj-tag">abre</span>}
                    {cfg.cierre === info.id && <span className="mtj-tag">cierra</span>}
                    {info.texto && <div className="mtj-txt">{info.texto}</div>}
                    {info.cadena && <div className="mtj-txt">→ {info.cadena.join(' → ')}</div>}
                  </span>
                </label>
              );
            })}

            <div className="mtj-anclas">
              {['apertura', 'cierre'].map((cual) => (
                <label key={cual}>
                  {cual === 'apertura' ? 'Abre:' : 'Cierra:'}
                  <select
                    value={cfg[cual] ?? ''}
                    onChange={(e) => cambiarSeccion(i, { [cual]: e.target.value || null })}
                  >
                    <option value="">(ninguno)</option>
                    {marcadas.map((e) => (
                      <option key={idDe(e)} value={idDe(e)}>
                        {idDe(e)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
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
