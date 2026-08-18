# 0004 — El expediente: la máquina cita, pero no guarda

## Estado

Aceptada — 2026-08-14.

## Contexto

La sección 2 incorpora una secuencia de niveles donde el sistema retoma lo que
el visitante ya contestó: pregunta cuándo fue la última vez que tomó agua y,
varios niveles después, le devuelve su propia respuesta —*"no tomás agua desde
hace más de tres horas"*—. En los últimos pasos la máquina además declara que
lo respondido pasó a ser material de entrenamiento.

Eso choca de frente con una regla escrita del proyecto: *"No persistir el
recorrido (ni localStorage ni nada): recargar = empezar de cero"* (CLAUDE.md),
respaldada por la entrada **Empezar de cero** del glosario. Hasta ahora el
único dato del visitante que el store guardaba era el dibujo, y sólo el tiempo
necesario para imprimirlo.

Pesa además algo que no es técnico: la obra le pide **un secreto** a un
desconocido en una sala, y le pregunta por su deseo, su ternura y sus miedos.
Cualquier decisión de guardar eso deja de ser una cuestión de arquitectura.

Alternativas consideradas:

1. **Guardar de verdad** (localStorage o Supabase): la amenaza del último paso
   se vuelve literal. Rompe la regla de no persistir, y deja secretos de
   visitantes almacenados en algún lado — con todo lo que eso implica si
   alguien los reclama, si el equipo de sala queda expuesto, o si la obra se
   muestra en un contexto donde eso deba declararse. Es exactamente el
   consentimiento informado que la propia obra pone en discusión (Núremberg,
   1947), y sería incoherente atropellarlo para hablar de él.
2. **No recordar nada**: los niveles de reiteración usan fórmulas genéricas
   ("hace horas que no tomás agua"). No hay nada nuevo que construir, pero se
   pierde el efecto entero: lo que estremece no es el dato, es que sea *tuyo*.
3. **Recordar sólo durante la visita**: las respuestas viven en memoria
   mientras el recorrido está abierto y mueren al recargar, igual que el resto
   del estado. La máquina *declara* archivarlas; no las archiva.

## Decisión

La tercera. El **expediente** vive en el store, en memoria, y desaparece con la
visita: no se persiste, no se serializa, no sale del teléfono. Lo que se guarda
es lo mínimo para que un nivel pueda citar a otro.

La vigilancia queda como actuación, igual que el **teatro de verificación**:
el sistema simula evaluar sin evaluar, y ahora también simula archivar sin
archivar. Que la máquina mienta sobre lo que hace con tus datos no es un atajo
de implementación — es lo que la obra dice sobre las máquinas que sí lo hacen.

## Consecuencias

- Recargar sigue borrando todo: **Empezar de cero** se mantiene intacto, y la
  regla de no persistir no se rompe.
- Un nivel puede declarar que necesita a otro (`needs`). Si el sorteo lo elige,
  arrastra a su prerrequisito hacia atrás en el recorrido: nunca aparece una
  cita sin la respuesta que la alimenta.
- Los textos de los niveles pasan a admitir interpolación (`{{agua}}`), así que
  escribir contenido nuevo implica saber qué claves existen en el expediente.
- La obra afirma cosas falsas sobre sí misma ("aportaste a la base de datos de
  entrenamiento"). Si alguna vez hay que responder por eso —una muestra, una
  institución, un visitante que pregunta— la respuesta es este documento: no se
  guarda nada, y se puede auditar en el store.
- Si en el futuro se quisiera persistir de verdad, no alcanza con cambiar el
  store: habría que resolver antes el consentimiento, que es justamente el tema
  del que la sección 2 se burla.
