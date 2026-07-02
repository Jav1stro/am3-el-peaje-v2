# 0001 — Recorrido lineal con final real

## Estado

Aceptada — 2026-07-01. Supersede (en esta iteración de la obra) la decisión
"Loop infinito" del ADR 0001 de El Peaje v1.

## Contexto

El Peaje v1 se construyó sobre el loop infinito: sin inicio, sin final, sin
estado de éxito posible. El captcha como trámite que nunca termina. Esa
decisión está documentada y defendida en `am3-el-peaje/docs/adr/0001`.

Para v2 la obra crece: tres secciones temáticas (captchas tradicionales,
captchas de cuerpo, juegos de p5) con una curva dramática entre secciones.
Un loop sin final no puede sostener esa progresión — no hay forma de
"llegar" a la sección de juegos si nada avanza de verdad.

## Decisión

El recorrido de v2 es lineal y tiene final real. Las secciones van en orden
fijo; dentro de cada sección los niveles se sortean de un pool asociado, con
cantidad configurable por sección. El visitante que completa todos los
niveles alcanza el final.

## Consecuencias

- Se gana dramaturgia: la escalada entre secciones es autoral y controlable.
- Se pierde la tesis más dura de v1 ("el trámite no termina nunca"). El
  discurso crítico de v2 tiene que vivir dentro de los niveles y del tono,
  no en la estructura del flujo.
- El progreso pasa a ser real, no una promesa falsa — invierte el sentido
  del término "Progreso" del glosario de v1.
- Los ADRs de v1 no aplican a este proyecto salvo que se adopten
  explícitamente.
