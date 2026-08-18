// Ruta a un archivo de public/, relativa a la base del sitio.
//
// En local la app vive en la raíz, pero publicada en GitHub Pages vive en un
// subdirectorio (/am3-el-peaje-v2/). Vite reescribe los imports que procesa,
// pero NO las rutas escritas a mano como '/imagenes/foo.jpg': ésas quedarían
// apuntando al dominio raíz y darían 404. Todo lo que salga de public/ tiene
// que pasar por acá.
export const asset = (ruta) => `${import.meta.env.BASE_URL}${ruta.replace(/^\//, '')}`;
