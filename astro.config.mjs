import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  // Tailwind 4 runs as a Vite plugin now
  vite: {
    plugins: [tailwind()],
  },
  integrations: [react()],
});