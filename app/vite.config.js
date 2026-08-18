import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En GitHub Pages el sitio vive en /am3-el-peaje-v2/, pero en `npm run dev`
// sigue viviendo en la raíz: por eso la base sólo se aplica al construir.
// Si algún día se publica en un dominio propio, esto vuelve a ser '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/am3-el-peaje-v2/' : '/',
  plugins: [react()],
}));
