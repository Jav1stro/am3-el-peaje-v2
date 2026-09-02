import React from 'react';
import ReactDOM from 'react-dom/client';

// montaje: el panel de montaje vive en ?montaje y no lo ve nadie que entre por
// el QR. Los dos imports son dinámicos a propósito: así la obra y el panel no
// comparten una sola regla de CSS. base.css nunca llega al panel (su body
// centrado y su 100dvh le rompían el layout) y montaje.css nunca llega a la
// obra. Para sacar el panel: borrar src/montaje/ y la rama de este ternario.
const enMontaje = new URLSearchParams(window.location.search).has('montaje');

const pantalla = enMontaje
  ? import('./montaje/PantallaMontaje')
  : import('./styles/base.css').then(() => import('./App'));

const root = ReactDOM.createRoot(document.getElementById('root'));

pantalla.then(({ default: Pantalla }) => {
  root.render(
    <React.StrictMode>
      <Pantalla />
    </React.StrictMode>
  );
});
