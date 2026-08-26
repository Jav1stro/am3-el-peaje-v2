import { useMemo, useRef, useState } from 'react';

// Texto distorsionado. Dos vías, a propósito:
//   level.img   — imagen hecha a mano (los captchas originales del proyecto)
//   level.word  — la palabra como dato: la dibuja el componente
// La segunda existe para que agregar una palabra sea escribir una línea en el
// archivo de la sección, sin depender de un asset nuevo.

// Tintas del captcha institucional. Los DÍGITOS no usan esta paleta: van en el
// violeta de la máquina, porque los pone ella (ver "sequ1a").
const INK = ['#1f3a93', '#1e6f3c', '#7a2f8f', '#1a5fa8', '#5c5a24', '#2f7d32'];
const INK_MAQUINA = '#7c3aed';

// Para comparar lo escrito con la palabra: se ignora lo que no hace a la
// prueba —mayúsculas, espacios de más, tildes—, porque el captcha pide leer,
// no ortografía.
const normalizar = (t) =>
  t.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// El captcha exige la palabra exacta, pero ningún nivel bloquea (ver CLAUDE.md
// → Lo que NO hacer). Al tercer intento fallido el sistema se da por vencido:
// declara que no pudo verificar y lo deja pasar igual. En sala esto es lo que
// evita que alguien que no logra leer la palabra se quede parado para siempre
// y el recorrido no llegue nunca a la impresora.
const INTENTOS = 3;
const RENDICION = 'ERR-TXT-0x39 · Legibilidad no verificable. Se registra el intento. Continúe.';

// Ruido determinístico: la misma palabra se deforma siempre igual, así no
// tiembla en cada render de React.
function noise(i, salt) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}
const between = (n, min, max) => min + n * (max - min);

function useDistortedWord(word) {
  return useMemo(() => {
    if (!word) return null;
    const letters = [...word].map((char, i) => {
      const isDigit = /\d/.test(char);
      return {
        char,
        color: isDigit ? INK_MAQUINA : INK[Math.floor(noise(i, 3) * INK.length)],
        rotate: between(noise(i, 1), -24, 24),
        skew: between(noise(i, 2), -12, 12),
        dy: between(noise(i, 4), -9, 9),
        scale: between(noise(i, 5), 0.85, 1.2),
      };
    });

    // Tres ondas cruzando la caja, como las del captcha original.
    const waves = [0, 1, 2].map((w) => {
      const y = 24 + w * 26 + noise(w, 9) * 10;
      const amp = between(noise(w, 11), 8, 18);
      return `M 0 ${y} C 25 ${y - amp}, 50 ${y + amp}, 75 ${y - amp / 2} S 125 ${y + amp}, 150 ${y}`;
    });

    return { letters, waves };
  }, [word]);
}

export default function DistortedLevel({ level, stepLabel, onDone }) {
  const [value, setValue] = useState('');
  const [hint, setHint] = useState(null);
  const fallidos = useRef(0);
  const drawn = useDistortedWord(level.word);

  // Un nivel se corrige sólo si declara la respuesta: `answers` cuando hay más
  // de una forma válida de leerla, o la propia `word`. Los captchas por imagen
  // no declaran ninguna —la palabra vive adentro del JPG— y siguen aceptando
  // cualquier cosa no vacía.
  const esperadas = level.answers ?? (level.word ? [level.word] : null);

  const verificar = () => {
    const escrito = value.trim();
    if (!escrito) return setHint('Escribí el texto antes de continuar.');
    if (esperadas && !esperadas.some((r) => normalizar(r) === normalizar(escrito))) {
      fallidos.current += 1;
      if (fallidos.current >= INTENTOS) return onDone({ errorOverride: RENDICION });
      const quedan = INTENTOS - fallidos.current;
      return setHint(
        `El texto no coincide. Te queda${quedan === 1 ? '' : 'n'} ${quedan} intento${quedan === 1 ? '' : 's'}.`
      );
    }
    onDone();
  };

  return (
    <>
      <div className="card-header">
        <div className="card-logo">Verificación de texto · {stepLabel}</div>
        <div className="card-title">Escribí el texto que aparece en la imagen</div>
        <div className="card-subtitle">Las letras pueden estar distorsionadas</div>
      </div>

      <div className="distorted-img-container">
        {drawn ? (
          <div className="distorted-word" aria-hidden="true">
            <svg className="distorted-grain" preserveAspectRatio="none">
              <filter id="peaje-grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="7" />
                <feColorMatrix type="saturate" values="0" />
                <feComponentTransfer>
                  <feFuncA type="discrete" tableValues="0 0 0 0 1" />
                </feComponentTransfer>
              </filter>
              <rect width="100%" height="100%" filter="url(#peaje-grain)" />
            </svg>
            <div className="distorted-letters">
              {drawn.letters.map((l, i) => (
                <span
                  key={i}
                  style={{
                    color: l.color,
                    transform: `rotate(${l.rotate}deg) skewX(${l.skew}deg) translateY(${l.dy}px) scale(${l.scale})`,
                  }}
                >
                  {l.char}
                </span>
              ))}
            </div>
            <svg className="distorted-waves" viewBox="0 0 150 90" preserveAspectRatio="none">
              {drawn.waves.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </svg>
          </div>
        ) : (
          <img src={level.img} alt="texto distorsionado" />
        )}
      </div>

      <input
        type="text"
        className="text-input"
        placeholder={level.placeholder}
        autoComplete="off"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (hint) setHint(null);
        }}
      />
      {hint && <div className="error-banner">{hint}</div>}
      <button className="btn btn-primary" onClick={verificar}>
        Verificar
      </button>
    </>
  );
}
