/*
  The painting behind the About photos. Compiled at build time and inlined right after its
  canvas at the end of the About article (see AboutBranches.astro), so it draws while the page
  is parsed, before the first frame, and is already there when the page pans in.
*/

  type P = { x: number; y: number };
  type R = { x: number; y: number; w: number; h: number; cx: number; cy: number; r: number; b: number };

  const canvas = document.currentScript!.previousElementSibling as HTMLCanvasElement;
  const host = canvas.parentElement!;
  const ctx = canvas.getContext('2d')!;
  const css = getComputedStyle(document.documentElement);
  const C = (n: string) => css.getPropertyValue(`--color-${n}`).trim();
  const STEM = C('stem'), STEM_DEEP = C('stem-deep'), BUD = C('bud');
  const LEAVES = [C('leaf-sage'), C('leaf-teal'), C('leaf-deep')];
  const MINT = C('leaf-mint');

  // seeded, so the painting is the same on every visit
  const rngFrom = (seed: number) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let rnd = rngFrom(7);
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  /* ---------- paint ---------- */
  function deform(pts: P[], v: number): P[] {
    const out: P[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const len = Math.hypot(b.x - a.x, b.y - a.y), ang = rnd() * Math.PI * 2, d = gauss() * len * v;
      out.push(a, { x: (a.x + b.x) / 2 + Math.cos(ang) * d, y: (a.y + b.y) / 2 + Math.sin(ang) * d });
    }
    return out;
  }
  function fillPts(pts: P[]) {
    ctx.beginPath();
    pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
    ctx.closePath();
    ctx.fill();
  }
  // many translucent, slightly different copies of one shape: soft bleeding edges, pooled middle
  function wash(shape: P[], color: string, layers: number, alpha: number, v: number) {
    const base = deform(deform(shape, v * 1.6), v);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    for (let i = 0; i < layers; i++) fillPts(deform(deform(base, v), v * 0.8));
  }
  // foliage behind a photo: uneven clusters of soft round washes peeking out from its edges,
  // mostly along the top and the upper corners, the way leaves would show around a canopy
  function blob(cx: number, cy: number, r: number, color: string, alpha: number) {
    const pts: P[] = Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.85 };
    });
    wash(pts, color, 7, alpha, 0.14);
  }
  function foliage(r: R, count: number, size: number) {
    const per = 2 * (r.w + r.h);
    for (let i = 0; i < count; i++) {
      // a point on the edge, biased toward the top, and which way is outward from there
      let d = rnd() * per, x: number, y: number, out: number;
      if (rnd() < 0.55) d = rnd() * r.w; // top edge
      if (d < r.w) { x = r.x + d; y = r.y; out = -Math.PI / 2; }
      else if (d < r.w + r.h) { x = r.r; y = r.y + (d - r.w) * (rnd() < 0.7 ? 0.5 : 1); out = 0; }
      else if (d < 2 * r.w + r.h) { x = r.x + (d - r.w - r.h); y = r.b; out = Math.PI / 2; }
      else { x = r.x; y = r.y + (d - 2 * r.w - r.h) * (rnd() < 0.7 ? 0.5 : 1); out = Math.PI; }
      // a clump: two or three overlapping washes of different sizes, a leaf or two poking out
      const n = 2 + Math.floor(rnd() * 2);
      for (let j = 0; j < n; j++) {
        const rr = size * (0.35 + rnd() * 0.8);
        const col = rnd() < 0.25 ? MINT : LEAVES[rnd() < 0.6 ? 0 : 1];
        blob(x + gauss() * size * 0.6, y + gauss() * size * 0.5, rr, col, col === MINT ? 0.13 : 0.065);
      }
      if (rnd() < 0.6) leaf(x + Math.cos(out) * size * 0.3, y + Math.sin(out) * size * 0.3, out + gauss() * 0.7, size * (0.55 + rnd() * 0.3));
    }
  }

  function leaf(x: number, y: number, ang: number, len: number) {
    const pts: P[] = [], n = 8, w = len * 0.38;
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push({ x: len * t, y: -w * Math.pow(Math.sin(Math.PI * t), 0.85) * (1 - 0.25 * t) }); }
    for (let i = n - 1; i > 0; i--) { const t = i / n; pts.push({ x: len * t, y: w * Math.pow(Math.sin(Math.PI * t), 0.85) * (1 - 0.25 * t) }); }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    wash(pts, LEAVES[Math.floor(rnd() * 3)], 6, 0.15, 0.05);
    ctx.restore();
  }
  // a little spray of leaves fanning around `ang`
  function leaves(x: number, y: number, ang: number, size: number, count = 4) {
    for (let i = 0; i < count; i++) leaf(x, y, ang + (i - (count - 1) / 2) * 0.55 + gauss() * 0.15, size * (0.8 + rnd() * 0.35));
  }

  // a cubic curve sampled into points
  // with a gentle wobble across it, so it grows like a branch rather than a pipe
  function curve(p0: P, p1: P, p2: P, p3: P, n = 48, wobble = 3): P[] {
    const ph = rnd() * 6, f = 2 + rnd() * 1.5;
    const pts = Array.from({ length: n + 1 }, (_, i) => {
      const t = i / n, u = 1 - t;
      return {
        x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
        y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
      };
    });
    return pts.map((q, i) => {
      const a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, n)];
      const tx = b.x - a.x, ty = b.y - a.y, tl = Math.hypot(tx, ty) || 1, t = i / n;
      const off = Math.sin(t * Math.PI * f + ph) * wobble * Math.sin(t * Math.PI); // ends stay put
      return { x: q.x - (ty / tl) * off, y: q.y + (tx / tl) * off };
    });
  }
  // a tapered stem: three slightly different outlines painted over each other, like the tree's
  function stem(pts: P[], w0: number, w1: number) {
    for (let k = 0; k < 3; k++) {
      const left: P[] = [], right: P[] = [];
      pts.forEach((q, i) => {
        const t = i / (pts.length - 1), w = lerp(w0, w1, Math.pow(t, 0.8)) / 2 + gauss() * 0.4;
        const a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, pts.length - 1)];
        const tx = b.x - a.x, ty = b.y - a.y, tl = Math.hypot(tx, ty) || 1;
        const ox = (-ty / tl) * w, oy = (tx / tl) * w, shift = (k - 1) * 0.5;
        left.push({ x: q.x + ox + shift, y: q.y + oy });
        right.push({ x: q.x - ox + shift, y: q.y - oy });
      });
      ctx.globalAlpha = k === 2 ? 0.38 : 0.3;
      ctx.fillStyle = k === 2 ? STEM_DEEP : STEM;
      fillPts([...left, pts[pts.length - 1], ...right.reverse()]);
    }
  }
  // a thin twig off a stem with a square bud at its end
  function twig(from: P, ang: number, len: number) {
    const mid = { x: from.x + Math.cos(ang) * len * 0.5 + gauss() * 3, y: from.y + Math.sin(ang) * len * 0.5 };
    const end = { x: from.x + Math.cos(ang - 0.35) * len, y: from.y + Math.sin(ang - 0.35) * len };
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = STEM;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(mid.x, mid.y, end.x, end.y);
    ctx.stroke();
    const s = 6 + rnd() * 2;
    ctx.save();
    ctx.translate(end.x, end.y);
    ctx.rotate(gauss() * 0.3);
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = BUD;
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.restore();
  }
  // the sample nearest a given y (or x)
  const nearest = (pts: P[], key: 'x' | 'y', v: number) => pts.reduce((a, b) => (Math.abs(b[key] - v) < Math.abs(a[key] - v) ? b : a));

  /* ---------- layout ---------- */
  function rectOf(el: Element): R {
    const a = host.getBoundingClientRect(), r = el.getBoundingClientRect();
    const x = r.left - a.left, y = r.top - a.top;
    return { x, y, w: r.width, h: r.height, cx: x + r.width / 2, cy: y + r.height / 2, r: x + r.width, b: y + r.height };
  }

  function draw() {
    const slots = [...host.querySelectorAll('.photo-slot')];
    if (slots.length < 4) return;
    // paint a little past the content so foliage isn't cut off, but never past the page edge
    const hr = host.getBoundingClientRect();
    const pad = Math.max(0, Math.min(48, Math.floor(hr.left), Math.floor(document.documentElement.clientWidth - hr.right)));
    Object.assign(canvas.style, { left: `${-pad}px`, top: `${-pad}px`, width: `${host.offsetWidth + pad * 2}px`, height: `${host.offsetHeight + pad * 2}px` });
    const W = host.offsetWidth, H = host.offsetHeight, DPR = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round((W + pad * 2) * DPR); canvas.height = Math.round((H + pad * 2) * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, pad * DPR, pad * DPR);
    ctx.clearRect(-pad, -pad, W + pad * 2, H + pad * 2);
    ctx.globalCompositeOperation = 'multiply';
    rnd = rngFrom(7);

    const [P, L, M, Rr] = slots.map(rectOf);
    const big = matchMedia('(min-width: 640px)').matches;
    // the tall trunk only where it clears the writing: measure where the text actually ends
    const a = host.getBoundingClientRect();
    let textRight = 0;
    for (const el of host.querySelectorAll('p, h1, h2')) {
      const range = document.createRange();
      range.selectNodeContents(el);
      for (const box of range.getClientRects()) textRight = Math.max(textRight, box.right - a.left);
    }
    const wide = big && textRight + 24 < Math.min(Rr.cx, P.cx) - 40;
    const rowBottom = Math.max(L.b, M.b, Rr.b), rowTop = Math.min(L.y, M.y, Rr.y);
    const k = big ? 1 : 0.7; // stem thickness

    // foliage peeking out from behind every photo, the crown fullest
    foliage(P, big ? 16 : 11, big ? 24 : 16);
    for (const r of [L, M, Rr]) foliage(r, big ? 9 : 5, big ? 18 : 10);

    if (wide) {
      // the trunk: from the ground below the row, behind the right photo, up to the crown
      const base = { x: Rr.cx + 6, y: rowBottom + 66 };
      const top = { x: P.cx, y: P.b - 30 };
      const trunk = curve(base, { x: Rr.cx - 24, y: lerp(base.y, top.y, 0.35) }, { x: P.cx + 34, y: lerp(base.y, top.y, 0.7) }, top, 80, 6);
      // the bough under the row, reaching up into the left and middle photos
      const fork = nearest(trunk, 'y', rowBottom + 30);
      const bough = curve(fork, { x: M.cx + 60, y: rowBottom + 70 }, { x: L.cx + 110, y: rowBottom + 62 }, { x: L.cx, y: L.b - 26 }, 60, 5);
      const split = nearest(bough, 'x', M.cx + 70);
      const limb = curve(split, { x: split.x - 40, y: split.y - 6 }, { x: M.cx + 10, y: rowBottom + 24 }, { x: M.cx, y: M.b - 26 }, 40, 2);

      // a soft rose puddle where the trunk meets the ground, like the pot's shadow
      const puddle: P[] = Array.from({ length: 20 }, (_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return { x: base.x + Math.cos(a) * 46, y: base.y + 4 + Math.sin(a) * 7 };
      });
      wash(puddle, C('wash-rose'), 8, 0.08, 0.08);

      stem(trunk, 15 * k, 6 * k);
      stem(bough, 9 * k, 4 * k);
      stem(limb, 6 * k, 3 * k);

      // twigs on the open stretch of trunk between the crown and the row
      const gapTop = P.b + 30, gapBottom = rowTop - 70;
      if (gapBottom > gapTop) {
        [0.2, 0.5, 0.8].forEach((t, i) => {
          const p = nearest(trunk, 'y', lerp(gapBottom, gapTop, t));
          twig(p, i % 2 ? -0.4 : Math.PI + 0.4, 22 + rnd() * 10);
        });
      }
      twig(nearest(bough, 'x', lerp(L.cx, M.cx, 0.5)), Math.PI / 2 + 0.5, 18);
      twig(nearest(bough, 'x', lerp(M.cx, Rr.cx, 0.45)), Math.PI / 2 - 0.2, 16);

      // leaves peeking out where the branches meet the canopies
      leaves(P.x + 4, P.b - 18, Math.PI * 0.85, 15, 3);
      leaves(P.r - 6, P.b - 10, Math.PI * 0.2, 14, 3);
      leaves(P.r - 8, P.y + 40, -Math.PI * 0.15, 13, 3);
      leaves(L.x + 30, L.b - 6, Math.PI * 0.75, 13, 3);
      leaves(M.r - 24, M.b - 6, Math.PI * 0.3, 12, 3);
      leaves(Rr.r - 10, Rr.y + 26, -Math.PI * 0.2, 13, 3);
    } else {
      // phones: a short trunk below the row with boughs into all three photos
      const base = { x: M.cx + 4, y: rowBottom + 52 };
      const trunk = curve(base, { x: M.cx - 4, y: rowBottom + 34 }, { x: M.cx + 4, y: rowBottom + 14 }, { x: M.cx, y: M.b - 14 }, 30);
      const fork = nearest(trunk, 'y', rowBottom + 24);
      const left = curve(fork, { x: lerp(fork.x, L.cx, 0.4), y: rowBottom + 34 }, { x: L.cx + 16, y: rowBottom + 26 }, { x: L.cx, y: L.b - 14 }, 30);
      const right = curve(fork, { x: lerp(fork.x, Rr.cx, 0.4), y: rowBottom + 34 }, { x: Rr.cx - 16, y: rowBottom + 26 }, { x: Rr.cx, y: Rr.b - 14 }, 30);
      stem(trunk, 11 * k, 5 * k);
      stem(left, 7 * k, 3 * k);
      stem(right, 7 * k, 3 * k);
      twig(nearest(left, 'x', lerp(L.cx, M.cx, 0.5)), Math.PI / 2 + 0.4, 14);
      twig(nearest(right, 'x', lerp(M.cx, Rr.cx, 0.55)), Math.PI / 2 - 0.3, 14);

      // the portrait's own sprig, out into the space beside it
      if (W - P.r > 60) {
        const sprig = curve({ x: P.r - 30, y: P.b - 50 }, { x: P.r + 10, y: P.b - 60 }, { x: P.r + 30, y: P.b - 90 }, { x: P.r + 44, y: P.b - 128 }, 30);
        stem(sprig, 7, 2.5);
        twig(nearest(sprig, 'y', P.b - 78), -0.3, 16);
        leaves(P.r + 44, P.b - 128, -Math.PI / 2, 14, 5);
      }
      leaves(P.x + 4, P.b - 14, Math.PI * 0.8, 12, 3);
      leaves(L.x + 16, L.b - 4, Math.PI * 0.75, 10, 3);
      leaves(Rr.r - 14, Rr.b - 4, Math.PI * 0.25, 10, 3);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  let timer = 0;
  const redraw = () => { clearTimeout(timer); timer = window.setTimeout(draw, 60); };
  new ResizeObserver(redraw).observe(host);
  host.querySelectorAll('img').forEach((img) => img.addEventListener('load', redraw));
  draw();
  document.fonts?.ready.then(redraw);
