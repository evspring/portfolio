# Build log

Every message, word for word, and what changed. Kept for a "how I built this" page later.

## 26 Oct 2026, evening

**#1, Evan**
> I want to create a portfolio website using a similar method to this site: https://adamperlis.com/how-i-built-this/ what do we need to do first?

Read Adam Perlis's write-up. First steps: write the one line, gather references, set up a boring static stack, start this log, build the system before the screens, pick one signature thing.

**#2, Evan**
> My one line: The goal is to showcase my ability as a product designer and how I can help them build apps and products.
>
> Some references: https://x.com/insporadesign/status/2109630810634547339 https://x.com/basit_designs/status/2110016199543410741 https://www.niklaspeterson.com/
>
> Projects: Sequence (my iF design award project), Husky Liners (a website redesign I did at RealTruck), Mindra (a note taking app for therapists), RealTruck Connect (an in-progress expansion of my work on Sequence, combining other apps and features into one space)

What changed:
- Scaffolded Astro 7 + Tailwind 4, static, set up for Cloudflare Pages (`npm run deploy`).
- Studied niklaspeterson.com for structure. X blocked automated access to both reels, so their read is from Adam Perlis's description (the same two reels he used): open white space, small type, weighted motion. To do: study the videos frame by frame.
- Wrote DESIGN-BRIEF.md (tokens, layout, signature thing) and CLAUDE.md (rules).
- Signature thing: a six-segment light strip echoing Velocity 360's six sections in Sequence. Plays chase, breathe and wave; tap to change. The site's only colour.
- Home page: headline, intro, light strip, four case studies on gray mats, about, email.
- Case study pages from Markdown in `src/content/work/`, with draft copy for Sequence and placeholders for the rest.
- Bugs caught on screenshot: light strip nearly invisible (unlit segments were faint colour on white; now gray "unlit" sections with light layered on top); five of six light colours stripped by Tailwind's unused-token removal (fixed with `@theme static`); mat corners not applied (Tailwind 4 syntax); lone last card left a hole in the grid (now spans full width).
