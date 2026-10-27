# Evan's portfolio

Static site built with Astro 7 and Tailwind CSS 4, hosted on Cloudflare Pages.

```sh
npm install
npm run dev      # local site at http://localhost:4321
npm run build    # static output in dist/
npm run deploy   # build and push to Cloudflare Pages (needs `npx wrangler login` once)
```

- Design decisions: [DESIGN-BRIEF.md](DESIGN-BRIEF.md)
- Rules for Claude: [CLAUDE.md](CLAUDE.md)
- Everything that happened: [BUILD-LOG.md](BUILD-LOG.md)
- Case studies: `src/content/work/*.md`
- Tokens (colour, type, spacing): `src/styles/global.css`
- The light strip: `src/components/LightStrip.astro`
