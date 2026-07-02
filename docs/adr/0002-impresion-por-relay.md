# 0002 — Impresión del dibujo vía relay

## Estado

Aceptada — 2026-07-01.

## Contexto

Al alcanzar el final, el dibujo que el visitante hizo en su teléfono debe
imprimirse en una impresora conectada por USB a una computadora en la sala.

Un navegador móvil no puede imprimir silenciosamente: `window.print()` abre
el diálogo del sistema (rompe la ficción, exige interacción y mismo WiFi) y
una impresora USB de otra máquina ni siquiera es visible para el teléfono.
Como el dibujo nace en el teléfono y se materializa en la sala, tiene que
viajar por red de un modo u otro.

Alternativas consideradas:

1. **Kiosco**: la obra corre en la compu de sala e imprime local. Simple,
   pero la obra deja de vivir en el dispositivo del visitante.
2. **Impresión manual**: una persona imprime al ver el aviso. Sin código,
   pero depende de un operador y pierde el efecto de autonomía del sistema.
3. **Relay**: el teléfono publica el final (con el dibujo) en un canal; un
   proceso en la compu de sala —la estación de impresión— escucha e imprime
   automáticamente (ej: comando `lp` en macOS, sin diálogo).

## Decisión

Relay. El teléfono sube el dibujo y publica el evento; la estación de
impresión en la sala lo recibe e imprime por USB sin intervención humana.
El canal de transporte natural es Supabase (Realtime + Storage para la
imagen, que puede exceder el límite de payload del broadcast), stack ya
conocido de v1 — la elección fina del transporte se valida en implementación.

## Consecuencias

- La impresora "actúa sola" cuando alguien termina: máxima teatralidad.
- Funciona con el teléfono en datos móviles; no requiere WiFi compartido.
- La instalación gana una pieza de infraestructura: la estación de impresión
  debe estar corriendo en la sala. Si se cae, los finales no se imprimen —
  hace falta decidir qué ve el visitante en ese caso.
- El dibujo del visitante sale del dispositivo hacia un servicio externo:
  mantener la regla de v1 de no enviar datos personales (el dibujo es
  anónimo, sin identificadores).
