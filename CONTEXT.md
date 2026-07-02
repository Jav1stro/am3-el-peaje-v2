# El Peaje v2 — Glosario de dominio

Misma obra que El Peaje (v1), nueva iteración. Comparte el universo conceptual
(el captcha como metáfora del sometimiento digital) pero reemplaza el loop
infinito por un **recorrido** lineal por secciones.

---

## Recorrido

La estructura central de la obra. El visitante avanza de forma lineal a través
de **secciones**, cada una compuesta por **niveles**. Las secciones van siempre
en el mismo orden; los niveles dentro de cada sección se sortean. A diferencia
de v1, el recorrido tiene un final real: el visitante puede completarlo.
_Evitar_: loop, ciclo, flujo infinito

---

## Sección

Un tramo temático del recorrido. Hay tres, ordenadas por **intimidad
creciente** — lo que escala no es la tecnología sino la profundidad de la
invasión:

1. **Verificación mecánica** — captchas tradicionales: checkbox, imágenes,
   texto distorsionado, puzzle. El sistema verifica gestos.
2. **Extracción de lo íntimo** — el sistema pregunta por emociones, hábitos,
   conducta; pide renunciar a derechos. Verifica el interior.
3. **El cuerpo en juego** — cámara, micrófono, movimiento y juegos de p5.
   Verifica el cuerpo. Cierra con el **nivel de dibujo**.

Cada sección tiene un **pool de niveles** asociado y una cantidad configurable
de niveles a presentar. Al entrar a una sección, se sortean esa cantidad de
niveles del pool, en orden aleatorio.

---

## Pool de niveles

El conjunto de niveles asociados a una sección. Un nivel pertenece a una sola
sección. El pool puede ser más grande que la cantidad de niveles que se
presentan: dos visitantes (o dos visitas) pueden ver niveles distintos de la
misma sección.

---

## Nivel

Un paso individual dentro de una sección. Cada nivel presenta una verificación
con temática de captcha que el visitante debe completar para avanzar. Un nivel
puede implementarse como componente propio o como sketch de p5. Completar la
interacción de un nivel siempre hace avanzar: ningún nivel bloquea el
recorrido.
_Evitar_: pantalla, captcha (el captcha es la temática del nivel, no el nivel mismo)

---

## Caos

La degradación visual progresiva de la interfaz a lo largo del recorrido. La
obra arranca con una estética institucional limpia (tipo reCAPTCHA/Google) y
se va deformando nivel a nivel: ruido, glitch, color. Los saltos de caos más
grandes ocurren al cambiar de sección — el cambio de sección se siente, no se
anuncia. Es la única estética de la obra: no hay temas intercambiables como
en v1.

A medida que el caos sube, detrás de la fachada institucional se revela la
**máquina**: el sustrato real del sistema, cada vez más visible y corrupto,
hasta dominar la pantalla al final del recorrido.
_Evitar_: estética (v1: sistema de temas seleccionables), tema, skin

---

## Máquina

Lo que hay detrás de la fachada institucional: la verdad del sistema que el
captcha disimula. Empieza como un arranque de sistema tímido, pasa por una
terminal descifrando, y termina en corrupción total (datamosh). Se revela
gradualmente con el **caos** — el teatro de la verificación se cae y aparece
la máquina extractiva que estuvo ahí todo el tiempo.
_Evitar_: fondo, textura, imagen decorativa

---

## Tipo de nivel

La mecánica de interacción de un nivel: opciones, selección de imágenes,
cámara, dibujo, etc. Un **nivel** pertenece a una sola sección; un tipo de
nivel no pertenece a ninguna — la misma mecánica puede aparecer en varias
secciones (las preguntas de opciones aparecen en la sección 1 y en la 2). Lo
que define a qué sección va un nivel es su contenido, no su mecánica.
_Evitar_: componente, mecánica suelta, "el captcha de opciones" (ambiguo:
nombra al tipo, no al nivel)

---

## Teatro de verificación

El momento entre completar un nivel y pasar al siguiente: el sistema simula
evaluar la respuesta sin evaluar nada. Escala con las secciones — burocrático
y limpio en la 1, invasivo en la 2 (aparenta analizar el interior del
visitante), roto y errático en la 3. Cada sección tiene su pool exclusivo de
verificaciones: al cruzar de sección, las formas de la anterior no vuelven a
aparecer. La variante que le toca a cada nivel no es aleatoria: sigue el orden
del pool según la posición del nivel en la sección, igual que avanza el
recorrido.
_Evitar_: loading, spinner (nombra una pieza visual, no el gesto), evaluación

---

## Error no verificable

El gesto cínico del sistema ante respuestas que una máquina no puede evaluar
(emociones, hábitos, renuncias). El nivel muestra un error del estilo
*"Respuesta no verificable. Continúe."* — y avanza igual. Es declarativo, no
bloquea ni castiga. Solo lo tienen los niveles cuya pregunta es humanamente
inverificable; los demás avanzan sin comentario.
_Evitar_: fallo parametrizado (v1: probabilístico y punitivo — acá no existe),
validación, rechazo

---

## Final

El estado que alcanza el visitante al completar todos los niveles de todas las
secciones. Existe de verdad — supersede el "loop infinito" de v1, donde ningún
estado de éxito era posible. Al alcanzarlo, el dibujo que el visitante hizo en
el **nivel de dibujo** se imprime físicamente en la sala: la obra termina en
papel, fuera del teléfono.

---

## Nivel de transición

Un nivel fijo que queda fuera del sorteo, anclado a un borde de su sección: al
inicio (abre la sección) o al final (la cierra, puente hacia la siguiente).
Cada sección puede tener uno de cada tipo. Hoy: el **checkbox** ("No soy un
robot") abre siempre la sección 1; el nivel de Términos y Condiciones la cierra
(puente hacia la extracción de lo íntimo — se acepta un contrato antes de
entregar el interior); y el **nivel de dibujo** cierra la sección 3 (su
transición no lleva a otra sección sino al **final**).
_Evitar_: nivel fijo, último nivel (ambiguo: el último que se ve, no el anclado)

---

## Nivel de dibujo

El último nivel del recorrido. El visitante dibuja en su teléfono; ese dibujo
es lo que la impresora de la sala materializa al llegar al **final**. Es el
**nivel de transición** de la sección 3.

---

## Estación de impresión

El proceso que corre en la computadora de la sala, escucha los finales
alcanzados y manda el dibujo a la impresora USB automáticamente, sin
intervención humana. Es parte de la instalación, invisible para el visitante.
_Evitar_: servidor, backend

---

## Empezar de cero

El recorrido no se persiste. Recargar la página, cerrar el navegador o volver
más tarde significa arrancar desde el primer nivel de la primera sección. El
trámite no guarda tu lugar.
_Evitar_: sesión, checkpoint, guardado

---
