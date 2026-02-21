import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
    define: {
      // This ensures process.env.API_KEY is replaced with the actual string during build
      // We check both the loaded env vars (from .env) AND the system process.env (for Vercel/CI)
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
    },
  };
});