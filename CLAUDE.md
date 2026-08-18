# El Peaje v2 — CLAUDE.md

## Qué es este proyecto

**El Peaje v2** es la segunda iteración de la obra El Peaje (ver `../am3-el-peaje`):
una web mobile-first a la que el visitante llega por QR en sala. A diferencia de v1
(loop infinito), v2 es un **recorrido** lineal por tres **secciones** de intimidad
creciente, con **final real**: al completarlo, el dibujo que el visitante hizo en el
último nivel se imprime en una impresora en la sala.

Leer `CONTEXT.md` (glosario de dominio) y `docs/adr/` antes de tocar nada.

## Estructura del repo

```
am3-el-peaje-v2/
├── CONTEXT.md              # Glosario de dominio — la fuente de verdad conceptual
├── CLAUDE.md
├── docs/adr/
│   ├── 0001-recorrido-lineal-con-final.md
│   └── 0002-impresion-por-relay.md
├── app/                    # La aplicación (React + Vite)
└── print-station/          # Estación de impresión (Node, corre en la compu de sala)

La única copia viva de cada sketch es la de `app/public/sketches/`. Los
materiales originales entregados no se conservan en el repo — al integrar un
sketch nuevo, se adapta directo a su carpeta de sección y el original se
descarta. `app/dist/` es el resultado del build (descartable, se regenera con
`npm run build`; no editar ahí).
```

## App (`app/`)

- **React + Vite**, CSS puro (sin Tailwind), Zustand para estado.
- La organización sigue la distinción del glosario **nivel / tipo de nivel**:
  las secciones dicen QUÉ niveles hay; los tipos de nivel dicen CÓMO se juega
  cada mecánica (y se comparten entre secciones — no meterlos en carpetas de
  sección).
- **Cadenas y expediente** (ver CONTEXT.md y ADR 0004). Una entrada del pool
  puede ser un array: es una **cadena**, se sortea entera y en orden. Un nivel
  con `needs: '<id>'` arrastra a la entrada que contiene ese id y el sorteo los
  separa todo lo posible. Un nivel con `record: 'clave'` guarda su respuesta en
  el **expediente** (en memoria, muere con la visita) y otro nivel la cita con
  `{{clave}}` en su texto. En `options`, una opción puede ser
  `{ label, cita }` — la cita es cómo se lee esa respuesta al ser retomada.
- `src/secciones/` — pool de niveles, **un archivo por sección**
  (`seccion-1-mecanica.js`, `seccion-2-intima.js`, `seccion-3-cuerpo.js`).
  Cada archivo exporta su pool; `index.js` ensambla `LEVELS` asignando el
  número de sección — los niveles NO declaran `section` a mano. `errorMsg`
  vuelve al nivel "error no verificable" (muestra el error y avanza igual).
  `anchor` lo vuelve **nivel de transición** (ver CONTEXT.md): queda fijo en un
  borde de su sección, fuera del sorteo. `'first'` lo ancla al inicio, `'last'`
  al cierre. Hoy: `checkbox` abre la S1, `tos` la cierra, y `dibujo` cierra la S3.
- `src/tipos-de-nivel/` — un componente React por mecánica (checkbox, imagen,
  opciones, texto, declarativo, puzzle, tos, prioridades, cámara, sketch,
  dibujo). `StatementLevel` (declarativo) es el único donde la máquina habla
  sin pedir nada: sólo se puede continuar.
  `OptionsLevel` lo usan S1 y S2. `DistortedLevel` acepta dos vías: `img` (una
  imagen hecha a mano) o `word` (la palabra como dato — la dibuja el componente
  con letras torcidas, ondas y moteado). Con `word`, los **dígitos** salen en el
  violeta de la máquina y las letras en la paleta institucional: por eso
  `sequ1a` se lee como intervenida. `TextLevel` (pregunta abierta con input) no
  trae textos propios: el nivel le pasa `logo`, `question`, `subtitle`,
  `placeholder` y `emptyHint`, para que la mecánica sirva a cualquier sección. El `TosLevel` (términos y condiciones) toma sus textos de
  `src/data/tosText.js` (editables sin tocar el componente). `PrioridadesLevel`
  (depositar derechos en casillas de prescindibilidad) es un nivel nativo —
  antes era un sketch en iframe; se pasó a nativo para que herede la
  degradación por caos como el resto. `SketchLevel` sigue disponible para
  sketches de p5 en iframe, aunque hoy ningún nivel lo usa.
- `src/data/recorridoConfig.js` — configuración global del recorrido.
- `src/data/verificaciones.js` — el **teatro de verificación** (ver
  CONTEXT.md): pools exclusivos por sección con variantes de presentación
  (`spinner` | `bar` | `metrics` | `steps` | `glitch`), texto, código fake y
  duración fija. NO es aleatorio: `verificationFor(section, step)` devuelve la
  variante que corresponde a la posición del nivel dentro de su sección (recorre
  el pool en orden). Los textos son ejemplos editables — cambiar ahí, sin tocar
  `ProcessingOverlay.jsx` (que implementa los cinco estilos). El overlay adopta
  el diseño de la sección vía la clase `proc-s{section}` (limpio / violeta /
  terminal), en línea con la degradación de las cards.
- `public/sketches/` — sketches de p5 en iframe, organizados por sección.
  Hoy no hay ninguno (prioridades pasó a nativo; los juegos se descartaron);
  quedan sólo las librerías compartidas en `lib/` (`p5.js` y `peaje-chaos.js`)
  para futuros sketches, referenciadas como `/sketches/lib/...`.
- `src/data/recorridoConfig.js` — cantidad de niveles por sección
  (`SECTION_LEVEL_COUNTS`, se recorta al tamaño del pool), rampas de caos por
  sección y tiempos del teatro de verificación.
- `src/store/useRecorridoStore.js` — sorteo del recorrido, índice actual,
  avance, dibujo, cálculo de caos y progreso.
- `src/screens/LevelRouter.jsx` — registra los componentes de nivel
  (`LEVEL_COMPONENTS`) y maneja el flujo: completado → spinner → (error no
  verificable) → avance.
- Cada tipo de nivel recibe `onDone()` y lo llama al completarse la
  interacción. La cámara puede llamar `onDone({ errorOverride })` si el
  visitante niega el permiso.
- `src/styles/base.css` — estética institucional + clases `chaos-1..9`.
  La clase de caos se aplica a `<html>` (no a `<body>`: los selectores son
  `.chaos-N body`).

### Agregar un nivel nuevo (componente React)

1. Si su mecánica ya existe, solo agregar la entrada al pool en el archivo de
   su sección en `src/secciones/`. Si es una mecánica nueva: crear el
   componente en `src/tipos-de-nivel/` (que llame `onDone()` al completarse) y
   registrarlo en `LEVEL_COMPONENTS` en `LevelRouter.jsx`.

### Agregar un sketch de p5 (contrato de sketches)

1. Copiar la carpeta del sketch a `app/public/sketches/seccion-<N>/<nombre>/`
   (al menos un `index.html`; usar `/sketches/lib/p5.js` en lugar de un p5
   propio o de CDN).
2. El sketch debe funcionar en vertical de celular y, al completarse, ejecutar:
   `window.parent.postMessage({ type: 'peaje:done' }, '*');`
3. Para sketches de canvas fijo (como prioridades, 400×600):
   `canvas { width: 100vw !important; height: auto !important; touch-action: none; }`
   — p5 corrige las coordenadas de mouse/touch con el canvas escalado por CSS.
   Para sketches fullscreen: `createCanvas(windowWidth, windowHeight)` +
   `windowResized()`.
4. Agregar la entrada `{ id, type: 'sketch', src: '/sketches/seccion-<N>/<nombre>/index.html' }`
   en el archivo de la sección en `src/secciones/`. No usar botones DOM
   (`createButton`) posicionados en píxeles sobre canvas escalado: se
   desalinean — dibujarlos dentro del canvas (los overlays HTML/CSS comunes
   están bien).
5. Si el sketch pide sensores/cámara/mic: el iframe ya permite `camera;
   microphone; accelerometer; gyroscope` (ver `SketchLevel.jsx`).
6. **Caos dentro del sketch**: incluir `<script src="/sketches/lib/peaje-chaos.js"></script>`
   al final del body (después del sketch). El padre le pasa su nivel de caos y
   su posición en el recorrido (por query param y postMessage); el helper los
   expone en `window.PeajeChaos = { chaos, section, step, total }` y aplica una
   degradación base (scanlines + tinte violeta) para que el sketch no quede
   "isla limpia". Como los estilos CSS del padre NO cruzan el iframe, ésta es
   la única vía para que el caos alcance al sketch.
   - Para que el sketch se degrade a sí mismo (colores, glitch, dificultad),
     definir `window.onPeajeChaos = ({ chaos, section, step, total }) => {…}`
     ANTES de cargar el helper. Se llama al recibir el nivel.
   - Para hacer la degradación 100% a mano y apagar la base: `window.PEAJE_NO_BASELINE = true;`

### Caos

El caos (0–9) no se declara por nivel: se calcula por posición con las rampas
de `SECTION_CHAOS_RAMPS` — sube suave dentro de la sección y pega saltos
grandes al cambiar de sección.

La degradación de la card por caos (border, fondo, título, botón, scanlines
internas vía `--card-scan`) usa la paleta de la máquina (violeta/magenta/cyan)
para coherencia con el fondo. **Sección 1 (chaos 1-3) es casi imperceptible a
propósito** — apenas un tinte de borde, sin scanlines ni movimiento; es una
decisión de obra, no algo a "arreglar". El salto real se siente al entrar a la
sección 2. En caos alto (8-9) la card se vuelve un panel de terminal oscuro y
translúcido para que la máquina se filtre a través de ella; el movimiento es
mínimo (1px, `card-jitter`) para no impedir dibujar/interactuar.

Detrás de la fachada se revela la **máquina** (ver CONTEXT.md, ADR 0003):
`MachineLayer.jsx` monta una capa de fondo con una imagen de sustrato de
`public/maquina/` (boot → terminal → datamosh según la banda de caos). Se
revela por **opacidad** (`--machine-opacity` por `.chaos-N` en base.css), con
glitch en caos alto y temblor de pantalla (`screen-shake` sobre `#root`) sólo
en caos 9. Para volver al enfoque de grietas descartado, ver ADR 0003 — se
cambia sólo el CSS de `.machine-layer` y el componente.

## Estación de impresión (`print-station/`)

Corre en la compu de sala con la impresora USB. Escucha el canal
`el-peaje-v2:imprenta` de Supabase y imprime con `lp` los dibujos que llegan.

```
cd print-station && npm install
SUPABASE_URL=... SUPABASE_ANON_KEY=... PRINTER=nombre npm start
```

Requiere en Supabase: bucket público `dibujos` en Storage. La app usa
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (ver `app/.env.example`).
Sin env vars todo funciona salvo la impresión.

## Lo que NO hacer

- No persistir el recorrido (ni localStorage ni nada): recargar = empezar de
  cero. Es una decisión de obra, no un bug.
- No hacer que un nivel bloquee: completar la interacción siempre avanza.
  Los errores del sistema son declarativos (ver CONTEXT.md → Error no verificable).
- No agregar sistemas de temas/estéticas: la única estética es la
  institucional degradándose por caos.
- No mandar datos del visitante al canal de impresión: solo el dibujo, anónimo.
- No portar la fila/presencia multiusuario de v1: no existe en v2.
- No usar librerías de componentes UI.
