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

**The light strip.** Six light segments under the intro, the same six sections a Velocity 360 step exposes in Sequence. It plays light patterns the way the app does (chase, breathe, wave), and tapping it changes the pattern. It's the one place colour appears on the site. Everything else stays quiet.

Ideas for where it could go next:
- The strip becomes the progress indicator as you scroll through case studies.
- On the Sequence case study, the strip lets you try the real controls: pick a colour for each section.
- The six colours tint each case study's hover state, one per project.

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
| light 1–6 | `#FF5A36` `#FFB200` `#2FD18B` `#2FA8FF` `#7B5CFF` `#FF4FB8` | The light strip only |

**Type:** Instrument Sans, 400/500. A small, calm scale (13 / 15 / 18 / 24 / 36px). Headlines are one weight, no accented words.

**Layout:** One left-aligned column, max 68rem. App work is shown as whole phone cards standing on the warm gray mat (14px corners on the mat, 18px on the cards). The featured project spans full width; the rest pair up, and a lone last card spans full width.

**Motion:** One moment: the light strip. No fade-up on every section. Respect reduced motion.

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
