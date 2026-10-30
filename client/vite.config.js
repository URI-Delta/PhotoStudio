import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The cloud preview hostname is allowed via env so tracked config stays generic.
const additionalHosts = process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS;
const allowedHosts = additionalHosts ? additionalHosts.split(',') : undefined;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    ...(allowedHosts ? { allowedHosts } : {}),
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
