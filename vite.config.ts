import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    sourcemap: true, // Enable source maps for build
  },
  resolve: {
    alias: {
      $lib: '/src/lib',   // This will create an alias for the src/lib folder
    },
  },
})
