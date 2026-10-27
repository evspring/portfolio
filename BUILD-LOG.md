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

**#3, Evan**
> Evan Springer is good for the header. For an email you can use evan.a.springer@gmail.com. For the naming of the projects, Sequence is the original iF entry project and RealTruck Connect is a broader project built later.
>
> Are you able to see this video example for reference? https://www.inspora.design/posts/experimental-visual-cards

What changed:
- Contact email set across the header, footer and about section.
- Confirmed naming: Sequence is the iF entry; RealTruck Connect is the broader project built later. Case studies already tell it that way.
- Inspora post: page text readable (Basit's "experimental visual cards": vibrant gradients, liquid glass shaders, animated dashboard metrics), but the video file itself can't be downloaded from here. Waiting on Evan to attach the .mp4.

**#4, Evan**
> Disregard the link I sent, I was just curious if you could view it. I've linked the video files from the original reference posts from Basit that Adam used.

What changed:
- Studied both reels frame by frame: contact sheets at 2fps, full-res frames, sampled colours, tracked the carousel's speed at 20fps across each whole reel. Findings written into DESIGN-BRIEF.md under "What the reels do".
- Colours now sampled from the reels: warm gray mat `#ECECE7`, cards `#FDFDFD`, ink `#262626`, warm secondary `#666261`, chips `#E6E4E0`, oxblood button `#2D0F12`.
- Project mats now hold whole white phone cards with notch pills (placeholders until real screens), three on wide mats, two on paired ones.
- Added one primary button, "Email me", in the reels' oxblood.
- Status and award shown as pill chips, like the reels' tags.
- Light strip chase rebuilt on the measured motion: a kick every 3.6s (fast attack, long settle) with a slow creep that never stops. Checked the curve numerically against the reel (peak-to-creep ~9:1 vs the reel's ~8:1).
- Bugs caught on screenshot: "Email me" label invisible (base link colour outside Tailwind's layers beat `text-white`; moved base styles into `@layer base`); phone cards bled off the bottom of the mat (now whole and centred, as in the reels).

## 27 Oct 2026

**#5, Evan**
> Can we make the home page more like this with different pages of the site being able to be clicked on throughout the tree? Keep it super minimal outside of the tree itself

(Reference attached: Finn Taylor, "Literal file tree".)

What changed:
- Studied the video: contact sheet at 2fps, full-res crops of the bark and moss, colours sampled, branch growth and camera pan tracked at 25fps. Written up in DESIGN-BRIEF.md under "The tree".
- Home page is now only the tree: name top left, current path at the top, item count at the bottom.
- The site as a file tree (`src/data/tree.ts`): `work/` → `realtruck/` (sequence, realtruck-connect, husky-liners) and `mindra.md`; `about.md`; `contact.txt` opens email.
- Branches drawn pixel by pixel on a canvas: bark core, moss clumps, twigs, red specks. Growth, moss lag, pan, thinning and retraction timed to the reference.
- First visit: trunk grows, then `work/` opens once by itself. Every page links back to its folder (`/#/work/realtruck`).
- New About page. Light strip moved to the Sequence case study.
- Phones: tree grows up from the bottom; folders sit at branch tips so growth heads outward.
- Accessible: real buttons and links, Tab order follows the tree, Escape closes, reduced motion respected, plain list without JavaScript.
- Bugs caught on screenshot: moss too sparse and limbs too straight next to the reference (denser clumps, thicker bark, a wave along each limb); labels sitting on branches (each label now checks for branches and other labels before picking a side); phone tree crossing itself (portrait layout); hidden fallback list reachable by Tab (now only shown without JavaScript); header after the tree in Tab order; changing the folder in the address bar didn't update the tree.

**#6, Evan**
> To start the interaction, have a planted pot where the user has to click on it the start the tree growth and access files

What changed:
- Home page opens on a pixel-art pot, drawn in the same pixel grid as the tree: stone greys, dark soil with moss specks, a small sprout. "Click the pot" (or "Tap the pot" on touch screens) sits where the item count goes.
- Hovering the pot makes the sprout perk up; clicking gives the pot a small hop and the trunk grows out of the soil, straight up and then leaning right, while the view pans to fit it.
- Dropped the automatic opening of `work/`: the visitor now starts the growth themselves.
- Trunk now holds files first and `work/` at its tip on every screen size, so each new branch grows outward from the one before.
- Once grown, the pot takes you back to the top of the tree. Pages link back with `/#/…`, which skips the pot.
- Pot pixels are 4px on big screens (3px on phones) so it holds the empty page.
