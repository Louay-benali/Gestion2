import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Désactiver l'avertissement concernant la transformation JSX obsolète
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  // Configuration pour ignorer certains avertissements spécifiques
  resolve: {
    alias: {
      // Alias pour les dépendances problématiques si nécessaire
    }
  },
  // Optimisations pour les dépendances problématiques
  optimizeDeps: {
    include: ['react-big-calendar']
  }
})
