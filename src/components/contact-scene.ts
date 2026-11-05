/*
  The contact page's landscape: a gentle grassy hill across the bottom of the page, a lone
  windswept tree on the right with flat, layered canopies, and a small person standing on the
  hill, after the reference Evan shared. Still, not animated. Painted with the same watercolour
  washes and tokens as the home page tree and the About pond.

  Compiled at build time and inlined right after its canvas (see ContactScene.astro), so it's
  painted before the first frame and pans in with the page.
*/
type P = { x: number; y: number };

const canvas = document.currentScript!.previousElementSibling as HTMLCanvasElement;
const host = canvas.parentElement as HTMLElement;
const css = getComputedStyle(document.documentElement);
const C = (n: string) => css.getPropertyValue(`--color-${n}`).trim();
const PAPER = C('paper'), ROSE = C('wash-rose'), STEM = C('stem'), STEM_DEEP = C('stem-deep');
const SAGE = C('leaf-sage'), TEAL = C('leaf-teal'), DEEP = C('leaf-deep'), MINT = C('leaf-mint');
const POT = C('pot'), POT_LIGHT = C('pot-light'), POT_SHADE = C('pot-shade'), SOIL = C('soil'), BUD = C('bud');

/* ---------- seeded randomness and paint helpers (as in the pond) ---------- */
const rngFrom = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
let rnd = rngFrom(23);
const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

let ctx = canvas.getContext('2d')!;
let W = 0, H = 0, M = 0;

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
function wash(shape: P[], color: string, layers: number, alpha: number, v: number) {
  const base = deform(deform(shape, v * 1.6), v);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  for (let i = 0; i < layers; i++) ctx.fill(pathOf(deform(deform(base, v), v * 0.8)));
}
function blobPts(cx: number, cy: number, rx: number, ry: number, rough = 0.15, n = 22): P[] {
  const p1 = rnd() * 6, p2 = rnd() * 6;
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + rough * (0.6 * Math.sin(2 * a + p1) + 0.35 * Math.sin(3 * a + p2));
    return { x: cx + Math.cos(a) * rx * k, y: cy + Math.sin(a) * ry * k };
  });
}
const blob = (cx: number, cy: number, rx: number, ry: number, color: string, alpha: number, layers = 5) =>
  wash(blobPts(cx, cy, rx, ry), color, layers, alpha, 0.08);
// paint at low resolution, then blur onto the canvas: soft wet edges
const canBlur = (() => { const t = document.createElement('canvas').getContext('2d')!; t.filter = 'blur(2px)'; return t.filter === 'blur(2px)'; })();
function soft(k: number, draw: () => void, blur: number) {
  const o = document.createElement('canvas');
  o.width = Math.ceil(W / k); o.height = Math.ceil(H / k);
  const oc = o.getContext('2d')!;
  oc.setTransform(1 / k, 0, 0, 1 / k, 0, 0);
  const prev = ctx; ctx = oc; draw(); ctx = prev;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.imageSmoothingQuality = 'high';
  if (canBlur) ctx.filter = `blur(${blur.toFixed(1)}px)`;
  ctx.drawImage(o, 0, 0, W, H);
  ctx.restore();
}
// a tapered limb along a curve: three outlines over each other, like the home page tree
function limb(pts: P[], w0: number, w1: number) {
  for (let k = 0; k < 3; k++) {
    const left: P[] = [], right: P[] = [];
    pts.forEach((q, i) => {
      const t = i / (pts.length - 1), w = lerp(w0, w1, Math.pow(t, 0.8)) / 2 + gauss() * 0.3;
      const a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, pts.length - 1)];
      const tx = b.x - a.x, ty = b.y - a.y, tl = Math.hypot(tx, ty) || 1;
      left.push({ x: q.x - (ty / tl) * w + (k - 1) * 0.4, y: q.y + (tx / tl) * w });
      right.push({ x: q.x + (ty / tl) * w + (k - 1) * 0.4, y: q.y - (tx / tl) * w });
    });
    ctx.globalAlpha = k === 2 ? 0.42 : 0.32;
    ctx.fillStyle = k === 2 ? STEM_DEEP : STEM;
    ctx.fill(pathOf([...left, ...right.reverse()]));
  }
}
function curve(p0: P, p1: P, p2: P, p3: P, n = 30): P[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    };
  });
}

/* a canopy block, as on the home page tree */
function squarePts(r: number, n = 28): P[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
    return { x: r * Math.sign(c) * Math.pow(Math.abs(c), 2 / 5.5), y: r * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / 5.5) };
  });
}
function canopy(c: P, size: number, light: string, deep: string) {
  const h = size / 2, sq = squarePts(h);
  const at = (pts: P[]) => pts.map((q) => ({ x: q.x + c.x, y: q.y + c.y }));
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = light; ctx.globalAlpha = 0.09;
  ctx.fill(pathOf(at(deform(deform(sq.map((q) => ({ x: q.x * 1.07, y: q.y * 1.07 })), 0.1), 0.08)))); // bleed
  const g = ctx.createLinearGradient(0, c.y - h, 0, c.y + h);
  g.addColorStop(0, light); g.addColorStop(1, deep);
  ctx.fillStyle = g; ctx.globalAlpha = 0.2;
  for (let i = 0; i < 6; i++) {
    const sh = { x: gauss() * 2.2 * size / 100, y: gauss() * 2.2 * size / 100 }, f = 1 - i * 0.045;
    ctx.fill(pathOf(at(deform(deform(sq.map((q) => ({ x: q.x * f + sh.x, y: q.y * f + sh.y })), 0.06), 0.05))));
  }
  ctx.fillStyle = deep; ctx.globalAlpha = 0.13;
  for (let i = 0; i < 7; i++) { // pigment pooling, mostly low
    const r = size * (0.07 + rnd() * 0.16), cx0 = (rnd() - 0.5) * size * 0.6, cy0 = (rnd() - 0.1) * size * 0.55;
    ctx.fill(pathOf(at(deform(deform(blobPts(cx0, cy0, r, r * 0.8, 0.1, 12), 0.22), 0.15))));
  }
  ctx.strokeStyle = deep; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.2;
  ctx.stroke(pathOf(at(deform(deform(sq, 0.05), 0.04)))); // where the wash dries
  ctx.restore();
}

/* ---------- the scene ---------- */
// the hill's top edge: low on the left with a soft dip, rising gently to the right under the tree
let groundY = (x: number) => 0;

function paint() {
  rnd = rngFrom(23);
  W = host.clientWidth; H = host.clientHeight; M = Math.min(W, H);
  const DPR = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  ctx = canvas.getContext('2d')!;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply';
  const narrow = W < 640;
  const base = H * 0.72;
  groundY = (x: number) => {
    const t = x / W;
    return base - H * 0.07 * Math.sin(t * Math.PI * 1.25 - 0.4) - H * 0.06 * t + H * 0.02 * Math.sin(t * 9);
  };

  /* the hill */
  const edge: P[] = [];
  for (let i = 0; i <= 60; i++) { const x = (i / 60) * (W + 40) - 20; edge.push({ x, y: groundY(x) }); }
  const hill = [...edge, { x: W + 20, y: H + 20 }, { x: -20, y: H + 20 }];
  soft(3, () => {
    wash(hill, MINT, 4, 0.55, 0.01);
    wash(hill.map((q) => ({ x: q.x, y: q.y + H * 0.04 })), SAGE, 4, 0.14, 0.012);
    wash(hill.map((q) => ({ x: q.x, y: q.y + H * 0.14 })), SAGE, 4, 0.12, 0.015);
    for (let i = 0; i < 22; i++) {
      const x = rnd() * W, y = groundY(x) + H * (0.05 + rnd() * 0.22);
      blob(x, y, M * (0.08 + rnd() * 0.12), M * (0.03 + rnd() * 0.04), rnd() < 0.6 ? SAGE : TEAL, 0.07, 3);
    }
  }, M * 0.012);
  wash(hill, SAGE, 2, 0.07, 0.01); // a crisper top edge where the grass meets the sky
  // blades of grass along the crest and dabs down the slope
  for (let i = 0; i < W / 7; i++) {
    const x = rnd() * W, y = groundY(x) + rnd() * H * 0.03, h = M * (0.01 + rnd() * 0.016), lean = gauss() * 0.5;
    ctx.globalAlpha = 0.12 + rnd() * 0.14;
    ctx.strokeStyle = rnd() < 0.6 ? SAGE : TEAL;
    ctx.lineWidth = 1 + rnd();
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.quadraticCurveTo(x + lean * h * 0.3, y - h * 0.5, x + lean * h, y - h); ctx.stroke();
  }
  for (let i = 0; i < W / 6; i++) {
    const x = rnd() * W, y = groundY(x) + H * (0.04 + rnd() * 0.24);
    blob(x, y, M * (0.004 + rnd() * 0.004), M * 0.003, rnd() < 0.7 ? SAGE : TEAL, 0.2, 2);
  }
  // a few wildflowers
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < W / 40; i++) {
    const x = rnd() * W, y = groundY(x) + H * (0.03 + rnd() * 0.18), r = M * (0.004 + rnd() * 0.003);
    ctx.globalAlpha = 0.85; ctx.fillStyle = [ROSE, PAPER, POT_LIGHT][Math.floor(rnd() * 3)];
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = 'multiply';

  /* the tree: a windswept cypress, trunk leaning, limbs reaching out to flat layered canopies */
  const tx = W * (narrow ? 0.68 : 0.74), ty = groundY(tx) + 4;
  const s = Math.min((ty - H * 0.05) / 94, W * (narrow ? 0.56 : 0.38) / 100); // tree units: 100 = its height, always fits
  soft(3, () => blob(tx + 10 * s, ty + 2 * s, 34 * s, 5 * s, DEEP, 0.18, 4), M * 0.008); // shadow on the grass
  const at = (x: number, y: number): P => ({ x: tx + x * s, y: ty - y * s });
  const trunk = curve(at(0, 0), at(-2, 18), at(3, 32), at(1, 46));
  limb(trunk, 7.5 * s, 4 * s);
  const limbs: [P, P, P, P, number, number][] = [
    [at(1, 44), at(-6, 54), at(-16, 62), at(-26, 66), 4 * s, 1.6 * s],
    [at(1, 44), at(4, 56), at(10, 66), at(18, 74), 3.6 * s, 1.5 * s],
    [at(0, 36), at(-8, 40), at(-18, 44), at(-30, 46), 3.2 * s, 1.4 * s],
    [at(2, 32), at(9, 36), at(17, 40), at(28, 44), 3.2 * s, 1.3 * s],
    [at(1, 46), at(0, 58), at(-2, 72), at(-4, 84), 3.4 * s, 1.4 * s],
    [at(2, 40), at(10, 46), at(18, 54), at(26, 58), 2.6 * s, 1.1 * s],
  ];
  for (const [a, b, c, d, w0, w1] of limbs) limb(curve(a, b, c, d, 20), w0, w1);
  // canopies: the home page tree's blocks, rounded squares of wash graded light to deep,
  // with pigment pooling low, a darker drying edge and a little bleed into the paper
  const blocks: [number, number, number, string, string][] = [
    [-29, 66, 19, MINT, TEAL], [-4, 84, 21, SAGE, DEEP], [19, 74, 19, MINT, DEEP],
    [-33, 45, 16, SAGE, TEAL], [30, 46, 17, MINT, TEAL], [-12, 62, 14, SAGE, DEEP], [29, 60, 14, SAGE, TEAL],
  ];
  for (const [x, y, size, light, deep] of blocks) canopy(at(x, y), size * s, light, deep);

  /* the person, standing on the hill, facing us */
  const px = W * (narrow ? 0.34 : 0.4), py = groundY(px) + 2;
  const u = Math.max(1, Math.min(1.5, H / 340)); // ~55px tall at a typical size
  const p = (x: number, y: number): P => ({ x: px + x * u, y: py - y * u });
  soft(2, () => blob(px + 4 * u, py + 1 * u, 11 * u, 2.2 * u, DEEP, 0.18, 3), M * 0.003); // shadow
  ctx.globalCompositeOperation = 'source-over';
  const fill = (color: string, alpha: number, pts: P[]) => { ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fill(pathOf(pts)); };
  const rr = (x0: number, y0: number, x1: number, y1: number, r: number) => {
    // a rounded rectangle in figure units (y up)
    const pts: P[] = [];
    const corners: [number, number, number][] = [[x1 - r, y1 - r, 0], [x0 + r, y1 - r, Math.PI / 2], [x0 + r, y0 + r, Math.PI], [x1 - r, y0 + r, Math.PI * 1.5]];
    for (const [cx, cy, a0] of corners) for (let i = 0; i <= 4; i++) { const a = a0 + (i / 4) * (Math.PI / 2); pts.push(p(cx + Math.cos(a) * r, cy + Math.sin(a) * r)); }
    return pts;
  };
  fill(BUD, 0.92, rr(-4.2, 0, -0.6, 19, 1.4)); // legs
  fill(BUD, 0.92, rr(0.6, 0, 4.2, 19, 1.4));
  fill(SOIL, 0.9, rr(-4.8, -0.6, -0.4, 2, 1)); // shoes
  fill(SOIL, 0.9, rr(0.4, -0.6, 4.8, 2, 1));
  fill(POT, 0.95, rr(-6.2, 17, 6.2, 34, 3)); // shirt
  fill(POT_SHADE, 0.35, rr(1.5, 17, 6.2, 34, 3));
  fill(POT, 0.95, rr(-8.2, 21, -5.2, 32, 1.5)); // arms
  fill(POT, 0.95, rr(5.2, 21, 8.2, 32, 1.5));
  fill(POT_LIGHT, 0.95, rr(-8, 18.5, -5.4, 21.5, 1.3)); // hands
  fill(POT_LIGHT, 0.95, rr(5.4, 18.5, 8, 21.5, 1.3));
  fill(POT_LIGHT, 1, rr(-1.6, 33, 1.6, 36.5, 0.8)); // neck
  ctx.globalAlpha = 1; ctx.fillStyle = POT_LIGHT;
  const h = p(0, 41.5);
  ctx.beginPath(); ctx.ellipse(h.x, h.y, 4.6 * u, 5.4 * u, 0, 0, Math.PI * 2); ctx.fill(); // head
  ctx.fillStyle = SOIL; ctx.globalAlpha = 0.95;
  ctx.beginPath(); ctx.ellipse(h.x, h.y - 2.6 * u, 5.1 * u, 3.6 * u, 0, Math.PI, Math.PI * 2.02); ctx.fill(); // hair
  for (const dx of [-3.4, -1.2, 1.2, 3.4]) { ctx.beginPath(); ctx.arc(h.x + dx * u, h.y - 4.6 * u, 1.8 * u, 0, Math.PI * 2); ctx.fill(); } // curls
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

paint();
let timer = 0, lastW = W, lastH = H;
new ResizeObserver(() => {
  clearTimeout(timer);
  timer = window.setTimeout(() => {
    if (host.clientWidth === lastW && host.clientHeight === lastH) return;
    paint(); lastW = W; lastH = H;
  }, 80);
}).observe(host);
document.fonts?.ready.then(() => { if (host.clientWidth !== lastW || host.clientHeight !== lastH) { paint(); lastW = W; lastH = H; } });
