# 0005 — El final es un ticket térmico emitido por peaje-core

## Estado

Aceptada — 2026-09-09. Supera a [ADR 0002](0002-impresion-por-relay.md).

## Contexto

El ADR 0002 dejó decidido que el final se imprime solo, y dejó explícitamente
abierto el transporte: *"la elección fina del transporte se valida en
implementación"*. La implementación de entonces —`print-station`, un proceso
Node que escuchaba un canal de Supabase e imprimía el PNG con `lp`— nunca se
llegó a probar: no hubo credenciales ni impresora.

Mientras tanto, la parte de infraestructura del proyecto avanzó por otro lado,
en `peaje-core`: un servidor Python (FastAPI) que corre en una Raspberry Pi con
una impresora térmica **Aclas PP7** por USB, hablando ESC/POS con
`python-escpos`. Ahí la impresión sí está probada contra el hardware real.

Eso vuelve la pregunta una de obra antes que de infraestructura: **el visitante
se lleva una hoja o se lleva un ticket.**

## Alternativas consideradas

1. **Hoja por CUPS** (`print-station`): imprime el dibujo tal cual, con grises
   y a buen tamaño. Pero una hoja A4 con un dibujo es un objeto sin carga: no
   se parece a nada que un organismo emita.
2. **Ticket térmico** (`peaje-core`): el dibujo se convierte a un mapa de bits
   de 1 bit y sale en una tira angosta. Se pierde matiz, pero el objeto **es**
   un comprobante — el papel que una máquina escupe cuando terminás un trámite.

Lo que inclinó la balanza: el trazo del vaso es línea sobre blanco, no una
foto. Sobrevive intacto a 1 bit. Se pierde poco y se gana el objeto entero.

## Decisión

**El final se emite como ticket térmico, y lo imprime `peaje-core`.**

- Se elimina `print-station`. Su rol lo cumple `peaje-core`, que además ya
  tiene la impresión probada contra la PP7.
- Se elimina Supabase de la app. Ya no hay relay ni Storage: la app le manda el
  PNG por `POST` directo a `peaje-core`.
- **La app sigue publicada en GitHub Pages**, y `peaje-core` se expone por un
  túnel HTTPS. `VITE_PEAJE_CORE_URL` dice adónde apuntar.

### Por qué la Raspberry no sirve la app

Fue la primera idea —es lo que prevé el `PEAJE.md` de infraestructura para modo
prototípico, y tiene la ventaja de que el `POST` queda en el mismo origen: sin
CORS y sin configurar nada. **Se descartó porque apaga la sección 3.**

La Raspberry en la red local se alcanza por `http://<ip>`, y cámara, micrófono
y acelerómetro exigen **contexto seguro**: fuera de `localhost`, sólo HTTPS.
En una página HTTP `navigator.mediaDevices` ni siquiera existe. No es que el
visitante niegue el permiso —eso la obra ya lo contempla, y avanza con un error
no verificable—: es que el navegador nunca llega a ofrecer el diálogo. Los tres
niveles de cuerpo quedarían sin su mecánica, y `CameraLevel` directamente
rompería (un `TypeError` sincrónico que su `.catch()` no atrapa).

Servir la app por HTTPS desde la propia Raspberry con un certificado
autofirmado resolvería los sensores, pero le pone al visitante una advertencia
de seguridad a pantalla completa antes de entrar — la misma fricción que el
proyecto viene evitando desde que descartó la red WiFi propia.

Como en la sala hay internet, el túnel evita las dos cosas: certificado real,
sin advertencias, y la app se queda donde ya está probada.

## Consecuencias

- El visitante se lleva un comprobante, no una impresión. El objeto final habla
  el mismo idioma que la obra.
- **La sección 3 sigue funcionando exactamente como hoy**: la app no cambia de
  origen ni de forma de servirse.
- El visitante entra por datos móviles o por el WiFi que haya: no se le pide
  cambiar de red. Se mantiene lo ganado en el ADR 0002.
- La instalación depende de que haya internet en la sala y de que el túnel esté
  levantado, además de la Raspberry. Si algo de eso falla, los finales no se
  imprimen.

  El ADR 0002 dejó abierto qué ve el visitante en ese caso; acá se cierra: **el
  final no promete el ticket antes de tenerlo.** Arranca en silencio y sólo
  anuncia "Documento emitido. Retírelo de la impresora." cuando la estación
  confirmó. Sin estación, el visitante nunca se entera de que había un papel —
  se pierde el momento de ver a la máquina emitir, y se gana que la obra nunca
  mande a nadie a esperar frente a una impresora vacía. La confirmación es que
  la impresora aceptó el trabajo: si se quedó sin papel, la frase igual sale.
- `VITE_PEAJE_CORE_URL` se hornea **en build**: cambiar la URL del túnel obliga
  a reconstruir y republicar. Está como variable del repo en el workflow de
  GitHub Pages para poder cambiarla sin tocar código.
- **El túnel es Tailscale Funnel.** Se probaron tres y hay tres condiciones que
  cumplir: que no interponga nada, que la dirección no cambie, y que la resuelva
  cualquier DNS.
  - **ngrok y localtunnel** interponen una pantalla de advertencia. Con un
    `User-Agent` de navegador, localtunnel contesta `511` y una página HTML en
    vez de la respuesta, y ahí muere el `fetch` del dibujo. Se esquiva mandando
    un header propio del proveedor, pero eso mete el nombre de un servicio de
    túnel dentro del código de la obra.
  - **cloudflared** no interpone nada, pero su URL gratuita cambia en cada
    arranque y los subdominios `*.trycloudflare.com` no los resuelven todos los
    DNS (el del ISP donde se probó resuelve el dominio raíz pero no los
    subdominios). Sirve con un dominio propio, que cuesta.
  - **Tailscale Funnel** cumple las tres: hostname fijo, certificado de Let's
    Encrypt a su nombre, sin pantalla intermedia, y gratis. Probado de punta a
    punta: el dibujo sale del navegador, va a internet y vuelve, y se imprime.

  Que el hostname sea fijo importa más de lo que parece: **el QR se imprime
  antes de la función** en vez de generarlo el día.
- Los límites de Funnel: publica sólo en 443/8443/10000 —el servicio local puede
  seguir en el puerto que quiera— y tiene topes de ancho de banda que no
  documentan. Para una sala donde cada visita manda un PNG de cientos de KB,
  sobra.
- **El endpoint queda público.** A los minutos de levantarlo ya entraron sondeos
  automáticos buscando rutas comunes. No hay nada sensible expuesto, pero
  `POST /printer/drawing` imprime: si eso molesta, bajar el Funnel cuando no hay
  función con `tailscale funnel --https=443 off`.
- Aparece una restricción física nueva: el ancho del papel. El dibujo se
  reescala al ancho de la impresora en `peaje-core`, no en la app.
- Sigue en pie la regla de v1: **al ticket va solo el dibujo, anónimo**. Un
  ticket invita a llenarlo de número de expediente y código de trámite; hacerlo
  significaría mandar respuestas del visitante a la impresora, que es
  justamente lo que no se hace.
- Para un montaje en museo sin internet confiable habría que volver sobre esto.
  `peaje-core` está armado por capas para que agregar otra vía de entrada no
  toque la lógica de impresión.
