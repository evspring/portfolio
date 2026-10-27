import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Fully static output, hosted on Cloudflare Pages.
export default defineConfig({
  site: 'https://example.com', // TODO: replace with Evan's domain
  vite: { plugins: [tailwindcss()] },
});
