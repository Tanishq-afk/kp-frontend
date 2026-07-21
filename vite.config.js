import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Absolute imports written as `src/...` (mirrors jsconfig baseUrl).
  resolve: {
    alias: { src: fileURLToPath(new URL('./src', import.meta.url)) },
    // Single copy of React, emotion, and the MUI styling engine so the dev
    // pre-bundler and the build resolve the same modules (fixes
    // "styled_default is not a function"). Works because @mui/system and
    // @mui/styled-engine are direct deps, so a top-level copy exists.
    dedupe: [
      'react',
      'react-dom',
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      '@mui/system',
      '@mui/styled-engine',
    ],
  },
  // Pre-bundle these together so esbuild resolves @emotion/styled's default
  // export correctly in dev (prevents "styled_default is not a function").
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled', '@mui/material', '@mui/material/styles', '@mui/system'],
  },
  server: {
    port: 5173,
    host: true,
  },
});
