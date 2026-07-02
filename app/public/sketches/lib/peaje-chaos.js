// peaje-chaos.js — contrato de caos para sketches de El Peaje v2.
//
// El padre (SketchLevel) pasa el nivel de caos y la posición en el recorrido
// por query param y por postMessage. Este helper los normaliza y:
//   1. expone window.PeajeChaos = { chaos, section, step, total }
//   2. llama a window.onPeajeChaos(data) si el sketch la define (para que el
//      sketch se degrade a sí mismo: colores, glitch, dificultad, lo que sea)
//   3. aplica una degradación base (scanlines + tinte violeta) para que el
//      sketch nunca quede "isla limpia" aunque no defina onPeajeChaos.
//
// Para art-dirigir un sketch: definir window.onPeajeChaos ANTES de cargar este
// script. Para desactivar la base y hacerlo 100% a mano:
//   window.PEAJE_NO_BASELINE = true;
(function () {
  function parseParams() {
    var q = new URLSearchParams(location.search);
    var n = function (k) { return parseInt(q.get(k) || '0', 10) || 0; };
    return { chaos: n('chaos'), section: n('section'), step: n('step'), total: n('total') };
  }

  function apply(data) {
    window.PeajeChaos = data;
    if (typeof window.onPeajeChaos === 'function') {
      try { window.onPeajeChaos(data); } catch (e) { /* el sketch verá el error en su consola */ }
    }
    if (!window.PEAJE_NO_BASELINE) renderBaseline(data.chaos);
  }

  // Degradación base: overlay barato (no filtra el canvas vivo, para no matar
  // el fps en mobile). Escala con el caos y, en caos alto, la línea de barrido
  // se mueve y parpadea apenas.
  function renderBaseline(chaos) {
    ensureStyle();
    var overlay = document.getElementById('peaje-chaos-overlay');
    if (chaos <= 0) { if (overlay) overlay.remove(); return; }

    var t = Math.max(0, Math.min(1, chaos / 9));
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'peaje-chaos-overlay';
      (document.body || document.documentElement).appendChild(overlay);
    }
    overlay.style.opacity = (0.12 + 0.34 * t).toFixed(3);
    overlay.className = chaos >= 8 ? 'peaje-scan-anim peaje-flicker' : chaos >= 6 ? 'peaje-scan-anim' : '';
  }

  function ensureStyle() {
    if (document.getElementById('peaje-chaos-style')) return;
    var css =
      '#peaje-chaos-overlay{position:fixed;inset:0;pointer-events:none;z-index:2147483647;' +
        'background:' +
          'repeating-linear-gradient(0deg,transparent 0 2px,rgba(124,58,237,0.5) 2px 3px),' +
          'linear-gradient(180deg,rgba(124,58,237,0.06),rgba(20,10,40,0.12));}' +
      '@keyframes peaje-scan{0%{background-position:0 0,0 0}100%{background-position:0 60px,0 0}}' +
      '@keyframes peaje-flick{0%,100%{opacity:1}92%{opacity:1}94%{opacity:.55}96%{opacity:1}}' +
      '#peaje-chaos-overlay.peaje-scan-anim{animation:peaje-scan 3.5s linear infinite}' +
      '#peaje-chaos-overlay.peaje-flicker{animation:peaje-scan 2s linear infinite,peaje-flick 4s steps(1) infinite}';
    var el = document.createElement('style');
    el.id = 'peaje-chaos-style';
    el.textContent = css;
    (document.head || document.documentElement).appendChild(el);
  }

  var params = parseParams();
  if (document.body) apply(params);
  else document.addEventListener('DOMContentLoaded', function () { apply(params); });

  // Redundancia / posibilidad de actualización en vivo desde el padre.
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'peaje:chaos') {
      apply({
        chaos: e.data.chaos || 0,
        section: e.data.section || 0,
        step: e.data.step || 0,
        total: e.data.total || 0,
      });
    }
  });
})();
