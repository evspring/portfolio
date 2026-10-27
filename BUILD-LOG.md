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

**#7, Evan**
> Terracotta is better, when the user clicks on the pot it should look more like a young tree that progresses into a more mature tree the more pages you go through

What changed:
- Pot is terracotta: light, mid and shade clay with a dark brown outline and darker soil.
- The tree now has an age. 8 places to explore (work/, realtruck/, 4 case studies, about, contact); each new one ages it. Kept in this browser only.
- Sapling: thin bare trunk, shorter, a few fresh bright leaves at each tip. Mature: trunk ~4× thicker, flared at the soil, dense older moss, leafy clumps along limbs, twigs, a full crown on every branch tip.
- How: every pixel is generated once at full maturity with the age it needs to appear, so the tree grows smoothly between any two ages. Opening a new folder grows it on the spot; reading a page grows it when you come back (it starts at the age you last saw, then grows).
- Content pages record the visit themselves, so arriving straight on a case study still counts.
- Bugs caught on screenshot: the mature end barely differed from the young one (pushed thickness, flare, foliage and crowns much further); leafy tip crowns never appeared (they were set to show past the end of the branch).

**#8, Evan**
> I want it to look more like a family tree with multiple branches on the same level spread out. The motion should still be similar but with multiple branches.

What changed:
- Rebuilt the tree's structure: one limb per item instead of items strung along a single limb. Every folder is a fork; everything in it fans out from that fork at the same level.
- Folders take the middle and climb to become the next fork; pages spread wide to both sides, leaving flatter and curling upward. Each level opens above the last.
- Motion kept: limbs grow out from the fork (fast, then slowing), moss fills in behind, the view pans to fit the new level, older levels thin out, closing pulls limbs back. Siblings now grow together, the middle one leading and the side ones ~70ms behind.
- Sapling and mature looks carry over: every limb's tip gets a leafy crown when old.
- Labels pick a side that's clear of limbs and other labels; on phones, side labels sit above their icon.
- Bugs caught on screenshot: first pass looked like a pole with short arms (side limbs now ~215px and ~69° from vertical); a phone label ran off the right edge; the item count sat on the trunk (soft white halo on the path and count).

**#9, Evan**
> Lets forget about the aging part and just have it as a full grown tree from the start that grows as you progress through the files

What changed:
- Removed ageing entirely: no sapling stage, no counting places, nothing kept in the browser, and the content pages no longer record visits.
- The tree is drawn full-grown from the first click on the pot: thick flared trunk, dense moss, leafy clumps, twigs, a crown at every tip.
- Growth now comes only from opening folders: each new level grows out of its fork, as before.

**#10, Evan**
> change the artstyle to a watercolor base, use these images from the game Gris as reference

(Three stills from Gris attached.)

What changed:
- Replaced the pixel art with watercolour, borrowing Gris's style only (no characters, scenes or shapes from the game).
- Paper: warm cream with a faint rose glow, a sage glow, faint upright washes like distant trunks, and grain over everything.
- Stems: coral, painted as overlapping translucent outlines (soft edge, denser core); candelabra twigs ending in square buds.
- Folders bloom into big square canopies; pages end in small ones. Canopies are layered washes, light to deep, with pooled blotches, a drying edge and a little bleed.
- Pot repainted in watercolour terracotta; the waiting sprout has painted leaves and stands taller on hover.
- Layout and motion unchanged: family-tree fan, growth, pan, fade-back, retract.
- Bugs caught on screenshot: labels never appeared (reveal code lost in the rewrite); first background was big flat camouflage blobs (now soft glows and faint streaks); canopies looked like glossy app icons (rougher layered edges, blotches, bleed); dark page buds looked like eyes (now small canopies); zero-size nodes counted as invisible; a phone label ran off the edge (page labels sit above their canopy on phones); the name wrapped on 360px screens.

**#11, Evan**
> Great, make the tree and the canopies bigger they look too small currently

What changed:
- Canopies about 1.5× bigger (folders 150px, pages 56px on big screens); trunk and limbs thicker; twigs and their buds bigger; the trunk flares wider at the soil.
- Trunk, folder limbs and side branches all longer; side branches scale with screen width so tablets aren't clipped.
- Pot grows with the tree on big screens (1.3×, 1.1× on shorter screens).
- Checked at eight screen sizes (phones to 1920×1080, plus an upright tablet): every label in the open level stays on screen and the pot clears the item count. Caught on the way: the pot covering the item count on 1280×720, a label clipped on 360px phones and on an upright tablet.

**#12, Evan**
> The canopies of the tree should still be bigger, especially the outer branches. I want to be able to click on the canopy as a button to access the page

What changed:
- Page canopies roughly doubled: 124px on the outer branches, 104px for the centre one (82px / 70px on phones). Folder canopies up to 170px.
- The whole canopy is now the button: clicking anywhere on it opens the page (or the folder). The keyboard focus ring follows the canopy's shape.
- Hovering (or focusing) a canopy swells it slightly and deepens its colour; the label darkens with it.
- Checked at eight screen sizes: no labels off screen, no canopies overlapping each other or another label, the pot clear of the item count. Clicking inside a canopy (not its label) opens the page.

**#13, Evan**
> Make the branches bigger too, as the tree goes higher pull the canopies closer together so it looks more like a tree

What changed:
- Branches about 1.3–1.6× thicker: trunk 36px at the soil (with a wider flare), folder limbs 20px, page limbs 12px.
- The tree tapers as it climbs: each level's side branches get shorter (100%, 80%, 66%) and its fan narrower, so canopies gather into a crown that's wide at the bottom and tighter at the top.
- Branches curl, so a canopy can land nearer the fork than its branch length suggests: each new branch now grows a little longer until its canopy is clear of the fork's canopy and its siblings'. Canopies cluster without overlapping, so each stays its own button.
- Phones: the middle canopy at the top sits higher than its neighbours, and side labels can lean outward above their canopy, so no label runs off a 360px screen.
- Checked at eight screen sizes: no labels off screen, no canopies overlapping, pot clear of the item count, clicking inside a canopy opens its page.

**#14, Evan**
> Make the tree of the desktop version look similar to the tree on the phone version

What changed:
- One design for every screen: the phone tree is the reference, and bigger screens draw the same tree scaled up (by screen height, from 1× up to 1.6×). Same fan angles, same branch-to-canopy proportions, same taper, same labels above the canopies.
- Desktop no longer spreads side branches far out; the tree is compact and tall, with the crown gathering at the top like on the phone.
- Pot scales with the tree. Phone layout is unchanged.
- Checked at eight screen sizes: no labels off screen, no canopies overlapping, pot clear of the item count, clicking a canopy opens its page.

**#15, Evan**
> When a user clicks on a section it should transition to the new page with an expansion of the canopy, similar to this video

(Reference attached: sasha birukoff, "fluid illumination".)

What changed:
- Studied the video: contact sheet at 4fps, shape width/height tracked at 30fps. Each morph ~0.6s, slow-fast-slow, one axis ~0.1s behind the other, centre fixed, soft wobbling edge, deep centre glowing to light edges.
- Clicking a page's canopy now swells it to fill the screen with that motion, in the canopy's own colours, then opens the page; the page arrives as the colour dissolves.
- "Back to the tree" reverses it: the colour gathers, and on the tree it flows back into the canopy you came from.
- Skipped for the email link, for Cmd/Ctrl-clicks (new tab) and for reduced motion. The browser back button restores a clean tree.

**#16, Evan**
> Lets have the pages user the same warm paper background and make that transition smoother

What changed:
- Every page now sits on the tree's warm paper (`#F7F0EA`) with the same rose and sage glows and grain.
- Smoother handoff, three seams removed:
  - The tree's full-screen wash and the page's were drawn differently; both now use the same gradient, sized to the screen, with grain. Measured at five points with the screen fully covered: within a few shades of each other.
  - The page used to paint for a moment before the colour covered it (and the tree flashed on the way back); the wash now goes up in `<head>`, before the first frame.
  - The expansion fades up out of the canopy instead of popping on top of it, and settles crisp at full screen; the arrival dissolve is a little slower (1s), easing like a wash drying.

**#17, Evan**
> Not great, lets instead try making the transition a pan upwards into the new page

What changed:
- Removed the canopy-wash transition.
- New: pages live above the tree. Clicking a canopy tilts the view up: the tree drops away (speeding up), the name and path fade, and the page slides down into place from above (slowing to a stop). Both halves 0.55s, the hand-off at matched speed so it reads as one pan.
- "Back to the tree" reverses it: the page lifts away upward, the tree rises back into view from below.
- One sky for the whole site (`PaperSky.astro`): paper, glows, faint streaks and grain, drawn identically on every page before the first frame and never moving, so only the tree and the page travel.
- Checked: both directions, the hand-off frame (empty paper on both sides), and the browser back button mid-flow.

**#18, Evan**
> Get rid of the stutter and make it so that the initial movement is slower

What changed:
- The stutter was the page load in the middle: the tree's half ended at full speed, the browser stopped to load the next page, then the page's half began. Now the browser runs the whole pan as one cross-document view transition: it loads the new page first, then plays both halves back to back with no pause.
- Gentler start: one continuous ease-in-out over 1.3s (ease-in sine into ease-out sine at matched speed), instead of a sharp ease-in into the gap.
- Only the on-screen slice of a page travels (even when scrolled), so both halves move exactly one screen.
- The tree's name, path and item count fade with the tree instead of popping.
- Caught on the way: the new page appeared all at once at first, because the browser captured it before its content was read in (fixed by holding the first paint until it is); the page's lower half showed early because the whole tall page was moving one screen (fixed by carrying only the visible slice).
- Firefox doesn't support this yet: pages just open there, no stutter.

**#19, Evan**
> lets remove the file extensions on each of the pages and just use the page name instead

What changed:
- Pages on the tree now show their names: Sequence, RealTruck Connect, Husky Liners, Mindra, About, Contact (each has a `label` in `src/data/tree.ts`). Folders still read `work/` and `realtruck/`.
- The no-JavaScript list uses the same names.
- Rechecked at eight screen sizes: no labels off screen or overlapping.

**#20, Evan**
> Lets have contact become its own simple page. For the about page you can use these paragraphs: [Evan's About copy] … For the about section, leave some space for photos that I'll upload later but keep the page minimal where possible.

What changed:
- About page now uses Evan's words: intro, design philosophy, and "My inspirations and interests". Light fixes only: a comma, "an online community", "75,000 people", a double space.
- Photo spaces: a portrait beside the intro (below it on phones) and a row of three under the interests section, all quiet paper-toned blocks until photos arrive. To add them: put files in `public/about/` and fill in `src`/`alt` at the top of `src/pages/about.astro` (`PhotoSlot` component).
- New Contact page: one line, then the email address large. The tree's Contact now opens it (with the pan) instead of an email.
- About ends with a quiet "Get in touch" link to Contact.

**#21, Evan**
> For both of these pages make the background paper a more solid color. Remove the streaks and color changes.

What changed:
- About and Contact now sit on plain paper: one solid `#F7F0EA`, no glows or streaks, with a much fainter grain (so it still reads as paper). `<Base plain>` turns this on for any page; the tree and case studies keep the full sky.
- In the pan, the new page's background now fades in slowly over the whole move, so going from the tree's glowing sky to plain paper (and back) is gradual, not a jump.
