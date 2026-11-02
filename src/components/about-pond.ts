/*
  The About pond: a top-down watercolour painting on the paper, after the "Kayaks on the water"
  reference. A ragged-edged pond in mottled washes with darker pools, white glints and loose ink
  squiggles; greenery at the top and bottom edges, scribbled with ink; a tree from above, a
  flower patch, lily pads, and a kayak that paddles around trailing ripple rings.

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
const PAPER = C('paper'), INK = C('ink'), ROSE = C('wash-rose'), STEM = C('stem');
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
// a loose ink squiggle: a short random walk, like the reference's pen marks
function squiggle(x: number, y: number, size: number, alpha: number) {
  let a = rnd() * Math.PI * 2;
  const n = 4 + Math.floor(rnd() * 8);
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i < n; i++) {
    a += gauss() * 2.1;
    x += Math.cos(a) * size * (0.4 + rnd() * 0.6);
    y += Math.sin(a) * size * (0.4 + rnd() * 0.6);
    ctx.lineTo(x, y);
  }
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.7 + rnd() * 0.6;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

/* ---------- the scene ---------- */
let W = 0, H = 0, M = 0, wide = true;
let water: P[] = [], waterPath = new Path2D(), safe = { cx: 0, cy: 0, rx: 0, ry: 0 };
const feat: Record<string, Feature> = {};

// a point inside an ellipse, uniformly
function inEllipse(cx: number, cy: number, rx: number, ry: number): P {
  const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
  return { x: cx + Math.cos(a) * rx * r, y: cy + Math.sin(a) * ry * r };
}

function layout() {
  W = root.clientWidth; H = root.clientHeight; M = Math.min(W, H);
  wide = W > H;
  const u = (x: number, y: number) => ({ x: x * W, y: y * H });
  // where everything sits, as fractions of the painting
  const L = wide
    ? { pond: [0.5, 0.52, 0.4, 0.36], top: [0.37, 0.14, 0.17, 0.085], bottom: [0.5, 0.88, 0.19, 0.075], side: [0.9, 0.64, 0.05, 0.1],
        tree: [0.33, 0.14, 0.07], flowers: [0.53, 0.885, 0.07], lilies: [0.72, 0.68, 0.07], pool: [0.68, 0.33], kayak: [0.42, 0.52] }
    : { pond: [0.5, 0.5, 0.42, 0.37], top: [0.42, 0.12, 0.3, 0.075], bottom: [0.55, 0.89, 0.3, 0.065], side: [0.9, 0.44, 0.07, 0.08],
        tree: [0.36, 0.12, 0.12], flowers: [0.58, 0.89, 0.12], lilies: [0.7, 0.66, 0.11], pool: [0.66, 0.32], kayak: [0.42, 0.5] };
  const [px, py, prx, pry] = L.pond;
  water = deform(blobPts(px * W, py * H, prx * W, pry * H, 0.2, 110), 0.025);
  waterPath = pathOf(water);
  safe = { cx: px * W, cy: py * H, rx: prx * W * 0.66, ry: pry * H * 0.6 };
  const f = (k: 'tree' | 'flowers' | 'lilies') => ({ ...u(L[k][0], L[k][1]), r: L[k][2] * W });
  feat.tree = f('tree'); feat.flowers = f('flowers'); feat.lilies = f('lilies');
  return L;
}

function paintScene() {
  rnd = rngFrom(11);
  const L = layout();
  const DPR = Math.min(devicePixelRatio || 1, 2);
  for (const c of [paint, live]) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); }
  pc.setTransform(DPR, 0, 0, DPR, 0, 0);
  lc.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx = pc;
  pc.clearRect(0, 0, W, H);
  pc.globalCompositeOperation = 'multiply';

  const [px, py, prx, pry] = L.pond;
  const pcx = px * W, pcy = py * H, prX = prx * W, prY = pry * H;

  /* the water: a pale base with a ragged edge, soft mottled clouds, darker pools */
  soft(2, () => wash(water, MINT, 5, 0.3, 0.03), M * 0.004);
  wash(water, MINT, 3, 0.12, 0.045); // a ragged, slightly harder outer edge
  pc.save();
  pc.clip(pathOf(deform(water, 0.02)));
  const pool = { x: L.pool[0] * W, y: L.pool[1] * H };
  soft(5, () => {
    for (let i = 0; i < 40; i++) {
      const p = inEllipse(pcx, pcy, prX * 1.05, prY * 1.05);
      const edge = Math.hypot((p.x - pcx) / prX, (p.y - pcy) / prY);
      blob(p.x, p.y, M * (0.05 + rnd() * 0.09), TEAL, 0.025 + 0.05 * edge * edge, 3);
    }
    blob(pool.x, pool.y, M * 0.13, DEEP, 0.08, 4, M * 0.1);
    blob(pool.x + M * 0.05, pool.y - M * 0.03, M * 0.07, DEEP, 0.12, 4);
    blob(pool.x - M * 0.04, pool.y + M * 0.1, M * 0.05, BUD, 0.12, 4);
    blob(pcx - prX * 0.65, pcy - prY * 0.4, M * 0.08, TEAL, 0.12, 4);
    blob(pcx + prX * 0.15, pcy + prY * 0.55, M * 0.06, TEAL, 0.1, 4);
  });
  // pale, airy patches where the paper shows through
  pc.globalCompositeOperation = 'source-over';
  soft(4, () => {
    for (let i = 0; i < 7; i++) {
      const p = inEllipse(pcx - prX * 0.1, pcy - prY * 0.05, prX * 0.6, prY * 0.55);
      blob(p.x, p.y, M * (0.05 + rnd() * 0.06), PAPER, 0.18, 3, M * 0.035);
    }
  });
  pc.globalCompositeOperation = 'multiply';
  // pigment settling in the paper's grain
  for (let i = 0; i < (wide ? 1400 : 800); i++) {
    const p = inEllipse(pcx, pcy, prX * 1.05, prY * 1.05);
    pc.globalAlpha = 0.08 + rnd() * 0.14;
    pc.fillStyle = rnd() < 0.8 ? TEAL : DEEP;
    pc.fillRect(p.x, p.y, 0.6 + rnd() * 1.1, 0.6 + rnd() * 1.1);
  }
  pc.restore();
  // the edge dries a little darker, the way a wash does
  pc.globalAlpha = 0.16; pc.strokeStyle = TEAL; pc.lineWidth = 1.2;
  pc.stroke(pathOf(deform(water, 0.015)));

  /* loose ink squiggles drifting over the water, more over the dark pools */
  for (let i = 0; i < (wide ? 55 : 36); i++) {
    const p = rnd() < 0.3 ? inEllipse(pool.x, pool.y, M * 0.12, M * 0.1) : inEllipse(pcx, pcy, prX * 0.9, prY * 0.85);
    squiggle(p.x, p.y, M * (0.007 + rnd() * 0.008), 0.16 + rnd() * 0.22);
  }

  /* white glints where the light catches the water */
  pc.globalCompositeOperation = 'source-over';
  const glint = (gx: number, gy: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const x = gx + gauss() * M * 0.04, y = gy + gauss() * M * 0.018, w = M * (0.01 + rnd() * 0.02);
      pc.globalAlpha = 0.45 + rnd() * 0.3;
      pc.fillStyle = PAPER;
      pc.fill(pathOf(deform(blobPts(x, y, w, w * (0.25 + rnd() * 0.2), 0.3, 12), 0.12)));
    }
  };
  glint(pcx - prX * 0.42, pcy - prY * 0.45, 8);
  glint(pcx + prX * 0.12, pcy + prY * 0.35, 3);
  pc.globalCompositeOperation = 'multiply';

  /* lily pads, some with flowers */
  const lil = feat.lilies;
  for (let i = 0; i < 8; i++) {
    const p = inEllipse(lil.x, lil.y, lil.r * 0.8, lil.r * 0.65);
    const r = lil.r * (0.2 + rnd() * 0.16), notch = rnd() * Math.PI * 2;
    const pts: P[] = [{ x: p.x, y: p.y }];
    for (let k = 0; k <= 20; k++) {
      const a = notch + 0.4 + (k / 20) * (Math.PI * 2 - 0.8);
      pts.push({ x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r * 0.92 });
    }
    wash(pts, rnd() < 0.6 ? SAGE : TEAL, 5, 0.12, 0.025);
    if (i % 3 === 0) {
      pc.globalCompositeOperation = 'source-over';
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + rnd();
        pc.globalAlpha = 0.85;
        pc.fillStyle = k % 2 ? ROSE : PAPER;
        pc.beginPath();
        pc.ellipse(p.x + Math.cos(a) * r * 0.3, p.y + Math.sin(a) * r * 0.3, r * 0.32, r * 0.15, a, 0, Math.PI * 2);
        pc.fill();
      }
      pc.globalAlpha = 0.9; pc.fillStyle = POT_LIGHT;
      pc.beginPath(); pc.arc(p.x, p.y, r * 0.12, 0, Math.PI * 2); pc.fill();
      pc.globalCompositeOperation = 'multiply';
    }
  }

  /* greenery at the edges: soft green washes, a sandy bank, clumps of ink scribble */
  const greenery = (g: number[], clumps: number) => {
    const [gx, gy, gw, gh] = g;
    const cx = gx * W, cy = gy * H, rx = gw * W, ry = gh * H;
    soft(3, () => {
      blob(cx, cy + ry * 0.15, Math.max(rx, ry) * 1.05, ROSE, 0.12, 3, ry * 1.25);
      wash(blobPts(cx, cy, rx, ry, 0.25), MINT, 4, 0.45, 0.05);
      for (let i = 0; i < 12; i++) {
        const p = inEllipse(cx, cy, rx * 0.85, ry * 0.75);
        blob(p.x, p.y, Math.min(rx, ry) * (0.35 + rnd() * 0.45), rnd() < 0.65 ? SAGE : TEAL, 0.16, 3);
      }
    }, M * 0.005);
    wash(blobPts(cx, cy, rx * 0.98, ry * 0.95, 0.25), SAGE, 3, 0.06, 0.06);
    for (let c = 0; c < clumps; c++) {
      const q = inEllipse(cx, cy, rx * 0.75, ry * 0.6);
      for (let i = 0; i < 6; i++) squiggle(q.x + gauss() * M * 0.03, q.y + gauss() * M * 0.02, M * (0.004 + rnd() * 0.004), 0.28 + rnd() * 0.22);
    }
  };
  greenery(L.top, wide ? 6 : 5);
  greenery(L.bottom, wide ? 4 : 3);
  greenery(L.side, 2);

  /* the tree, from above: a round crown, shadow on its lower right, light on its top */
  const tr = feat.tree;
  soft(3, () => blob(tr.x + tr.r * 0.22, tr.y + tr.r * 0.28, tr.r * 0.92, DEEP, 0.16, 4), M * 0.008); // its shadow
  // the crown: a ring of round lobes around a fuller middle
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + gauss() * 0.2, d = tr.r * 0.55;
    blob(tr.x + Math.cos(a) * d, tr.y + Math.sin(a) * d, tr.r * (0.36 + rnd() * 0.1), rnd() < 0.7 ? SAGE : TEAL, 0.11, 5);
  }
  blob(tr.x, tr.y, tr.r * 0.6, SAGE, 0.12, 5);
  blob(tr.x + tr.r * 0.3, tr.y + tr.r * 0.28, tr.r * 0.42, TEAL, 0.13, 5); // the shaded side
  pc.globalCompositeOperation = 'source-over';
  soft(2, () => blob(tr.x - tr.r * 0.28, tr.y - tr.r * 0.3, tr.r * 0.3, MINT, 0.16, 4), M * 0.01); // light on top
  pc.globalCompositeOperation = 'multiply';
  for (let i = 0; i < 22; i++) {
    const a = rnd() * Math.PI * 2, d = tr.r * Math.sqrt(rnd()) * 0.8;
    const shade = Math.cos(a - Math.PI / 4) > 0; // heavier on the shadow side
    squiggle(tr.x + Math.cos(a) * d, tr.y + Math.sin(a) * d, tr.r * (0.03 + rnd() * 0.03), shade ? 0.34 : 0.18);
  }

  /* the flower patch */
  const fl = feat.flowers;
  pc.globalCompositeOperation = 'source-over';
  const petals = [ROSE, STEM, POT_LIGHT, PAPER];
  for (let i = 0; i < 34; i++) {
    const p = inEllipse(fl.x, fl.y, fl.r, fl.r * 0.5);
    const s2 = fl.r * (0.04 + rnd() * 0.035), col = petals[Math.floor(rnd() * petals.length)];
    pc.globalAlpha = 0.85;
    pc.fillStyle = col;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      pc.beginPath(); pc.arc(p.x + Math.cos(a) * s2, p.y + Math.sin(a) * s2, s2 * 0.75, 0, Math.PI * 2); pc.fill();
    }
    pc.fillStyle = col === POT_LIGHT ? POT_SHADE : POT_LIGHT;
    pc.beginPath(); pc.arc(p.x, p.y, s2 * 0.55, 0, Math.PI * 2); pc.fill();
  }
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
function blobAt(x: number, y: number, r: number, color: string, alpha: number) {
  ctx.globalAlpha = alpha; ctx.fillStyle = color;
  ctx.fill(pathOf(deform(blobPts(x, y, r, r * 0.9, 0.2, 14), 0.08)));
}

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
  c.globalAlpha = 0.85; c.strokeStyle = INK; c.lineWidth = 1.1; c.stroke(hull);
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
  c.globalAlpha = 0.85; c.strokeStyle = INK; c.lineWidth = 1.4;
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
    c.globalAlpha = 0.18 * fade; c.strokeStyle = INK; c.lineWidth = 0.7; c.stroke();
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
}
function placeSpots() {
  for (const k of ['tree', 'flowers', 'lilies']) placeSpot(k, feat[k].x, feat[k].y, feat[k].r * 2);
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
  if (still) { kayak.x = chosen.x; kayak.y = chosen.y; chosen = null; render(performance.now() / 1000); }
});

/* ---------- start ---------- */
paintScene();
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
    paintScene(); placeKayak(false); render(performance.now() / 1000);
    lastW = W; lastH = H;
  }, 80);
}).observe(root);
