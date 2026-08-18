import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/base.css';
import PantallaMontaje from './montaje/PantallaMontaje'; // montaje: borrar con la carpeta

// montaje: el panel de desarrollo vive en ?montaje y no lo ve nadie que entre
// por el QR. Borrar estas dos líneas junto con src/montaje/.
const enMontaje = new URLSearchParams(window.location.search).has('montaje');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{enMontaje ? <PantallaMontaje /> : <App />}</React.StrictMode>
);
