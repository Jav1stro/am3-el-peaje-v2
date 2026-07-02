# 0003 — La máquina detrás de la fachada

## Estado

Aceptada — 2026-07-02.

## Contexto

El caos de v2 (ver CONTEXT.md → Caos) empezó como una degradación puramente
CSS de la card institucional: bordes, rotaciones, glitch de texto, ruido. Era
autorreferencial — la interfaz se rompía sola, sin mostrar nada "debajo".

Se sumaron cuatro imágenes que forman un lenguaje visual coherente (arranque
de sistema BIOS/DOS, terminal descifrando, ventanas de OS glitcheadas,
datamosh RGB puro): la estética de una máquina real corrompiéndose. La
decisión fue usarlas como **la máquina** que asoma detrás de la fachada: el
teatro de la verificación se cae y aparece el sustrato extractivo. La imagen
de sustrato escala con el caos (boot → terminal → datamosh).

Quedaba definir *cómo* se revela la máquina. Se consideraron:

1. **Grietas que crecen** — la fachada se resquebraja y por fisuras (clip-path)
   que crecen con el caos se ve la máquina. Literal y vistoso.
2. **Opacidad creciente** — la máquina vive como capa de fondo que se funde:
   invisible en caos bajo, casi opaca en caos alto, glitcheando hacia el final.
3. **Card flotando sobre el caos** — la máquina aparece de golpe a pantalla
   completa por sección.

Se implementó y probó la opción de grietas primero.

## Decisión

Revelación por **opacidad**. La capa-máquina se funde gradualmente según el
nivel de caos; en caos alto además glitchea (parpadeo + desplazamiento RGB) y,
sólo al final (caos 9), la pantalla entera tiembla. Las grietas se probaron
en vivo y se descartaron por preferencia estética: el fundido se sintió más
como "la verdad aflorando" y menos como un efecto gráfico.

La card institucional permanece siempre por encima (legible) hasta el final,
donde la máquina prácticamente la tapa.

## Consecuencias

- La curva de caos ahora tiene un contenido semántico, no sólo deformación:
  se revela algo concreto (la máquina) en vez de romperse en abstracto.
- Refuerza la tesis de la obra: bajo el trámite amable hay una máquina de
  extracción.
- Volver a las grietas es barato si se cambia de opinión: sólo se reemplaza el
  bloque de CSS de `.machine-layer` y su componente (el mecanismo de niveles
  de caos y las imágenes no cambian).
- El temblor de pantalla al final puede marear en sala; es acotado a caos 9 y
  ajustable/quitable en un solo lugar.
