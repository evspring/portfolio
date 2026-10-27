# Design brief

## The one line

Showcase my ability as a product designer and how I can help people build apps and products.

Every decision gets checked against this. If something doesn't help a visitor see what I can do for their product, it goes.

## Who it's for

People who build apps and products (founders, product leads, hiring managers) deciding whether to bring me in.

## References, and what I'm taking from each

| Reference | What to borrow |
| --- | --- |
| Basit A. Khan's minimal UI reels (via @insporadesign, Oct 12 2026, and @basit_designs, Oct 13 2026) | Studied frame by frame; see "What the reels do" below. |
| Finn Taylor's "Literal file tree" (video) | The home page's idea and motion: the site is a file tree; folders grow branches, files open pages. See "The tree" below. |
| Gris (game art, three stills) | The home page's art style: watercolour washes on warm paper, thin flowing coral stems, candelabra twigs with square buds, big translucent geometric canopies, a dusty rose / sage / teal palette. Borrowed as a style only; the tree and every shape in it are our own. |
| niklaspeterson.com | Structure: a plain one-sentence headline, a short intro, then case studies as large media with a one-line outcome under each. No tricks in the navigation. |

Borrow the feeling, not the layout. These are where it starts, not what it becomes.

## What the reels do

Measured from the two original videos (16s at 3102×2160, and 18s at 2452×1802, both 60fps).

**Composition.** One continuous shot, no cuts. Three white phone cards (`#FDFDFD`) stand side by side on a warm gray ground (`#ECECE7`), each with a small notch pill at the top. The cards are whole, centred, with generous margin.

**Colour.** The UI is monochrome. Colour lives only inside media: a blurred bloom of saturated blobs, a glitching gradient, photographs. → On this site, the light strip and project screens carry all the colour.

**Type.** A neutral grotesk, small, two weights. Ink `#262626`, secondary text a warm gray `#666261`. Tags are small pills in `#E6E4E0`. Some headings put a phrase in a heavier weight ("Understand the **Bigger Picture**"); not adopted yet.

**Actions.** One dark button per card, a deep oxblood `#2D0F12`, white label. → One "Email me" button in the hero.

**Motion.** The middle card's carousel never stops. Every ~3.6s it kicks forward: speed builds over ~0.4s, peaks, then settles over ~2s into a slow creep (peak about 8× the creep). Items warp and stretch as they leave the card's edge, like glass. → The light strip's chase now uses this exact profile. Next candidates: a screen carousel inside the Sequence mat, and the edge warp.

## Signature thing

**The tree.** The home page starts as a planted terracotta pot with a small sprout, alone on the page. Click (or tap) the pot and a full-grown trunk rises out of it; from there the page is the site as a literal file tree, and nothing else: a name at the top left, the current path at the top (click a folder in it to go back up), and an item count at the bottom.

```
evan/
├── work/
│   ├── realtruck/
│   │   ├── sequence.md
│   │   ├── realtruck-connect.md
│   │   └── husky-liners.md
│   └── mindra.md
├── about.md
└── contact.txt   (opens email)
```

The structure lives in `src/data/tree.ts`. Add a page there and it grows onto the tree.

**The light strip** moved to the Sequence case study, where it belongs to the work it's about.

## The tree

Measured from Finn Taylor's "Literal file tree" (20s, 1516×1080, 50fps).

**Look (watercolour, after Gris).** Warm paper (`#F7F0EA`) with a faint rose glow up high, a sage one down low, a few faint upright rose washes like distant trunks, and paper grain multiplied over everything. Stems are coral, painted as three overlapping outlines at low opacity so the core is denser than the soft edge; the trunk flares where it meets the soil. Small candelabra twigs step out and up, ending in square buds. Folders are big square canopies (light at the top, deep at the bottom, uneven banded edges, pooled blotches, a thin drying edge, a little bleed into the paper); pages end in small square canopies. Canopies bloom open from half size as their limb arrives. The pot is painted terracotta with a shaded side, a rim and dark soil, sitting on a soft rose shadow. Labels are small grey type on a paper-coloured halo.

(Before this, the tree was pixel art after Finn Taylor's video: grey bark and lime moss.)

**Motion.** The middle card's carousel never stops. Every ~3.6s it kicks forward: speed builds over ~0.4s, peaks, then settles over ~2s into a slow creep (peak about 8× the creep). Items warp and stretch as they leave the card's edge, like glass. → The light strip's chase now uses this exact profile. Next candidates: a screen carousel inside the Sequence mat, and the edge warp.

## Signature thing

**The tree.** The home page starts as a planted terracotta pot with a small sprout, alone on the page. Click (or tap) the pot and a full-grown trunk rises out of it; from there the page is the site as a literal file tree, and nothing else: a name at the top left, the current path at the top (click a folder in it to go back up), and an item count at the bottom.

```
evan/
├── work/
│   ├── realtruck/
│   │   ├── sequence.md
│   │   ├── realtruck-connect.md
│   │   └── husky-liners.md
│   └── mindra.md
├── about.md
└── contact.txt   (opens email)
```

The structure lives in `src/data/tree.ts`. Add a page there and it grows onto the tree.

**The light strip** moved to the Sequence case study, where it belongs to the work it's about.

## The tree

Measured from Finn Taylor's "Literal file tree" (20s, 1516×1080, 50fps).

**Look.** Pixel-dithered branches on white: a grey bark core with a near-black underside, lime and yellow-green moss pixels in clumps mostly on top, thin single-pixel twigs, the odd red speck. Folders are outlined icons sitting on the branch; files hang just off it. Labels are small grey type with a trailing slash on folders.

**Motion.**
- A branch grows in ~0.85s: fast at first, then slowing (tip covers ~75% of its length in the first half). Moss fills in just behind the tip.
- Opening a folder grows its branch from the folder's icon while the view pans ~0.65s to follow it.
- Levels you've moved past fade back to about half strength; their labels step back.
- Closing pulls a branch back toward its folder in ~0.4s.

**How it's ours.** The tree is Evan's site map, not a demo. It starts as a pixel-art terracotta pot; the sprout perks up on hover, and the visitor grows the tree themselves.

**It's shaped like a family tree.** Every folder is a fork, and everything in it gets its own limb fanning out from that fork at the same level. Folders climb up the middle and become the next fork; pages spread wide to both sides (about 69° from vertical on big screens), leaving flatter and curling upward like real branches. Each level opens above the last, so the open path reads bottom to top: `evan` → `work` → `realtruck`. Sibling limbs grow together, the middle one leading and the side ones a beat behind; the view pans to fit the new level. Pages read outward (label to the right on the right side, left on the left); on phones, side labels sit above their icon so nothing runs off screen.

**Always full-grown.** The tree is full-grown from the first click. It grows as people open folders, not over time.

The trunk rises straight out of the soil to the first fork. The pot is also a way home: clicking it once the tree is grown closes every branch. Every page links back into the tree at its own folder (`/#/work/realtruck`). Coming back from a page (`/#/…`) skips the pot: the tree is already grown. The pot is a little chunkier on big screens (4px pixels vs 3px), where it's alone on the page.


**Access.** Folders are real buttons with `aria-expanded`; files are real links; Tab walks the tree, Escape closes the deepest branch. Reduced motion shows each state without growth. Without JavaScript, the page is a plain nested list of every page.

## System

**Colour**

| Token | Hex | Use |
| --- | --- | --- |
| page | `#FFFFFF` | Background |
| ink | `#262626` | Headings and body |
| quiet | `#666261` | Secondary text |
| mat | `#ECECE7` | The warm gray mat every screen sits on, and unlit light segments |
| card | `#FDFDFD` | Phone cards on the mat |
| chip | `#E6E4E0` | Status chips (In progress, iF Design Award entry) |
| action | `#2D0F12` | The one primary button |
| rule | `#E4E3DE` | The only line colour |
| light 1–6 | `#FF5A36` `#FFB200` `#2FD18B` `#2FA8FF` `#7B5CFF` `#FF4FB8` | The light strip (Sequence case study) only |
| paper | `#F7F0EA`, washes rose `#E8BDB6` and mint `#CFE3D7` | Home page background |
| stem | `#C9706E`, deep `#9D4B55` | Tree stems and twigs |
| leaves | sage `#8EAE9B`, teal `#5E9090`, deep `#3F6A63`, bud `#46605D` | Canopies and twig buds |
| pot | terracotta `#E7A27A` `#CD7651` `#9F5236`, edge `#5A2C1D`, soil `#4A3328` | The pot the tree grows from |

**Type:** Instrument Sans, 400/500. A small, calm scale (13 / 15 / 18 / 24 / 36px). Headlines are one weight, no accented words.

**Layout:** One left-aligned column, max 68rem. App work is shown as whole phone cards standing on the warm gray mat (14px corners on the mat, 18px on the cards). The featured project spans full width; the rest pair up, and a lone last card spans full width.

**Motion:** One moment: the tree growing out of the pot, started by the visitor. No fade-up on every section. Respect reduced motion.

**Rules:** One primary action per screen (email me). No borders around cards. No labels on screenshots.

## Projects

1. **Sequence** (featured): iF Design Award entry. Companion app for the Velocity 360 lighted steps.
2. **RealTruck Connect** (in progress): expanding Sequence into one home for RealTruck's connected apps and features.
3. **Husky Liners**: website redesign at RealTruck.
4. **Mindra**: note-taking app for therapists.

## Open questions

- [x] Header name: Evan Springer.
- [x] Contact email: evan.a.springer@gmail.com.
- [ ] Role, year and one-line outcome for each project.
- [ ] Real screens for each mat: exported frames, recordings, or Figma links.
- [ ] Anything under NDA that can't be shown publicly (RealTruck Connect is unreleased).
- [ ] Domain name.
- [ ] Husky Liners is a website: show it in a browser frame on the mat instead of phones.
