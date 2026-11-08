import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/DS2-ATV1-FRONT/' : '/',
  plugins: [react()],
}));
