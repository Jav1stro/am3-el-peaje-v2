# El Peaje v2 — Estado actual

_Última actualización: 2026-07-02_

Instantánea del proyecto para quien llega nuevo (o para retomarlo más adelante).
Para el detalle conceptual ver [`CONTEXT.md`](./CONTEXT.md) (glosario de dominio),
las decisiones en [`docs/adr/`](./docs/adr/) y la guía técnica en
[`CLAUDE.md`](./CLAUDE.md).

---

## Qué es

Segunda iteración de la obra **El Peaje**: una web mobile-first (se entra por un
QR en sala) que simula un sistema burocrático de verificación de identidad. El
captcha como metáfora del sometimiento digital.

A diferencia de v1 (un loop de captchas sin final), v2 es un **recorrido** lineal
por tres **secciones** de intimidad creciente, con **final real**. Al terminar,
el dibujo que hizo el visitante en el último nivel se imprime en una impresora
en la sala.

La estética arranca institucional y limpia (tipo reCAPTCHA/Google) y se va
degradando: a medida que sube el "caos", detrás de la fachada se revela la
**máquina** (terminal / boot / datamosh en violeta) hasta dominar la pantalla.

---

## Stack

- **React + Vite**, JavaScript.
- **CSS puro** (sin Tailwind ni librerías de componentes).
- **Zustand** para estado global.
- **Supabase** (Realtime + Storage) sólo para la impresión del dibujo — opcional:
  sin credenciales la obra funciona completa salvo la impresión.
- **p5.js** disponible para sketches en iframe (hoy no hay ninguno en uso).

---

## Estructura

```
am3-el-peaje-v2/
├── CONTEXT.md              # Glosario de dominio (fuente de verdad conceptual)
├── CLAUDE.md               # Guía técnica / cómo tocar el código
├── estado_actual.md        # Este archivo
├── docs/adr/               # Decisiones de arquitectura
│   ├── 0001-recorrido-lineal-con-final.md
│   ├── 0002-impresion-por-relay.md
│   └── 0003-maquina-detras-de-la-fachada.md
├── app/                    # La aplicación (React + Vite)
│   ├── public/
│   │   ├── imagenes/       # Assets de los captchas (semáforos, agua, puzzle…)
│   │   ├── maquina/        # Imágenes de la "máquina" (boot/terminal/datamosh)
│   │   └── sketches/lib/   # p5.js + peaje-chaos.js (para futuros sketches)
│   └── src/
│       ├── secciones/      # QUÉ niveles tiene cada sección (pools)
│       ├── tipos-de-nivel/ # CÓMO se juega cada mecánica (un componente c/u)
│       ├── screens/        # LevelRouter (flujo) + FinalScreen
│       ├── components/     # Hud, MachineLayer, NoiseCanvas, ProcessingOverlay
│       ├── data/           # recorridoConfig, verificaciones, tosText
│       ├── store/          # useRecorridoStore (Zustand)
│       ├── lib/            # supabase, printRelay
│       └── styles/base.css # Toda la estética + la degradación por caos
└── print-station/          # Proceso Node que corre en la compu de sala e imprime
```

Distinción clave (ver CONTEXT.md → *Tipo de nivel*): **`secciones/`** dice qué
niveles hay; **`tipos-de-nivel/`** dice cómo se juega cada mecánica. Las
mecánicas se comparten entre secciones, por eso viven aparte.

---

## Cómo funciona el recorrido

1. **Secciones en orden fijo, niveles sorteados.** Cada sección tiene un pool;
   al entrar se sortean N niveles (config en `data/recorridoConfig.js`). Recargar
   la página = empezar de cero (no se persiste; es decisión de obra).
2. **Niveles de transición anclados.** Con `anchor: 'first'` / `'last'` un nivel
   queda fijo en un borde de su sección, fuera del sorteo.
3. **Completar siempre avanza.** Ningún nivel bloquea. Los niveles cuya respuesta
   una máquina no puede evaluar muestran un **error no verificable** (cínico) y
   avanzan igual.
4. **Teatro de verificación entre niveles.** Un overlay "procesando" que no
   evalúa nada. No es aleatorio: la variante sigue el orden del pool según la
   posición del nivel, y adopta el diseño de su sección.
5. **Final + impresión.** Al completar todo, el dibujo del último nivel se sube a
   Supabase y la estación de impresión de la sala lo imprime por USB.

### Configuración actual (`data/recorridoConfig.js`)

| Sección | Nombre | Niveles a mostrar | Rampa de caos |
|---|---|---|---|
| 1 | Verificación mecánica | 5 | 0 → 3 |
| 2 | Extracción de lo íntimo | 4 (hoy se recorta a 3) | 5 → 7 |
| 3 | El cuerpo en juego | 2 | 8 → 9 |

Los saltos de caos grandes ocurren **al cambiar de sección** (se siente, no se
anuncia).

---

## Secciones y niveles

### Sección 1 — Verificación mecánica (pool de 8)
- `checkbox` — "No soy un robot". **Ancla de apertura** (siempre primero).
- `semaforos`, `agua` — selección de imágenes.
- `distorsionado-1`, `distorsionado-2` — transcribir texto distorsionado.
- `pregunta-agua` — opción múltiple (error no verificable).
- `puzzle` — ordenar 9 fragmentos.
- `tos` — Términos y Condiciones que crecen con adendas al scrollear. **Ancla de
  cierre** (transición hacia la sección 2). El párrafo final se resalta con un
  adelanto de la estética violeta.

### Sección 2 — Extracción de lo íntimo (pool de 3)
- `emociones` — opción múltiple (error no verificable).
- `perfil-conductual` — opción múltiple.
- `prioridades` — **drag-and-drop nativo**: arrastrás tus derechos a casillas de
  "prescindibilidad"; al enviar, tus renuncias se convierten en términos de
  extracción de datos. (Antes era un sketch de p5 en iframe; se pasó a nativo
  para que herede la degradación por caos.)

### Sección 3 — El cuerpo en juego (pool de 2)
- `camara` — verificación facial fake con métricas biométricas.
- `dibujo` — el visitante dibuja en su teléfono. **Ancla de cierre**; ese dibujo
  es lo que se imprime en sala.

Recorrido típico: ~10 niveles.

---

## Sistemas transversales

- **Caos (0–9)** — no se declara por nivel; se calcula por posición con rampas
  por sección. Degrada la card (borde, fondo, título, botón, scanlines internas,
  glitch, temblor de pantalla al final) con paleta violeta/magenta/cyan.
  **Sección 1 es casi imperceptible a propósito.** Ver ADR 0003.
- **La máquina** (`components/MachineLayer.jsx`) — capa de fondo que se revela por
  **opacidad** creciente detrás de la fachada. Imagen de sustrato según la
  profundidad: `boot` → `terminal` → `datamosh`.
- **Teatro de verificación** (`data/verificaciones.js` + `ProcessingOverlay`) —
  pools por sección, determinístico, con estilos por sección (limpio / violeta /
  terminal).
- **Impresión** (`lib/printRelay.js` + `print-station/`) — el teléfono publica el
  dibujo en un canal de Supabase; la compu de sala lo escucha e imprime con `lp`.
  Ver ADR 0002.

---

## Cómo correrlo

```bash
cd app
npm install
npm run dev          # desarrollo
npm run dev -- --host  # accesible desde el celular en la misma red
npm run build        # build de producción (genera dist/)
```

Para la impresión (opcional):

```bash
cd print-station && npm install
SUPABASE_URL=... SUPABASE_ANON_KEY=... PRINTER=nombre npm start
```

Requiere en Supabase un bucket público `dibujos`. La app lee
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (ver `app/.env.example`).

---

## Estado / pendientes

**Funciona hoy**
- Recorrido completo de punta a punta con las tres secciones.
- Todos los tipos de nivel implementados (checkbox, imágenes, texto distorsionado,
  opciones, puzzle, TOS, prioridades drag-and-drop, cámara, dibujo).
- Sistema de caos + máquina + teatro de verificación, coherentes entre sí.
- `npm run build` compila sin errores.

**Pendiente / a definir**
- **Acceso desde el celular con sensores.** La cámara y los sensores exigen HTTPS;
  por IP local (`http://`) el navegador los bloquea. Falta resolver HTTPS (túnel
  o deploy a Vercel) para probar cámara en un teléfono real.
- **Impresión en sala.** Falta crear el bucket en Supabase y dejar corriendo la
  estación de impresión en la compu con la impresora.
- **Sección 3 finita** (cámara + dibujo). Si se suman más niveles de "cuerpo",
  subir el conteo en `recorridoConfig.js`.
- **Verificación en dispositivo real.** El trabajo se validó con capturas
  estáticas (Chrome headless) usando el CSS real; las animaciones y el
  drag-and-drop conviene probarlos con el dedo en un teléfono.
- **Sketches de p5.** La infraestructura (iframe + `SketchLevel` + helper de caos
  `peaje-chaos.js`) sigue disponible, pero hoy ningún nivel usa un sketch.

**Descartado**
- Los juegos `volcar-el-vaso` y `agua-juego` (sketches de p5) se sacaron de la
  obra.

---

## Notas de repo

- `app/dist/` es el resultado del build (descartable, se regenera). Conviene
  ignorarlo en git junto con `node_modules/` y `.env.local`.
- Los textos (TOS, verificaciones, errores) son ejemplos editables sin tocar
  componentes: viven en `app/src/data/`.
