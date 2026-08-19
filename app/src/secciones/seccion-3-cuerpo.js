// Sección 3 — El cuerpo en juego
// Cámara, micrófono, movimiento y juegos de p5. Verifica el cuerpo.
// El nivel de dibujo cierra siempre la sección (anchor: 'last').

export default [
  { id: 'camara', type: 'camera' },
  {
    // Lo último que hace el visitante es dibujar el vaso que la obra le
    // prometió y nunca le dio (ver los T&C y CONTEXT.md → El agua). Ese dibujo
    // es lo que sale por la impresora: se va con el agua en papel.
    id: 'dibujo',
    type: 'drawing',
    anchor: 'last',
    title: 'Dibujá el vaso de agua.',
  },
];
