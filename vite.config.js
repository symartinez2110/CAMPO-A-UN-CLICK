import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' //Importar el modulo 'Path' para ubicarnos en el src con @


// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), //2. Configuracion el alias
    }
  }
})
