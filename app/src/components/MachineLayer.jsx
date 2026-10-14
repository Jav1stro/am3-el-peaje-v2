// La "máquina" que asoma detrás de la fachada institucional a medida que sube
// el caos (ver CONTEXT.md → Caos, ADR 0003).
//
// Se revela por opacidad: la clase .chaos-N en <html> maneja --machine-opacity
// (de casi 0 en caos bajo a casi opaco en caos alto). La imagen de sustrato se
// elige por profundidad de colapso; en caos alto la capa además glitchea.

import { createPortal } from 'react-dom';
import { asset } from '../lib/asset';

const SUBSTRATE = {
  boot: asset('/maquina/maquina-boot.jpg'), // sistema arrancando (caos bajo)
  terminal: asset('/maquina/maquina-terminal.jpg'), // descifrando (caos medio)
  datamosh: asset('/maquina/maquina-datamosh.jpg'), // corrupción total (caos alto)
};

function substrateFor(chaos) {
  if (chaos >= 8) return SUBSTRATE.datamosh;
  if (chaos >= 4) return SUBSTRATE.terminal;
  return SUBSTRATE.boot;
}

// Se monta directo en <body>, fuera de #root: en caos 9 #root tiembla con un
// `transform`, y un transform convierte al elemento en el marco de referencia
// de todo `position: fixed` que tenga adentro. Esta capa dejaría de cubrir la
// pantalla y quedaría del tamaño de #root (ver base.css → screen-shake).
export default function MachineLayer({ chaos }) {
  if (chaos <= 0) return null;
  const img = `url(${substrateFor(chaos)})`;

  return createPortal(
    <div className="machine-layer" aria-hidden="true" style={{ '--machine-img': img }} />,
    document.body
  );
}
