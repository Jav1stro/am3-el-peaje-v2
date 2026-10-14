// Plantillas del nivel de dibujo: lo que el lienzo trae dibujado antes de que
// el visitante toque nada. Un nivel la pide con `plantilla: '<nombre>'`.
//
// Se dibujan con código y no con una imagen: van al ticket, y la impresora
// térmica sólo imprime negro puro — una línea vectorial negra sobre blanco sale
// nítida a cualquier tamaño, un JPG escalado sale con bordes grises que la
// impresora tramaría. Por lo mismo, todo en un solo color y sin rellenos.
//
// Cada plantilla recibe el contexto (ya escalado al devicePixelRatio) y el lado
// del lienzo en píxeles CSS. Las medidas van en proporción al lado, para que el
// dibujo sea el mismo en cualquier teléfono.

const TINTA = '#202124';

export const PLANTILLAS = {
  // El vaso de la obra (CONTEXT.md → El agua): vacío, esperando que el visitante
  // marque hasta dónde lo querría lleno. Un vaso de vidrio común, más ancho
  // arriba que abajo, visto apenas desde arriba para que se lea la boca.
  vaso(ctx, lado) {
    const cx = lado / 2;
    const arriba = lado * 0.12;
    const abajo = lado * 0.88;
    const anchoBoca = lado * 0.25; // medio ancho
    const anchoBase = lado * 0.175;
    const elipseBoca = lado * 0.035;
    const elipseBase = lado * 0.025;
    const espesorBase = lado * 0.045; // el vidrio grueso del fondo

    ctx.save();
    ctx.strokeStyle = TINTA;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Boca: la elipse entera, porque se ve desde arriba.
    ctx.beginPath();
    ctx.ellipse(cx, arriba, anchoBoca, elipseBoca, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Paredes.
    ctx.beginPath();
    ctx.moveTo(cx - anchoBoca, arriba);
    ctx.lineTo(cx - anchoBase, abajo);
    ctx.moveTo(cx + anchoBoca, arriba);
    ctx.lineTo(cx + anchoBase, abajo);
    ctx.stroke();

    // Base: sólo la mitad de adelante de la elipse (la de atrás no se ve).
    ctx.beginPath();
    ctx.ellipse(cx, abajo, anchoBase, elipseBase, 0, 0, Math.PI);
    ctx.stroke();

    // El fondo grueso del vidrio, más fino: es lo que hace que se lea "vaso" y
    // no "trapecio".
    const yFondo = abajo - espesorBase;
    const t = (yFondo - arriba) / (abajo - arriba);
    const anchoFondo = anchoBoca + (anchoBase - anchoBoca) * t;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, yFondo, anchoFondo, elipseBase, 0, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  },
};
