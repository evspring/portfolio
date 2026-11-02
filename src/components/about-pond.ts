/*
  The About pond: a top-down watercolour painting on the paper, after the "Kayaks on the water"
  reference. A pond in a meadow: pale shallows deepening to the middle, sky reflected on the
  surface, rocks and reeds along the banks, trees and a flower patch around it, lily pads, koi
  swimming under the surface, and a kayak that paddles around trailing ripple rings.

  The kayak wanders, steers toward the pointer while it's over the water, and paddles to
  wherever the water is clicked. The tree, flowers, lily pads and kayak are buttons (in the
  markup) that open the About tiles; this script places them over their features.

  Only the site's watercolour tokens: the water is mint, teal and deep green, the kayak is the
  pot's terracotta. Compiled at build time and inlined at the end of the .pond element, so the
  painting is drawn while the page is parsed and pans in with the page.
*/
type P = { x: number; y: number };
type Feature = { x: number; y: number; r: number };
type Ring = { x: number; y: number; ang: number; born: number; small: boolean };

const root = document.currentScript!.parentElement as HTMLElement;
const paint = root.querySelector<HTMLCanvasElement>('.pond-paint')!;
const live = root.querySelector<HTMLCanvasElement>('.pond-live')!;
const pc = paint.getContext('2d')!;
const lc = live.getContext('2d')!;
const css = getComputedStyle(document.documentElement);
const C = (n: string) => css.getPropertyValue(`--color-${n}`).trim();
const PAPER = C('paper'), ROSE = C('wash-rose'), STEM = C('stem');
const SAGE = C('leaf-sage'), TEAL = C('leaf-teal'), DEEP = C('leaf-deep'), MINT = C('leaf-mint'), BUD = C('bud');
const POT = C('pot'), POT_LIGHT = C('pot-light'), POT_SHADE = C('pot-shade'), POT_LINE = C('pot-line'), SOIL = C('soil');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- randomness: seeded, so the painting is the same on every visit ---------- */
const rngFrom = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
let rnd = rngFrom(11);
const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/* ---------- paint helpers ---------- */
let ctx = pc;
function deform(pts: P[], v: number): P[] {
  const out: P[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const len = Math.hypot(b.x - a.x, b.y - a.y), ang = rnd() * Math.PI * 2, d = gauss() * len * v;
    out.push(a, { x: (a.x + b.x) / 2 + Math.cos(ang) * d, y: (a.y + b.y) / 2 + Math.sin(ang) * d });
  }
  return out;
}
function pathOf(pts: P[]) {
  const p = new Path2D();
  pts.forEach((q, i) => (i ? p.lineTo(q.x, q.y) : p.moveTo(q.x, q.y)));
  p.closePath();
  return p;
}
// many translucent, slightly different copies of one shape: soft bleeding edges, pooled middle
function wash(shape: P[], color: string, layers: number, alpha: number, v: number) {
  const base = deform(deform(shape, v * 1.6), v);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  for (let i = 0; i < layers; i++) ctx.fill(pathOf(deform(deform(base, v), v * 0.8)));
}
// an uneven round shape: radius wobbling with a few slow waves
function blobPts(cx: number, cy: number, rx: number, ry: number, rough = 0.12, n = 28): P[] {
  const p1 = rnd() * 6, p2 = rnd() * 6, p3 = rnd() * 6;
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + rough * (0.6 * Math.sin(2 * a + p1) + 0.3 * Math.sin(3 * a + p2) + 0.25 * Math.sin(5 * a + p3));
    return { x: cx + Math.cos(a) * rx * k, y: cy + Math.sin(a) * ry * k };
  });
}
function blob(cx: number, cy: number, r: number, color: string, alpha: number, layers = 7, ry = r) {
  wash(blobPts(cx, cy, r, ry, 0.18, 18), color, layers, alpha, 0.1);
}
/* ---------- the scene ---------- */
let W = 0, H = 0, M = 0, wide = true;
let water: P[] = [], waterPath = new Path2D();
let safe = { cx: 0, cy: 0, rx: 0, ry: 0 }, fishSafe = { cx: 0, cy: 0, rx: 0, ry: 0 };
const feat: Record<string, Feature> = {};
const STONE = C('chip'), STONE_DARK = C('quiet');
// the floating surface: lily pads and rocks in the water, drawn over the fish every frame
const surf = document.createElement('canvas');

// a point inside an ellipse, uniformly
function inEllipse(cx: number, cy: number, rx: number, ry: number): P {
  const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
  return { x: cx + Math.cos(a) * rx * r, y: cy + Math.sin(a) * ry * r };
}
// the shape scaled toward a point
const shrink = (pts: P[], k: number, c: P, dx = 0, dy = 0) => pts.map((q) => ({ x: c.x + (q.x - c.x) * k + dx, y: c.y + (q.y - c.y) * k + dy }));

type Layout = { meadow: number[]; pond: number[]; tree: number[]; tree2: number[]; bushes: number[][]; flowers: number[]; lilies: number[]; pads: number[][] };
function layout(): Layout {
  W = root.clientWidth; H = root.clientHeight; M = Math.min(W, H);
  wide = W > H;
  // where everything sits, as fractions of the painting
  const L: Layout = wide
    ? { meadow: [0.5, 0.5, 0.47, 0.45], pond: [0.53, 0.52, 0.3, 0.33], tree: [0.16, 0.28, 0.075], tree2: [0.87, 0.2, 0.05],
        bushes: [[0.1, 0.7, 0.03], [0.24, 0.12, 0.022], [0.91, 0.52, 0.026], [0.36, 0.9, 0.024]],
        flowers: [0.82, 0.82, 0.07], lilies: [0.66, 0.66, 0.07], pads: [[0.4, 0.33, 0.035], [0.71, 0.36, 0.03], [0.38, 0.7, 0.03]] }
    : { meadow: [0.5, 0.5, 0.47, 0.47], pond: [0.5, 0.52, 0.38, 0.27], tree: [0.25, 0.13, 0.12], tree2: [0.84, 0.12, 0.08],
        bushes: [[0.1, 0.78, 0.05], [0.9, 0.42, 0.04], [0.33, 0.9, 0.04]],
        flowers: [0.74, 0.9, 0.12], lilies: [0.66, 0.6, 0.1], pads: [[0.3, 0.42, 0.06], [0.64, 0.38, 0.05]] };
  const [px, py, prx, pry] = L.pond;
  // a pond, not an oval: a gentle kidney with an uneven shore
  const cx = px * W, cy = py * H, n = 120, ph = rnd() * 6;
  water = Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    const k = 1 + 0.08 * Math.sin(2 * t + ph) + 0.05 * Math.sin(3 * t + ph * 2) + 0.025 * Math.sin(7 * t + ph) - 0.1 * Math.exp(-((t - 4.2) ** 2) / 0.25);
    return { x: cx + Math.cos(t) * prx * W * k, y: cy + Math.sin(t) * pry * H * k };
  });
  water = deform(water, 0.02);
  waterPath = pathOf(water);
  safe = { cx, cy, rx: prx * W * 0.68, ry: pry * H * 0.62 };
  fishSafe = { cx, cy, rx: prx * W * 0.78, ry: pry * H * 0.72 };
  const f = (v: number[]) => ({ x: v[0] * W, y: v[1] * H, r: v[2] * W });
  feat.tree = f(L.tree); feat.flowers = f(L.flowers); feat.lilies = f(L.lilies);
  return L;
}

/* a rock seen from above: a rounded stone, lit from the top left, with its shadow */
function rock(x: number, y: number, r: number, wet: boolean) {
  const ry = r * (0.7 + rnd() * 0.25), rot = rnd() * Math.PI;
  const shape = (k: number, ox = 0, oy = 0) => blobPts(0, 0, r * k, ry * k, 0.18, 18).map((q) => ({
    x: x + ox + q.x * Math.cos(rot) - q.y * Math.sin(rot), y: y + oy + q.x * Math.sin(rot) + q.y * Math.cos(rot),
  }));
  const op = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'multiply';
  wash(shape(1.02, r * 0.2, r * 0.26), wet ? TEAL : SAGE, 3, 0.12, 0.06); // its shadow
  ctx.globalCompositeOperation = 'source-over';
  wash(shape(1), STONE, 4, 0.55, 0.035); // a pale stone, painted over what's beneath
  ctx.globalCompositeOperation = 'multiply';
  wash(shape(1), ROSE, 2, 0.06, 0.04); // warmed a touch
  ctx.globalCompositeOperation = 'multiply';
  wash(shape(0.78, r * 0.16, r * 0.18), STONE_DARK, 3, 0.07, 0.06); // shade on its lower side
  if (wet) wash(shape(1.02, 0, r * 0.08), SAGE, 2, 0.1, 0.05); // a little moss where it meets the water
  ctx.globalCompositeOperation = 'source-over';
  wash(shape(0.4, -r * 0.24, -r * 0.24), PAPER, 3, 0.4, 0.08); // light on top
  ctx.globalCompositeOperation = op;
}

/* a lily pad: a notched disc, its shadow on the water, sometimes a flower */
function pad(x: number, y: number, r: number, flower: boolean) {
  const notch = rnd() * Math.PI * 2;
  const disc = (k: number, ox = 0, oy = 0) => {
    const pts: P[] = [{ x: x + ox, y: y + oy }];
    for (let i = 0; i <= 22; i++) {
      const a = notch + 0.35 + (i / 22) * (Math.PI * 2 - 0.7);
      pts.push({ x: x + ox + Math.cos(a) * r * k, y: y + oy + Math.sin(a) * r * k * 0.93 });
    }
    return pts;
  };
  wash(disc(1, r * 0.12, r * 0.16), DEEP, 3, 0.06, 0.03);
  wash(disc(1), rnd() < 0.75 ? SAGE : TEAL, 5, 0.2, 0.025);
  wash(disc(0.65, -r * 0.12, -r * 0.12), MINT, 3, 0.28, 0.04);
  if (!flower) return;
  ctx.globalCompositeOperation = 'source-over';
  const fx = x + gauss() * r * 0.2, fy = y + gauss() * r * 0.2;
  for (let ring = 0; ring < 2; ring++) {
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + ring * 0.45, d = r * (ring ? 0.18 : 0.28);
      ctx.globalAlpha = ring ? 0.95 : 0.85;
      ctx.fillStyle = ring ? PAPER : ROSE;
      ctx.beginPath();
      ctx.ellipse(fx + Math.cos(a) * d, fy + Math.sin(a) * d, r * (ring ? 0.2 : 0.28), r * 0.11, a, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1; ctx.fillStyle = POT_LIGHT;
  ctx.beginPath(); ctx.arc(fx, fy, r * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'multiply';
}

/* a tree from above: shadow, a ring of lobes around a full middle, light on top */
function treeTop(x: number, y: number, r: number) {
  soft(3, () => blob(x + r * 0.25, y + r * 0.3, r * 0.95, DEEP, 0.16, 4), M * 0.008);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + gauss() * 0.2, d = r * 0.55;
    blob(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.36 + rnd() * 0.1), rnd() < 0.7 ? SAGE : TEAL, 0.12, 5);
  }
  blob(x, y, r * 0.62, SAGE, 0.14, 5);
  blob(x + r * 0.3, y + r * 0.28, r * 0.45, TEAL, 0.14, 5);
  blob(x + r * 0.42, y + r * 0.4, r * 0.25, DEEP, 0.1, 4);
  ctx.globalCompositeOperation = 'source-over';
  soft(2, () => blob(x - r * 0.28, y - r * 0.3, r * 0.32, MINT, 0.22, 4), M * 0.008);
  ctx.globalCompositeOperation = 'multiply';
}

/* reeds at the water's edge: a tuft of pointed blades */
function reeds(x: number, y: number, size: number, toward: number) {
  for (let i = 0; i < 9; i++) {
    const a = toward + gauss() * 0.8, len = size * (0.7 + rnd() * 0.6), w = size * 0.09;
    const tip = { x: x + Math.cos(a) * len, y: y + Math.sin(a) * len };
    const nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
    const pts: P[] = [{ x: x + nx, y: y + ny }, { x: (x + tip.x) / 2 + nx * 0.8, y: (y + tip.y) / 2 + ny * 0.8 }, tip, { x: (x + tip.x) / 2 - nx * 0.8, y: (y + tip.y) / 2 - ny * 0.8 }, { x: x - nx, y: y - ny }];
    wash(pts, rnd() < 0.7 ? SAGE : TEAL, 3, 0.16, 0.02);
  }
  if (rnd() < 0.6) blob(x + Math.cos(toward) * size * 0.55, y + Math.sin(toward) * size * 0.55, size * 0.06, POT_SHADE, 0.3, 3, size * 0.14); // a cattail
}

function paintScene() {
  rnd = rngFrom(11);
  const L = layout();
  const DPR = Math.min(devicePixelRatio || 1, 2);
  for (const c of [paint, live, surf]) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); }
  const sc = surf.getContext('2d')!;
  for (const c of [pc, lc, sc]) c.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx = pc;
  pc.clearRect(0, 0, W, H);
  pc.globalCompositeOperation = 'multiply';
  const [px, py, prx, pry] = L.pond;
  const centre = { x: px * W, y: py * H };

  /* the meadow the pond sits in */
  const [mx, my, mrx, mry] = L.meadow;
  const meadow = blobPts(mx * W, my * H, mrx * W, mry * H, 0.14, 60);
  soft(3, () => {
    wash(meadow, MINT, 4, 0.38, 0.05);
    for (let i = 0; i < 26; i++) {
      const p = inEllipse(mx * W, my * H, mrx * W * 0.9, mry * H * 0.88);
      blob(p.x, p.y, M * (0.05 + rnd() * 0.08), SAGE, 0.055, 3);
    }
  }, M * 0.01);
  wash(meadow, SAGE, 3, 0.05, 0.06); // a crisper, ragged outer edge
  // little dabs of grass, darker toward the shade of the trees
  const DPRx = paint.width / W, shore = pathOf(shrink(water, 1.08, centre));
  for (let i = 0; i < (wide ? 260 : 170); i++) {
    const p = inEllipse(mx * W, my * H, mrx * W * 0.9, mry * H * 0.88);
    if (pc.isPointInPath(shore, p.x * DPRx, p.y * DPRx)) continue; // not in the pond or on its shore
    blob(p.x, p.y, M * (0.004 + rnd() * 0.005), rnd() < 0.7 ? SAGE : TEAL, 0.18, 2, M * 0.003);
  }

  /* the pond: a damp bank, pale shallows, deepening toward the middle */
  const bank = new Path2D();
  bank.addPath(pathOf(shrink(water, 1.08, centre)));
  bank.addPath(waterPath);
  pc.save();
  pc.clip(bank, 'evenodd'); // only the ring of shore around the water
  soft(2, () => {
    wash(shrink(water, 1.06, centre), SOIL, 3, 0.04, 0.05);
    wash(shrink(water, 1.03, centre), SAGE, 3, 0.08, 0.04);
  }, M * 0.007);
  pc.restore();
  soft(2, () => wash(water, MINT, 5, 0.5, 0.02), M * 0.003);
  pc.save();
  pc.clip(waterPath);
  soft(3, () => {
    wash(shrink(water, 0.97, centre), TEAL, 4, 0.04, 0.03);
    wash(shrink(water, 0.8, centre, M * 0.01, M * 0.01), TEAL, 4, 0.05, 0.04);
    wash(shrink(water, 0.58, centre, M * 0.02, M * 0.02), TEAL, 4, 0.055, 0.05);
    wash(shrink(water, 0.36, centre, M * 0.03, M * 0.02), DEEP, 4, 0.06, 0.06);
    for (let i = 0; i < 14; i++) {
      const p = inEllipse(centre.x, centre.y, prx * W * 0.8, pry * H * 0.8);
      blob(p.x, p.y, M * (0.04 + rnd() * 0.06), TEAL, 0.035, 3);
    }
  }, M * 0.018);
  // sky reflected on the surface: soft pale streaks
  pc.globalCompositeOperation = 'source-over';
  soft(3, () => {
    for (let i = 0; i < 4; i++) {
      const p = inEllipse(centre.x - prx * W * 0.2, centre.y - pry * H * 0.25, prx * W * 0.5, pry * H * 0.4);
      blob(p.x, p.y, M * (0.05 + rnd() * 0.05), PAPER, 0.14, 3, M * 0.014);
    }
  }, M * 0.01);
  pc.globalCompositeOperation = 'multiply';
  // pigment settling in the paper's grain
  for (let i = 0; i < (wide ? 1100 : 650); i++) {
    const p = inEllipse(centre.x, centre.y, prx * W * 1.05, pry * H * 1.05);
    pc.globalAlpha = 0.06 + rnd() * 0.1;
    pc.fillStyle = rnd() < 0.8 ? TEAL : DEEP;
    pc.fillRect(p.x, p.y, 0.6 + rnd() * 1.1, 0.6 + rnd() * 1.1);
  }
  pc.restore();
  pc.globalAlpha = 0.2; pc.strokeStyle = TEAL; pc.lineWidth = 1.1;
  pc.stroke(pathOf(deform(water, 0.012))); // the shoreline dries a little darker

  /* rocks along the banks, in a few runs, and reeds between them */
  const shoreAt = (t: number) => water[Math.floor((((t % 1) + 1) % 1) * water.length)];
  const runs = wide ? [[0.02, 0.1], [0.3, 0.38], [0.55, 0.6], [0.76, 0.84]] : [[0.05, 0.12], [0.32, 0.4], [0.62, 0.7]];
  for (const [t0, t1] of runs) {
    const n = Math.round((t1 - t0) * 70);
    for (let i = 0; i <= n; i++) {
      const q = shoreAt(lerp(t0, t1, i / n) + gauss() * 0.004);
      const out = Math.atan2(q.y - centre.y, q.x - centre.x);
      const off = M * (gauss() * 0.008 + 0.004);
      rock(q.x + Math.cos(out) * off, q.y + Math.sin(out) * off, M * (0.01 + rnd() * 0.014), true);
    }
  }
  for (const t of wide ? [0.18, 0.45, 0.68, 0.93] : [0.2, 0.5, 0.85]) {
    const q = shoreAt(t), out = Math.atan2(q.y - centre.y, q.x - centre.x);
    reeds(q.x + Math.cos(out) * M * 0.008, q.y + Math.sin(out) * M * 0.008, M * 0.045, out + Math.PI + gauss() * 0.3);
    reeds(q.x + Math.cos(out) * M * 0.02 + gauss() * M * 0.01, q.y + Math.sin(out) * M * 0.02, M * 0.035, out - Math.PI / 2);
  }

  /* trees and bushes on the banks */
  for (const b of L.bushes) treeTop(b[0] * W, b[1] * H, b[2] * W);
  treeTop(L.tree2[0] * W, L.tree2[1] * H, L.tree2[2] * W);
  treeTop(feat.tree.x, feat.tree.y, feat.tree.r);

  /* the flower patch */
  const fl = feat.flowers;
  soft(2, () => blob(fl.x, fl.y, fl.r * 1.1, SAGE, 0.18, 4, fl.r * 0.6), M * 0.008);
  pc.globalCompositeOperation = 'source-over';
  const petals = [ROSE, STEM, POT_LIGHT, PAPER];
  for (let i = 0; i < 38; i++) {
    const p = inEllipse(fl.x, fl.y, fl.r, fl.r * 0.52);
    const s2 = fl.r * (0.04 + rnd() * 0.035), col = petals[Math.floor(rnd() * petals.length)];
    pc.globalAlpha = 0.88;
    pc.fillStyle = col;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      pc.beginPath(); pc.arc(p.x + Math.cos(a) * s2, p.y + Math.sin(a) * s2, s2 * 0.75, 0, Math.PI * 2); pc.fill();
    }
    pc.fillStyle = col === POT_LIGHT ? POT_SHADE : POT_LIGHT;
    pc.beginPath(); pc.arc(p.x, p.y, s2 * 0.55, 0, Math.PI * 2); pc.fill();
  }
  pc.globalCompositeOperation = 'source-over';
  pc.globalAlpha = 1;

  /* the surface: lily pads and a few rocks out in the water, above the fish */
  ctx = sc;
  sc.clearRect(0, 0, W, H);
  sc.globalCompositeOperation = 'source-over';
  const lil = feat.lilies;
  for (let i = 0; i < 9; i++) {
    const p = inEllipse(lil.x, lil.y, lil.r * 0.85, lil.r * 0.7);
    pad(p.x, p.y, lil.r * (0.2 + rnd() * 0.14), i % 3 === 0);
  }
  for (const c of L.pads) {
    const n = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const p = inEllipse(c[0] * W, c[1] * H, c[2] * W, c[2] * W * 0.7);
      pad(p.x, p.y, M * (0.018 + rnd() * 0.014) * (wide ? 1 : 1.2), rnd() < 0.25);
    }
  }
  const inWater = wide ? [[0.3, 0.55], [0.75, 0.48]] : [[0.22, 0.6], [0.8, 0.5]];
  for (const [rx, ry] of inWater) {
    rock(rx * W, ry * H, M * 0.022, true);
    rock(rx * W + M * 0.025, ry * H + M * 0.012, M * 0.013, true);
  }
  ctx = pc;
  pc.globalAlpha = 1;
}

// paint into a separate low-resolution layer, then blur it onto the painting: the edges soften
// like paint on wet paper. (Browsers without canvas filters still get the softening from scaling.)
const canBlur = (() => { const t = document.createElement('canvas').getContext('2d')!; t.filter = 'blur(2px)'; return t.filter === 'blur(2px)'; })();
function soft(k: number, draw: () => void, blur = M * 0.012) {
  const o = document.createElement('canvas');
  o.width = Math.ceil(W / k); o.height = Math.ceil(H / k);
  const oc = o.getContext('2d')!;
  oc.setTransform(1 / k, 0, 0, 1 / k, 0, 0);
  const prev = ctx;
  ctx = oc;
  draw();
  ctx = prev;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (canBlur) ctx.filter = `blur(${blur.toFixed(1)}px)`;
  ctx.drawImage(o, 0, 0, W, H);
  ctx.restore();
}

/* ---------- the fish: koi under the surface ---------- */
type Fish = { x: number; y: number; h: number; v: number; tx: number; ty: number; len: number; phase: number; body: string; spot: string; spots: P[]; pause: number; dash: number };
let fish: Fish[] = [];
const fishPoint = () => inEllipse(fishSafe.cx, fishSafe.cy, fishSafe.rx, fishSafe.ry);
const inFishSafe = (p: P) => ((p.x - fishSafe.cx) / fishSafe.rx) ** 2 + ((p.y - fishSafe.cy) / fishSafe.ry) ** 2 <= 1;
function makeFish() {
  const looks = [[POT, PAPER], [PAPER, POT], [POT_LIGHT, POT_SHADE], [PAPER, SOIL], [POT_SHADE, POT_LIGHT]];
  fish = looks.map(([body, spot], i) => {
    const p = fishPoint(), t = fishPoint();
    return {
      x: p.x, y: p.y, h: rnd() * Math.PI * 2, v: 0, tx: t.x, ty: t.y, len: M * (0.042 + rnd() * 0.018) * (wide ? 1 : 1.25),
      phase: rnd() * 6, body, spot, spots: Array.from({ length: 2 + (i % 2) }, () => ({ x: 0.15 + rnd() * 0.5, y: gauss() * 0.35 })), pause: 0, dash: 0,
    };
  });
}
function swim(f: Fish, dt: number) {
  const dx = f.tx - f.x, dy = f.ty - f.y, dist = Math.hypot(dx, dy);
  if (dist < f.len * 0.8) {
    f.pause -= dt;
    if (f.pause <= 0) { const t = fishPoint(); f.tx = t.x; f.ty = t.y; f.pause = 0.5 + rnd() * 2.5; }
  }
  const turn = Math.atan2(Math.sin(Math.atan2(dy, dx) - f.h), Math.cos(Math.atan2(dy, dx) - f.h));
  f.h += clamp(turn, -1.6 * dt, 1.6 * dt);
  f.dash = Math.max(0, f.dash - dt);
  const want = dist < f.len * 0.8 ? 0 : M * (f.dash > 0 ? 0.16 : 0.04) * clamp(1.3 - Math.abs(turn), 0.3, 1);
  f.v = lerp(f.v, want, dt * (f.dash > 0 ? 4 : 1.2));
  const nx = f.x + Math.cos(f.h) * f.v * dt, ny = f.y + Math.sin(f.h) * f.v * dt;
  if (inFishSafe({ x: nx, y: ny })) { f.x = nx; f.y = ny; } else { const t = fishPoint(); f.tx = t.x; f.ty = t.y; }
  f.phase += dt * (3 + (f.v / (M * 0.04)) * 5); // tail beats faster when it swims faster
}
function drawFish(f: Fish) {
  const c = lc, Lf = f.len, n = 10;
  // the spine bends with the tail beat, more toward the tail
  const spine: P[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, bend = Math.sin(f.phase - t * 2.2) * Lf * 0.12 * t * t;
    const ax = -t * Lf, ay = bend;
    spine.push({ x: f.x + ax * Math.cos(f.h) - ay * Math.sin(f.h), y: f.y + ax * Math.sin(f.h) + ay * Math.cos(f.h) });
  }
  const width = (t: number) => Lf * 0.15 * (t < 0.2 ? 0.55 + t * 2.25 : Math.pow(1 - (t - 0.2) / 0.8, 0.9));
  const left: P[] = [], right: P[] = [];
  spine.forEach((q, i) => {
    const a = spine[Math.max(i - 1, 0)], b = spine[Math.min(i + 1, n)];
    const tx = a.x - b.x, ty = a.y - b.y, tl = Math.hypot(tx, ty) || 1, w = width(i / n);
    left.push({ x: q.x - (ty / tl) * w, y: q.y + (tx / tl) * w });
    right.push({ x: q.x + (ty / tl) * w, y: q.y - (tx / tl) * w });
  });
  const body = new Path2D();
  body.moveTo(spine[0].x + Math.cos(f.h) * Lf * 0.05, spine[0].y + Math.sin(f.h) * Lf * 0.05);
  left.forEach((q) => body.lineTo(q.x, q.y));
  [...right].reverse().forEach((q) => body.lineTo(q.x, q.y));
  body.closePath();
  // the tail fin, fanning from the end of the spine
  const end = spine[n], pre = spine[n - 2], ta = Math.atan2(end.y - pre.y, end.x - pre.x), sway = Math.sin(f.phase - 2.2) * 0.4;
  const tail = new Path2D();
  tail.moveTo(end.x, end.y);
  tail.quadraticCurveTo(end.x + Math.cos(ta + 0.6 + sway) * Lf * 0.3, end.y + Math.sin(ta + 0.6 + sway) * Lf * 0.3, end.x + Math.cos(ta + 0.3 + sway) * Lf * 0.34, end.y + Math.sin(ta + 0.3 + sway) * Lf * 0.34);
  tail.lineTo(end.x + Math.cos(ta + sway) * Lf * 0.22, end.y + Math.sin(ta + sway) * Lf * 0.22);
  tail.lineTo(end.x + Math.cos(ta - 0.3 + sway) * Lf * 0.34, end.y + Math.sin(ta - 0.3 + sway) * Lf * 0.34);
  tail.quadraticCurveTo(end.x + Math.cos(ta - 0.6 + sway) * Lf * 0.3, end.y + Math.sin(ta - 0.6 + sway) * Lf * 0.3, end.x, end.y);
  // fins at the shoulders, paddling
  const s = spine[3], fin = Math.sin(f.phase * 0.7) * 0.3;
  const fins = new Path2D();
  for (const side of [-1, 1]) {
    const a = f.h + Math.PI + side * (1.9 + fin);
    fins.ellipse(s.x + Math.cos(a) * Lf * 0.14, s.y + Math.sin(a) * Lf * 0.14, Lf * 0.1, Lf * 0.04, a, 0, Math.PI * 2);
  }
  // under the water: a soft shadow below, and the fish a little faded
  c.save();
  c.translate(Lf * 0.12, Lf * 0.18);
  c.globalAlpha = 0.12; c.fillStyle = DEEP; c.fill(body); c.fill(tail);
  c.restore();
  c.globalAlpha = 0.55; c.fillStyle = f.body; c.fill(tail); c.fill(fins);
  c.globalAlpha = 0.85; c.fill(body);
  c.save(); c.clip(body);
  c.fillStyle = f.spot; c.globalAlpha = 0.85;
  for (const sp of f.spots) {
    const q = spine[Math.round(sp.x * n)];
    c.beginPath(); c.ellipse(q.x + Math.cos(f.h + Math.PI / 2) * sp.y * Lf * 0.12, q.y + Math.sin(f.h + Math.PI / 2) * sp.y * Lf * 0.12, Lf * 0.1, Lf * 0.07, f.h, 0, Math.PI * 2); c.fill();
  }
  c.restore();
  c.globalAlpha = 1;
}
// fish dart away from a splash
function scatter(p: P) {
  for (const f of fish) {
    const d = Math.hypot(f.x - p.x, f.y - p.y);
    if (d > M * 0.2) continue;
    const a = Math.atan2(f.y - p.y, f.x - p.x), t = toFish({ x: f.x + Math.cos(a) * M * 0.2, y: f.y + Math.sin(a) * M * 0.2 });
    f.tx = t.x; f.ty = t.y; f.dash = 0.6; f.pause = 0;
  }
}
const toFish = (p: P): P => {
  const dx = (p.x - fishSafe.cx) / fishSafe.rx, dy = (p.y - fishSafe.cy) / fishSafe.ry, d = Math.hypot(dx, dy);
  return d <= 0.95 ? p : { x: fishSafe.cx + (dx / d) * fishSafe.rx * 0.95, y: fishSafe.cy + (dy / d) * fishSafe.ry * 0.95 };
};

/* ---------- the kayak ---------- */
const kayak = { x: 0, y: 0, h: -0.5, v: 0, len: 0, tx: 0, ty: 0, paddle: 0, rest: 0, nx: 0.42, ny: 0.52 };
let rings: Ring[] = [], lastRing = 0, steer: P | null = null, chosen: P | null = null;

function placeKayak(first: boolean) {
  kayak.len = M * (wide ? 0.16 : 0.22);
  if (first) { kayak.x = kayak.nx * W; kayak.y = kayak.ny * H; pickTarget(); }
  else { kayak.x = kayak.nx * W; kayak.y = kayak.ny * H; }
}
function pickTarget() {
  const p = inEllipse(safe.cx, safe.cy, safe.rx, safe.ry);
  kayak.tx = p.x; kayak.ty = p.y;
}
const inSafe = (p: P) => ((p.x - safe.cx) / safe.rx) ** 2 + ((p.y - safe.cy) / safe.ry) ** 2 <= 1;
const toSafe = (p: P): P => {
  const dx = (p.x - safe.cx) / safe.rx, dy = (p.y - safe.cy) / safe.ry, d = Math.hypot(dx, dy);
  return d <= 1 ? p : { x: safe.cx + (dx / d) * safe.rx, y: safe.cy + (dy / d) * safe.ry };
};

function drawKayak(t: number) {
  const c = lc, Lk = kayak.len, Wk = Lk * 0.13;
  c.save();
  c.translate(kayak.x, kayak.y);
  c.rotate(kayak.h);
  const hull = new Path2D();
  hull.moveTo(-Lk / 2, 0);
  hull.quadraticCurveTo(-Lk * 0.1, -Wk * 2, Lk / 2, 0);
  hull.quadraticCurveTo(-Lk * 0.1, Wk * 2, -Lk / 2, 0);
  // shadow on the water
  c.save(); c.translate(Lk * 0.02, Wk * 0.5); c.globalAlpha = 0.18; c.fillStyle = DEEP; c.fill(hull); c.restore();
  c.globalAlpha = 1; c.fillStyle = POT; c.fill(hull);
  c.save(); c.clip(hull);
  c.globalAlpha = 0.45; c.fillStyle = POT_SHADE; c.fillRect(-Lk / 2, Wk * 0.15, Lk, Wk * 2);
  c.globalAlpha = 0.55; c.fillStyle = POT_LIGHT;
  c.beginPath(); c.ellipse(-Lk * 0.05, -Wk * 0.55, Lk * 0.34, Wk * 0.28, 0, 0, Math.PI * 2); c.fill();
  c.restore();
  c.globalAlpha = 0.7; c.strokeStyle = POT_LINE; c.lineWidth = 1.1; c.stroke(hull);
  c.globalAlpha = 0.4; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(Lk * 0.2, -Wk * 0.5); c.lineTo(Lk * 0.42, -Wk * 0.1); c.moveTo(-Lk * 0.38, Wk * 0.2); c.lineTo(-Lk * 0.2, Wk * 0.55); c.stroke();
  // cockpit
  c.globalAlpha = 0.92; c.fillStyle = POT_LINE;
  c.beginPath(); c.ellipse(-Lk * 0.04, 0, Lk * 0.13, Wk * 0.62, 0, 0, Math.PI * 2); c.fill();
  // the paddle, sweeping side to side with the strokes
  const sweep = Math.sin(kayak.paddle) * 0.45;
  c.save();
  c.translate(-Lk * 0.02, 0);
  c.rotate(Math.PI / 2 + sweep);
  const reach = Lk * 0.42;
  c.globalAlpha = 0.8; c.strokeStyle = SOIL; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(-reach, 0); c.lineTo(reach, 0); c.stroke();
  for (const s of [-1, 1]) {
    c.globalAlpha = 1; c.fillStyle = POT_LIGHT;
    c.beginPath(); c.ellipse(s * reach, 0, Lk * 0.075, Lk * 0.026, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.7; c.lineWidth = 0.8; c.stroke();
  }
  c.restore();
  // arms: from the shoulders to the hands on the shaft
  const th = Math.PI / 2 + sweep, hx = Math.cos(th) * Lk * 0.11, hy = Math.sin(th) * Lk * 0.11;
  c.globalAlpha = 0.95; c.strokeStyle = ROSE; c.lineWidth = Math.max(1.5, Wk * 0.22); c.lineCap = 'round';
  c.beginPath();
  c.moveTo(-Lk * 0.05, -Wk * 0.6); c.lineTo(-Lk * 0.02 - hx, -hy);
  c.moveTo(-Lk * 0.05, Wk * 0.6); c.lineTo(-Lk * 0.02 + hx, hy);
  c.stroke();
  // the paddler: shoulders and head
  c.globalAlpha = 1; c.fillStyle = SAGE;
  c.beginPath(); c.ellipse(-Lk * 0.05, 0, Wk * 0.42, Wk * 0.75, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = SOIL;
  c.beginPath(); c.arc(-Lk * 0.035, 0, Wk * 0.36, 0, Math.PI * 2); c.fill();
  c.restore();
  c.globalAlpha = 1;
  void t;
}

function drawRings(now: number) {
  const c = lc;
  c.save();
  c.clip(waterPath);
  rings = rings.filter((r) => now - r.born < (r.small ? 1.4 : 2.6));
  for (const r of rings) {
    const life = r.small ? 1.4 : 2.6, a = (now - r.born) / life;
    const s = r.small ? M * 0.008 + a * M * 0.03 : kayak.len * (0.52 + a * 0.38);
    const ry = r.small ? s * 0.85 : s * 0.34;
    const fade = Math.pow(1 - a, 1.5);
    c.save();
    c.translate(r.x, r.y);
    c.rotate(r.ang);
    c.beginPath(); c.ellipse(0, 0, s, ry, 0, 0, Math.PI * 2);
    c.globalAlpha = 0.5 * fade; c.strokeStyle = PAPER; c.lineWidth = 1.4; c.stroke();
    c.beginPath(); c.ellipse(0.6, 1, s, ry, 0, 0, Math.PI * 2);
    c.globalAlpha = 0.14 * fade; c.strokeStyle = DEEP; c.lineWidth = 0.7; c.stroke();
    c.restore();
  }
  c.restore();
}

/* ---------- the tiles' buttons, placed over their features ---------- */
const spots = new Map<string, HTMLElement>();
root.querySelectorAll<HTMLElement>('[data-feature]').forEach((el) => spots.set(el.dataset.feature!, el));
function placeSpot(name: string, x: number, y: number, size: number) {
  const el = spots.get(name);
  if (!el) return;
  el.style.width = el.style.height = `${Math.round(size)}px`;
  el.style.transform = `translate(${Math.round(x - size / 2)}px, ${Math.round(y - size / 2)}px)`;
  el.classList.toggle('label-above', y + size / 2 + 22 > H); // no room below: label goes on top
}
function placeSpots() {
  for (const k of ['tree', 'flowers']) placeSpot(k, feat[k].x, feat[k].y, feat[k].r * 2);
  placeSpot('kayak', kayak.x, kayak.y, kayak.len);
}

/* ---------- motion ---------- */
let last = 0, running = false, visible = true, raf = 0;
function frame(ms: number) {
  raf = 0;
  const now = ms / 1000, dt = Math.min(0.05, last ? now - last : 0);
  last = now;
  // head for the clicked spot, else the pointer, else wander
  const goal = chosen ?? steer;
  if (goal) { kayak.tx = goal.x; kayak.ty = goal.y; }
  const dx = kayak.tx - kayak.x, dy = kayak.ty - kayak.y, dist = Math.hypot(dx, dy);
  const want = Math.atan2(dy, dx);
  const turn = Math.atan2(Math.sin(want - kayak.h), Math.cos(want - kayak.h));
  const arrive = clamp(dist / (kayak.len * 1.2), 0, 1);
  const pace = chosen ? 0.07 : 0.03; // quicker when sent somewhere
  const cruise = M * pace * arrive * clamp(1.2 - Math.abs(turn) / 1.6, 0.25, 1);
  kayak.v = lerp(kayak.v, dist > kayak.len * 0.15 ? cruise : 0, dt * 1.5);
  const rate = chosen ? 1.1 : 0.55;
  if (dist > kayak.len * 0.15) kayak.h += clamp(turn, -rate * dt, rate * dt);
  kayak.x += Math.cos(kayak.h) * kayak.v * dt;
  kayak.y += Math.sin(kayak.h) * kayak.v * dt;
  const p = toSafe({ x: kayak.x, y: kayak.y });
  kayak.x = p.x; kayak.y = p.y;
  kayak.nx = kayak.x / W; kayak.ny = kayak.y / H;
  // paddle strokes keep time with the speed; rest a moment on arrival, then wander on
  kayak.paddle += dt * (1.2 + (kayak.v / (M * 0.03)) * 2.4);
  if (!goal && dist < kayak.len * 0.2) {
    kayak.rest += dt;
    if (kayak.rest > 2.5) { kayak.rest = 0; pickTarget(); }
  }
  if (chosen && dist < kayak.len * 0.2) chosen = null;
  for (const f of fish) swim(f, dt);
  // ripples: rings off the hull while moving, little splashes where the blades dip
  if (now - lastRing > (kayak.v > M * 0.008 ? 0.75 : 1.6)) {
    lastRing = now;
    rings.push({ x: kayak.x, y: kayak.y, ang: kayak.h, born: now, small: false });
    if (kayak.v > M * 0.008) {
      const side = Math.sin(kayak.paddle) > 0 ? 1 : -1, reach = kayak.len * 0.42;
      rings.push({ x: kayak.x + Math.cos(kayak.h + side * Math.PI / 2) * reach, y: kayak.y + Math.sin(kayak.h + side * Math.PI / 2) * reach, ang: 0, born: now, small: true });
    }
  }
  render(now);
  if (running && visible) raf = requestAnimationFrame(frame);
}
function render(now: number) {
  lc.clearRect(0, 0, W, H);
  for (const f of fish) drawFish(f);
  lc.drawImage(surf, 0, 0, W, H);
  drawRings(now);
  drawKayak(now);
  placeSpots();
}
function start() {
  if (still || raf || !running) return;
  last = 0;
  raf = requestAnimationFrame(frame);
}

/* ---------- input ---------- */
const local = (e: PointerEvent | MouseEvent): P => {
  const r = root.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
};
const onWater = (p: P) => pc.isPointInPath(waterPath, p.x * (paint.width / W), p.y * (paint.height / H));
root.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  const p = local(e);
  steer = onWater(p) ? toSafe(p) : null;
});
root.addEventListener('pointerleave', () => { steer = null; });
root.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('[data-feature]')) return;
  const p = local(e);
  if (!onWater(p)) return;
  chosen = toSafe(p);
  rings.push({ x: p.x, y: p.y, ang: 0, born: performance.now() / 1000, small: true });
  scatter(p);
  if (still) { kayak.x = chosen.x; kayak.y = chosen.y; chosen = null; render(performance.now() / 1000); }
});

/* ---------- start ---------- */
paintScene();
makeFish();
placeKayak(true);
render(0);
running = true;
start();
new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(root);
let timer = 0, lastW = W, lastH = H;
new ResizeObserver(() => {
  clearTimeout(timer);
  timer = window.setTimeout(() => {
    if (root.clientWidth === lastW && root.clientHeight === lastH) return;
    const ox = W, oy = H;
    paintScene(); placeKayak(false);
    for (const f of fish) { f.x *= W / ox; f.y *= H / oy; f.tx *= W / ox; f.ty *= H / oy; f.len *= M / Math.min(ox, oy); }
    render(performance.now() / 1000);
    lastW = W; lastH = H;
  }, 80);
}).observe(root);
