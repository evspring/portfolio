# Rules for working on this site

Read DESIGN-BRIEF.md before making design decisions. The one line in it beats any other opinion, including yours.

## Always

- Log every session in BUILD-LOG.md: Evan's messages word for word, what changed and why. Summarize in bulk roughly every 30 minutes of work.
- After a visual change, run the site, screenshot it at desktop (1440px) and phone (390px) widths, and look before saying it's done.
- Use the tokens in `src/styles/global.css`. Never hard-code a colour, font or radius in a component.
- Keep it static: Astro + Tailwind, no client framework. Motion is hand-written CSS/JS.
- Measure before fixing anything that "feels off" (frame times, sizes, timings).
- Evan's references beat anyone's taste, including another model's.
- Big ideas go on a branch so the live site never breaks.
- Run `npm run build` with no errors before committing.

## Never

- Commit secrets, API keys or `.env` files, or print them in output.
- Deploy as a Cloudflare Worker. This is a Cloudflare Pages static site.
- Add new colour. Colour comes from the tree's moss and terracotta pot (home) and the light strip (Sequence) only.
- Add anything to the home page outside the tree beyond the name, path and item count.
- Put screenshots on anything but the gray mat.
- Publish anything marked as under NDA in DESIGN-BRIEF.md.
