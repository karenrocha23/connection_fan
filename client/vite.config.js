import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Encaminha /api para o servidor Node, evitando problemas de CORS em desenvolvimento
    proxy: { '/api': 'http://localhost:3001' },
  },
});
