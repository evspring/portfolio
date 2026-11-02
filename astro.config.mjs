import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Fully static output, served by Cloudflare as static files (see wrangler.jsonc).
export default defineConfig({
  site: 'https://evanspringer.com',
  vite: { plugins: [tailwindcss()] },
});
