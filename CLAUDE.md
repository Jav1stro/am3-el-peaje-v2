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
│   └── ... (0005 supera al 0002: el final es un ticket térmico)
└── app/                    # La aplicación (React + Vite)
```

La impresión ya no vive en este repo: la hace `peaje-core`, un servidor Python
aparte que corre en la Raspberry de sala (ver más abajo).

La única copia viva de cada sketch es la de `app/public/sketches/`. Los
materiales originales entregados no se conservan en el repo — al integrar un
sketch nuevo, se adapta directo a su carpeta de sección y el original se
descarta. `app/dist/` es el resultado del build (descartable, se regenera con
`npm run build`; no editar ahí).

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
  opciones, texto, declarativo, puzzle, tos, prioridades, cámara, voz,
  movimiento, sketch, dibujo). `StatementLevel` (declarativo) es el único donde
  la máquina habla sin pedir nada: sólo se puede continuar.
  Las tres mecánicas de cuerpo piden un permiso real del teléfono y no miden
  nada: `CameraLevel` toma `logo`/`title`/`subtitle`/`metrics` del nivel, así
  que la verificación facial y la lectura de emociones son el mismo componente
  con otros textos; `VoiceLevel` (micrófono) mueve el medidor con el volumen
  real y saca conclusiones inventadas; `MotionLevel` (acelerómetro) hace
  inclinar el vaso hasta vaciarlo y cae solo al arrastre con el dedo si no hay
  giroscopio (escritorio, permiso denegado). Cámara y voz se rinden a los 20s
  si el visitante deja el diálogo de permiso sin contestar: `getUserMedia` no
  resuelve nunca y el nivel quedaría trabado — ningún nivel bloquea.
  `DrawingLevel` acepta
  `guardar: false`: sólo el dibujo del vaso va al store, que es el que sale por
  la impresora.
  `OptionsLevel` lo usan S1 y S2. En `OptionsLevel`, `TextLevel` y
  `StatementLevel` el campo `body` es el **preámbulo**: lo que la máquina
  afirma antes de preguntar, y por eso se dibuja arriba del título con la clase
  `.card-body` (texto corrido, hereda el color de la card). La cajita azul
  `.grid-instruction` queda sólo para la instrucción del captcha —
  imagen, cámara, voz y movimiento. `ImageLevel` acepta `grid: 'caras'` para
  pasar a dos columnas y recorte cuadrado (los captchas de rostros).
  `DistortedLevel` acepta dos vías: `img` (una
  imagen hecha a mano) o `word` (la palabra como dato — la dibuja el componente
  con letras torcidas, ondas y moteado). Con `word` **corrige**: sólo avanza si
  lo escrito coincide (ignorando mayúsculas, tildes y espacios), y si no,
  muestra el error y deja reintentar. `answers: [...]` declara más de una
  lectura válida (`sequ1a` acepta también `sequia`). A los **tres** intentos
  fallidos el sistema se rinde: declara un error no verificable y avanza igual
  —ningún nivel bloquea, ni siquiera el que corrige. Los de `img` no corrigen —
  la palabra vive dentro del JPG — y aceptan cualquier cosa no vacía. Con `word`, los **dígitos** salen en el
  violeta de la máquina y las letras en la paleta institucional: por eso
  `sequ1a` se lee como intervenida. `TextLevel` (pregunta abierta con input) no
  trae textos propios: el nivel le pasa `logo`, `question`, `subtitle` y
  `emptyHint`, para que la mecánica sirva a cualquier sección. Su input va
  **sin placeholder** y ningún nivel de pregunta abierta lo declara: sugerir qué
  escribir sería darle una pista al visitante. (`placeholder` sigue existiendo
  como prop porque los captchas de texto distorsionado lo usan como instrucción.) El `TosLevel` (términos y condiciones) toma sus textos de
  `src/data/tosText.js` (editables sin tocar el componente). `PrioridadesLevel`
  (depositar derechos en casillas de prescindibilidad) toma **todos** sus
  textos del nivel: `derechos`, `casillas` (van en paralelo, misma cantidad),
  `terminos` (lo que aparece al enviar), más `logo`/`title`/`subtitle`/`zona`/
  `zonaOculta`/`cta`. Un derecho se identifica por su posición en la lista, así
  que editar su texto no toca ningún id. Es un nivel nativo —
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
  avance, dibujo y cálculo de caos. El sorteo cuida la **composición** en dos
  pasos: `sortearLibres` respeta un tope de niveles de la misma mecánica por
  sección (`SECTION_TYPE_CAPS`) y `separarMecanicas` reordena lo sorteado para
  que no caigan dos seguidos que se jueguen igual (`SEPARAR_MECANICAS`),
  mirando también los niveles anclados de los bordes. Las dos cosas son
  preferencias: si el tope impide llenar la sección, se ignora; si no hay con
  qué intercalar, se acomoda lo mejor posible. `drawRecorrido` se exporta para
  poder medir el sorteo sin levantar la app.
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

### El alto de la card

La card tiene `min-height: 45dvh`. No es capricho: las mecánicas de poco
contenido (`checkbox`, `statement`, `text`) ocupaban menos de un tercio de la
pantalla y se veían perdidas en el medio, mientras las otras diez van del 45%
al 80% por su propio contenido. Como es un **mínimo**, sólo actúa sobre esas
tres — las demás no cambian una línea, y un nivel nuevo se acomoda solo sin
agregar excepciones. Cuando sobra alto, `.card > .btn:last-child` con
`margin-top: auto` manda la acción al pie y abre el aire en el medio.

**No estirar la card más que eso.** El vacío alrededor no es espacio
desaprovechado: es el lienzo donde se revela la capa-máquina (ADR 0003), que
es `position: fixed; inset: 0` detrás de la card. En la sección 1 se ve vacío
porque la máquina está al 0.015 de opacidad —a propósito—, pero de la sección
2 en adelante ese mismo vacío está lleno. Una card a pantalla completa deja a
la máquina sin dónde aparecer y vacía el ADR 0003.

Detrás de la fachada se revela la **máquina** (ver CONTEXT.md, ADR 0003):
`MachineLayer.jsx` monta una capa de fondo con una imagen de sustrato de
`public/maquina/` (boot → terminal → datamosh según la banda de caos). Se
revela por **opacidad** (`--machine-opacity` por `.chaos-N` en base.css), con
glitch en caos alto y temblor de pantalla (`screen-shake` sobre `#root`) sólo
en caos 9. Para volver al enfoque de grietas descartado, ver ADR 0003 — se
cambia sólo el CSS de `.machine-layer` y el componente.

## Panel de montaje (`app/src/montaje/`)

El **montaje** (ver CONTEXT.md) es cómo queda armada la obra para una función:
qué niveles entran en cada sección, si se sortean o van fijos, y cuáles abren y
cierran. Viaja entero en la URL y no se guarda en ningún lado — convive con
*empezar de cero*. `montaje.js` es la lógica (la lee el store); el **panel de
montaje** (`PantallaMontaje.jsx`, en `?montaje`) es la pantalla donde se arma.

No es parte de la obra —el visitante no llega nunca ahí— pero sí del
dispositivo: **viaja a la sala y no se borra**, porque es con esto que se monta
la función, de pie y desde un teléfono, antes de abrir. Para sacarlo alguna vez:
borrar la carpeta y los dos enganches marcados con `montaje` (uno en `main.jsx`,
otro en `useRecorridoStore.js`).

- **La obra y el panel no comparten una sola regla de CSS.** `main.jsx` importa
  `base.css` o `montaje.css` de forma dinámica, nunca los dos: el panel heredaba
  el `body` flex-centrado y el `100dvh` de la obra, que le recortaban el
  encabezado y le rompían el ancho. Por eso `montaje.css` trae su propio reset.
- Se opera con el pulgar: blancos táctiles de 44px, e inputs de **16px como
  mínimo** — con menos, Safari en iOS hace zoom al enfocarlos y el
  `user-scalable=no` del `index.html` ya no lo evita.
- **Sin `@media`**, como la obra: mobile-first y un solo comportamiento. En
  pantallas grandes sólo actúa el `max-width`.
- **Nada de `title=` para explicar un control**: el tooltip nativo sólo aparece
  al pasar el mouse por encima, y en un teléfono no hay hover — la explicación
  quedaría invisible justo donde se usa el panel. Lo que necesite explicarse
  lleva un botón `?` (`.mtj-ayuda`) que abre una nota al tocarlo.
- Las tres secciones son plegables y arrancan cerradas, así las tres cabeceras
  entran juntas en una pantalla. El pliegue no viaja en la URL: la URL lleva el
  montaje, abrir una sección es estado de mirada.
- El panel **no usa el azul institucional**: tiene neutros propios en
  `montaje.css` para que en penumbra se distinga de la obra de un vistazo.

## Impresión del final (ADR 0005)

El final se imprime como **ticket térmico** en una Aclas PP7 (ESC/POS), y lo
hace **`peaje-core`**: un servidor Python (FastAPI) que vive en otro repo y
corre en la Raspberry Pi de sala. Este repo ya no tiene estación de impresión
propia — `print-station` (Node + `lp`) y Supabase se eliminaron.

`app/src/lib/printClient.js` manda el PNG del dibujo por `POST` a
`{VITE_PEAJE_CORE_URL}/printer/drawing`. Sin esa variable la obra funciona
completa: el final no imprime y no promete un ticket que no va a salir.

**La app se sigue sirviendo por HTTPS desde GitHub Pages, y eso no es
negociable**: cámara, micrófono y acelerómetro sólo existen en contexto seguro,
así que servirla por `http://` desde la Raspberry apagaría las tres mecánicas de
la sección 3 (y `CameraLevel` rompería). Por eso `peaje-core` se expone por un
túnel HTTPS en lugar de servir la app. El razonamiento completo está en el ADR
0005 — antes de proponer "que la Pi sirva la app", leerlo.

`VITE_PEAJE_CORE_URL` **se hornea en build**: cambiar la URL del túnel exige
reconstruir. En el sitio publicado se toma de una variable del repositorio (ver
`.github/workflows/deploy.yml`).

El túnel se hace con **Tailscale Funnel**: da un hostname fijo con certificado
real y no interpone ninguna pantalla. ngrok y localtunnel sí interponen una que
rompe el envío del dibujo, y la URL gratuita de cloudflared cambia en cada
arranque y no la resuelven todos los DNS. El detalle y las tres pruebas, en el
ADR 0005. Se levanta con `tailscale funnel --bg 8000` en la Raspberry y se baja
con `tailscale funnel --https=443 off`.

### El contrato con la estación

Los dos repos no comparten código ni submódulo: la unión es **un solo llamado
HTTP**, y por eso está escrito de los dos lados. Lo que la obra depende de que
`peaje-core` mantenga:

| | |
|---|---|
| Método y ruta | `POST {VITE_PEAJE_CORE_URL}/printer/drawing` |
| Cuerpo | `multipart/form-data` |
| Campos | **`drawing`** (el PNG), **`header`** y **`footer`** (texto, ≤500 caracteres) |
| Contenido | fondo opaco; ni el dibujo ni los textos llevan datos del visitante |
| Éxito | `2xx` — y sólo entonces el final anuncia el ticket |
| CORS | tiene que permitir el origen del sitio publicado |

Si cambia cualquiera de esas filas, **la obra deja de imprimir sin avisar**: el
final no promete nada, así que el fallo es invisible. Antes de una función,
probar el recorrido entero hasta el ticket — no alcanza con que la app cargue.

Los textos del ticket son de la obra, no de la estación: viven en
`src/data/ticketText.js` como el resto de la voz de la máquina, y viajan en el
mismo envío. `peaje-core` imprime lo que le dan — no sabe qué dice el ticket.

Al ticket va **el dibujo y la voz de la máquina, nada del visitante** — ver la
regla de abajo.

## Lo que NO hacer

- No persistir el recorrido (ni localStorage ni nada): recargar = empezar de
  cero. Es una decisión de obra, no un bug.
- No hacer que un nivel bloquee: completar la interacción siempre avanza.
  Los errores del sistema son declarativos (ver CONTEXT.md → Error no verificable).
- No agregar sistemas de temas/estéticas: la única estética es la
  institucional degradándose por caos.
- No mandar datos del visitante a la impresora: al ticket va solo el dibujo,
  anónimo. Un ticket invita a ponerle número de expediente y código de trámite
  —sería muy coherente con la ficción— pero eso es mandar sus respuestas a la
  sala. No se hace (ver ADR 0005).
- No portar la fila/presencia multiusuario de v1: no existe en v2.
- No usar librerías de componentes UI.
