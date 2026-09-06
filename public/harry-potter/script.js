/**
 * ═══════════════════════════════════════════════════════════
 *  CINEMATIC SCROLL ENGINE  —  script.js
 *  One single continuous video scroll. No page breaks.
 *
 *  KEY DESIGN:
 *   • Scroll fraction  =  scrollY / (pageHeight − viewportHeight)
 *   • frameIndex       =  Math.round(fraction × (TOTAL − 1))
 *   → TOP of page  = frame 0
 *   → BOTTOM of page = frame 644
 *   → All 645 frames always reachable regardless of page height
 *
 *  Frame paths generated dynamically — NO manifest.json
 *   frames/part1/frame_0001.webp … frame_0215.webp
 *   frames/part2/frame_0001.webp … frame_0215.webp
 *   frames/part3/frame_0001.webp … frame_0215.webp
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ─────────────────────────────────────────────────
   ① CONSTANTS
   ───────────────────────────────────────────────── */

const PARTS       = 3;
const PER_PART    = 215;
const TOTAL       = PARTS * PER_PART;   // 645

/** Page height in pixels.
 *  Using 800vh gives plenty of room to scroll slowly.
 *  windowInnerHeight is added so the LAST frame shows
 *  when the page is scrolled to the absolute bottom. */
const PAGE_VH     = 1500;  // vh units — taller = more scroll room per frame = smoother

/** Frames to load before revealing the canvas */
const SEED        = 60;

/** Number of frames to buffer ahead of the playhead on scroll */
const BUF_AHEAD   = 120;
const BUF_BEHIND  = 40;

/** Max images kept in RAM before evicting far ones */
const MAX_CACHE   = 300;

/** Lerp speed. 0.08 = dreamy / 0.25 = snappy */
const LERP        = 0.12;

/** Letterbox bar height (px each side) */
const LBOX        = 55;

/** Half-width of the fade-through-black transition at scene boundaries */
const TRANS_HALF  = 12;

/** Text overlays */
const OVERLAYS = [
  { frame:  12, head: 'Once upon a time…',           sub: 'The magic begins',         dur: 65 },
  { frame: 220, head: 'The Wizarding World',          sub: 'A journey like no other',  dur: 72 },
  { frame: 440, head: 'Beyond the Forbidden Forest',  sub: 'Where legends were born',  dur: 72 },
];

/* ─────────────────────────────────────────────────
   ② FRAME URL BUILDER  (pure JS, no manifest)
   ───────────────────────────────────────────────── */

/**
 * globalIndex: 0 … 644
 * Returns the URL for that frame.
 *
 *  0–214   → frames/part1/frame_0001 … frame_0215
 * 215–429  → frames/part2/frame_0001 … frame_0215
 * 430–644  → frames/part3/frame_0001 … frame_0215
 */
function frameUrl(globalIndex) {
  let part, local;

  if (globalIndex < 215) {
    part  = 'part1';
    local = globalIndex + 1;              // 1-based
  } else if (globalIndex < 430) {
    part  = 'part2';
    local = globalIndex - 215 + 1;
  } else {
    part  = 'part3';
    local = globalIndex - 430 + 1;
  }

  return `frames/${part}/frame_${String(local).padStart(4, '0')}.webp`;
}

/* ─────────────────────────────────────────────────
   ③ STATE
   ───────────────────────────────────────────────── */
const cache    = new Map();  // globalIndex → HTMLImageElement | 'loading' | 'error'
const inFlight = new Set();
let loaded   = 0;

let curF     = 0;   // current rendered frame (float, lerp output)
let tgtF     = 0;   // target frame from scroll (float)
let ready    = false;
let endProgress = 0;  // end title fade progress 0→1
let endPhase    = 0;  // end title shimmer animation phase

/* ─────────────────────────────────────────────────
   ④ DOM
   ───────────────────────────────────────────────── */
const elLoader  = document.getElementById('loader');
const elBarFill = document.getElementById('barFill');
const elBarPct  = document.getElementById('barPct');
const elPage    = document.getElementById('page');
const elCanvas  = document.getElementById('c');
const elTexts   = document.getElementById('texts');
const elCue     = document.getElementById('cue');
const elDots    = Array.from(document.querySelectorAll('.dot'));
const elEnd     = document.getElementById('endTitle');       // end sequence overlay
const elEndPcv  = document.getElementById('endParticles'); // particle canvas
const elEndTcv  = document.getElementById('endTitleCanvas');
const ectx      = elEndTcv.getContext('2d');

const ctx = elCanvas.getContext('2d', {
  alpha:              false,
  desynchronized:     true,
  willReadFrequently: false,
});

/* ─────────────────────────────────────────────────
   ⑤ SETUP
   ───────────────────────────────────────────────── */
function setup() {
  // Set the single tall scroll container height
  elPage.style.height = `${PAGE_VH}vh`;

  resizeCanvas();
  resizeEndCanvas();
  buildOverlays();
  initParticles();   // ← spawn golden dust particles

  // Preload fonts for canvas text rendering
  document.fonts.load('700 48px "Cinzel Decorative"');
  document.fonts.load('400 24px "Cinzel"');

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { resizeCanvas(); resizeEndCanvas(); }, { passive: true });

  raf();           // start render loop immediately
  startLoading();  // kick off all loading phases
}

function resizeCanvas() {
  elCanvas.width  = window.innerWidth;
  elCanvas.height = window.innerHeight;
  if (ready) drawFrame(Math.round(curF));
}

/* ─────────────────────────────────────────────────
   ⑥ SCROLL → FRAME MAPPING
   ─────────────────────────────────────────────────
   CRITICAL: we use the FRACTION approach.
   scrollFraction goes 0 → 1 across the FULL page.
   This guarantees all 645 frames are reachable.
   ───────────────────────────────────────────────── */
function onScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;

  const fraction = Math.max(0, Math.min(1, window.scrollY / maxScroll));

  // Map 0–1 → 0–644
  tgtF = fraction * (TOTAL - 1);

  // Smart buffer: load frames around the new target
  scheduleBuffer(Math.round(tgtF));

  // Hide scroll cue after first scroll
  if (window.scrollY > 80) elCue.classList.add('gone');
}

/* ─────────────────────────────────────────────────
   ⑦ LOADING ENGINE
   ───────────────────────────────────────────────── */

/**
 * Kick off all loading phases immediately and concurrently.
 * Phase A: seed (first SEED frames) → reveal canvas
 * Phase B: rest of part1 in parallel
 * Phase C: part2 in parallel
 * Phase D: part3 in parallel
 *
 * Running B/C/D concurrently means by the time the user
 * scrolls to part2 or part3, those frames are already loaded.
 */
function startLoading() {
  // Phase A — seed
  loadRange(0, SEED - 1, () => {
    ready = true;
    drawFrame(0);  // paint frame 0 before revealing
    requestAnimationFrame(() => requestAnimationFrame(() => {
      elLoader.classList.add('gone');
    }));
  });

  // Phase B — rest of part1 (starts concurrently with A)
  loadRange(SEED, 214, null);

  // Phase C — part2 (starts immediately, no need to wait for B)
  loadRange(215, 429, null);

  // Phase D — part3 (starts immediately)
  loadRange(430, 644, null);
}

/** Load indices [start..end], call onDone when all resolve */
function loadRange(start, end, onDone) {
  const count = end - start + 1;
  if (count <= 0) { if (onDone) onDone(); return; }

  let done = 0;
  const tick = () => {
    done++;
    if (!ready) {
      const pct = Math.min(100, Math.round((loaded / TOTAL) * 100));
      elBarFill.style.width = pct + '%';
      elBarPct.textContent  = pct + '%';
      elBarFill.parentElement.setAttribute('aria-valuenow', pct);
    }
    if (done >= count && onDone) onDone();
  };

  for (let i = start; i <= end; i++) fetch1(i, tick);
}

/** Load a single frame; handles deduplication & in-flight polling */
function fetch1(i, onDone) {
  if (i < 0 || i >= TOTAL) { if (onDone) onDone(); return; }

  const v = cache.get(i);
  if (v && v !== 'loading') { if (onDone) onDone(); return; }

  if (inFlight.has(i)) {
    // Already loading — wait for it
    const iv = setInterval(() => {
      if (cache.has(i) && cache.get(i) !== 'loading') {
        clearInterval(iv);
        if (onDone) onDone();
      }
    }, 40);
    return;
  }

  cache.set(i, 'loading');
  inFlight.add(i);

  const img     = new Image();
  img.decoding  = 'async';

  img.onload = () => {
    cache.set(i, img);
    inFlight.delete(i);
    loaded++;
    if (onDone) onDone();
  };

  img.onerror = () => {
    console.warn(`[Cinema] 404: ${frameUrl(i)}`);
    cache.set(i, 'error');
    inFlight.delete(i);
    loaded++;
    if (onDone) onDone();
  };

  img.src = frameUrl(i);
}

/* ─────────────────────────────────────────────────
   ⑧ SMART BUFFER (on-scroll priority preload)
   ───────────────────────────────────────────────── */
let bufRaf = null;

function scheduleBuffer(center) {
  if (bufRaf) cancelAnimationFrame(bufRaf);
  bufRaf = requestAnimationFrame(() => runBuffer(center));
}

function runBuffer(center) {
  const lo = Math.max(0,       center - BUF_BEHIND);
  const hi = Math.min(TOTAL-1, center + BUF_AHEAD);

  // Load nearest-first (forward preference for playback feel)
  for (let off = 0; off <= hi - lo; off++) {
    const f = center + off;
    const b = center - off;
    if (f <= hi && !isReady(f)) fetch1(f, null);
    if (b >= lo && b !== f && !isReady(b)) fetch1(b, null);
  }

  evict(lo, hi);
}

function isReady(i) {
  const v = cache.get(i);
  return v && v !== 'loading';
}

/** Drop images far outside the active window to free RAM */
function evict(lo, hi) {
  if (cache.size <= MAX_CACHE) return;
  for (const [idx, v] of cache) {
    if ((idx < lo || idx > hi) && v && v !== 'loading' && v !== 'error') {
      cache.delete(idx);
    }
  }
}

/* ─────────────────────────────────────────────────
   ⑨ RAF RENDER LOOP
   ───────────────────────────────────────────────── */
function raf() {
  requestAnimationFrame(raf);
  if (!ready) return;

  // Buttery-smooth interpolation with hard cap on frame step
  // Prevents "flash" jumps — never skip more than 3.5 frames per tick
  const diff = tgtF - curF;
  if (Math.abs(diff) > 0.05) {
    const lerpStep = diff * LERP;
    const MAX_STEP = 3.5;  // ≈210 frames/sec at 60fps — smooth "video" playback
    curF += Math.sign(lerpStep) * Math.min(Math.abs(lerpStep), MAX_STEP);
  } else {
    curF = tgtF;
  }

  const fi = Math.round(curF);
  drawFrame(fi);
  updateDots(fi);
  updateOverlays(fi);
  updateEndTitle(fi);     // ← end sequence trigger
  renderEndTitle();       // ← render golden title on canvas
  tickParticles();        // ← animate particles
}

/* ─────────────────────────────────────────────────
   ⑩ CANVAS DRAW
   ───────────────────────────────────────────────── */

/** Find the nearest already-loaded image to avoid black frames */
function nearestImg(idx) {
  const v = cache.get(idx);
  if (v && v !== 'loading' && v !== 'error') return v;

  for (let d = 1; d <= 25; d++) {
    const fa = cache.get(idx + d);
    if (fa && fa !== 'loading' && fa !== 'error') return fa;
    const fb = cache.get(idx - d);
    if (fb && fb !== 'loading' && fb !== 'error') return fb;
  }
  return null;
}

function drawFrame(fi) {
  const img = nearestImg(fi);
  if (!img) return;

  const W = elCanvas.width;
  const H = elCanvas.height;

  // Cover-fit (same as CSS object-fit: cover)
  const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const dw = img.naturalWidth  * scale;
  const dh = img.naturalHeight * scale;
  const dx = (W - dw) / 2;
  const dy = (H - dh) / 2;

  // Subtle zoom 1.0 → 1.025 over the full scroll
  const zoom = 1 + (fi / TOTAL) * 0.025;

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-W / 2, -H / 2);
  ctx.drawImage(img, dx, dy, dw, dh);

  // Letterbox bars
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0,      W, LBOX);
  ctx.fillRect(0, H-LBOX, W, LBOX);

  // ── Cinematic fade-through-black at scene boundaries ──
  // Exactly like Harry Potter movie scene transitions
  const transAlpha = getTransitionAlpha(fi);
  if (transAlpha > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${transAlpha})`;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();
}

/**
 * Smooth cosine-based fade-through-black at both scene boundaries.
 * Returns 0 (no overlay) to 1 (fully black) as a smooth curve.
 *
 * Scene 1→2 boundary: frame 214 / 215
 * Scene 2→3 boundary: frame 429 / 430
 */
function getTransitionAlpha(fi) {
  const boundaries = [214.5, 429.5];

  for (const center of boundaries) {
    const dist = Math.abs(fi - center);
    if (dist < TRANS_HALF) {
      // Smooth cosine curve: 1 at center, 0 at edges
      return (1 + Math.cos(Math.PI * dist / TRANS_HALF)) / 2;
    }
  }

  return 0;
}

/* ─────────────────────────────────────────────────
   ⑪ SCENE DOTS
   ───────────────────────────────────────────────── */
function updateDots(fi) {
  const s = fi < 215 ? 0 : fi < 430 ? 1 : 2;
  elDots.forEach((d, i) => d.classList.toggle('active', i === s));
}

/* ─────────────────────────────────────────────────
   ⑫ TEXT OVERLAYS
   ───────────────────────────────────────────────── */
function buildOverlays() {
  OVERLAYS.forEach((o, i) => {
    const el = document.createElement('div');
    el.className = 'txt';
    el.id = `tx${i}`;
    el.innerHTML = `<h2>${o.head}</h2><p>${o.sub}</p>`;
    elTexts.appendChild(el);
  });
}

function updateOverlays(fi) {
  OVERLAYS.forEach((o, i) => {
    const el = document.getElementById(`tx${i}`);
    if (!el) return;
    el.classList.toggle('on', fi >= o.frame && fi < o.frame + o.dur);
  });
}

/* ─────────────────────────────────────────────────
   ⑬ END TITLE SEQUENCE
   Trigger frame: 605  (last 40 of 645)
   ───────────────────────────────────────────────── */
const END_START = 605;   // frame at which end title begins fading in
const END_FADE  = 20;    // frames to reach full opacity

function updateEndTitle(fi) {
  if (fi < END_START) {
    if (elEnd.classList.contains('visible')) {
      elEnd.classList.remove('visible');
    }
    endProgress = 0;
    return;
  }

  if (!elEnd.classList.contains('visible')) {
    elEnd.classList.add('visible');
  }

  // Progressive fade: 0 at END_START → 1 at END_START + END_FADE
  endProgress = Math.min(1, (fi - END_START) / END_FADE);
}

/* ─────────────────────────────────────────────────
   ⑭ GOLDEN PARTICLE SYSTEM
   Canvas-based floating dust/spark effect
   ───────────────────────────────────────────────── */
const pctx   = elEndPcv.getContext('2d');
const SPARKS = 55;
let   sparks = [];

function initParticles() {
  elEndPcv.width  = window.innerWidth;
  elEndPcv.height = window.innerHeight;

  sparks = [];
  for (let i = 0; i < SPARKS; i++) {
    sparks.push(makeSpark(true));
  }

  // Keep particle canvas sized to window
  window.addEventListener('resize', () => {
    elEndPcv.width  = window.innerWidth;
    elEndPcv.height = window.innerHeight;
  }, { passive: true });
}

function makeSpark(randomY = false) {
  const W = elEndPcv.width  || window.innerWidth;
  const H = elEndPcv.height || window.innerHeight;
  const size = 0.8 + Math.random() * 2.4;
  return {
    x:     Math.random() * W,
    y:     randomY ? Math.random() * H : H + size,
    size,
    speed: 0.25 + Math.random() * 0.65,
    drift: (Math.random() - 0.5) * 0.35,
    alpha: 0,
    maxAlpha: 0.25 + Math.random() * 0.65,
    fadeIn:  60 + Math.random() * 80,
    life:    0,
    maxLife: 200 + Math.random() * 300,
    twinkle: Math.random() * Math.PI * 2,  // phase offset
  };
}

function tickParticles() {
  // Only animate when end title is visible
  if (!elEnd.classList.contains('visible')) {
    // Clear canvas when hidden
    pctx.clearRect(0, 0, elEndPcv.width, elEndPcv.height);
    return;
  }

  const W = elEndPcv.width;
  const H = elEndPcv.height;
  pctx.clearRect(0, 0, W, H);

  sparks.forEach((s, idx) => {
    s.life++;
    s.x += s.drift;
    s.y -= s.speed;
    s.twinkle += 0.04;

    // Fade in / out arc
    const lifeRatio = s.life / s.maxLife;
    const fadeFactor = lifeRatio < 0.15
      ? lifeRatio / 0.15
      : lifeRatio > 0.75
        ? (1 - lifeRatio) / 0.25
        : 1;

    // Twinkle variation
    const twinkle = 0.7 + 0.3 * Math.sin(s.twinkle);
    const alpha   = s.maxAlpha * fadeFactor * twinkle;

    // Draw glowing dot
    const grd = pctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
    grd.addColorStop(0,   `rgba(255, 235, 140, ${alpha})`);
    grd.addColorStop(0.4, `rgba(201, 168,  76, ${alpha * 0.7})`);
    grd.addColorStop(1,   `rgba(201, 168,  76, 0)`);

    pctx.beginPath();
    pctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
    pctx.fillStyle = grd;
    pctx.fill();

    // Solid bright core
    pctx.beginPath();
    pctx.arc(s.x, s.y, s.size * 0.45, 0, Math.PI * 2);
    pctx.fillStyle = `rgba(255, 245, 180, ${alpha})`;
    pctx.fill();

    // Recycle when off-screen or life expired
    if (s.y < -10 || s.life >= s.maxLife || s.x < -20 || s.x > W + 20) {
      sparks[idx] = makeSpark(false);
    }
  });
}

/* ─────────────────────────────────────────────────
   ⑮ END TITLE CANVAS — GOLDEN TITLE RENDERER
   Renders "HARRY POTTER" with multi-layer glow,
   animated shimmer gradient, decorative flourishes
   ───────────────────────────────────────────────── */

function resizeEndCanvas() {
  elEndTcv.width  = window.innerWidth;
  elEndTcv.height = window.innerHeight;
}

function renderEndTitle() {
  const W = elEndTcv.width;
  const H = elEndTcv.height;

  ectx.clearRect(0, 0, W, H);
  if (endProgress <= 0) return;

  endPhase += 0.012;

  const alpha = Math.min(1, endProgress * 1.5);

  // ── Dynamic sizing ──
  const titleSize = Math.min(W * 0.09, H * 0.14, 110);
  const subSize   = Math.min(W * 0.022, 22);
  const cx = W / 2;
  const cy = H / 2 - titleSize * 0.15;

  // Gentle floating motion
  const floatY = Math.sin(endPhase * 0.6) * 6;

  ectx.save();
  ectx.globalAlpha = alpha;

  // ═══ DECORATIVE STARS ═══
  const starSize  = Math.max(11, titleSize * 0.16);
  const starY     = cy - titleSize * 0.85 + floatY;
  const starAlpha = 0.4 + 0.35 * Math.sin(endPhase * 1.8);

  ectx.font         = `${starSize}px serif`;
  ectx.textAlign    = 'center';
  ectx.textBaseline = 'middle';
  ectx.fillStyle    = `rgba(201, 168, 76, ${starAlpha})`;
  ectx.shadowColor  = `rgba(201, 168, 76, ${starAlpha * 0.8})`;
  ectx.shadowBlur   = 12;
  ectx.fillText('✦     ✦     ✦', cx, starY);

  // ═══ TITLE — GLOW LAYERS (back → front) ═══
  ectx.font         = `700 ${titleSize}px 'Cinzel Decorative', serif`;
  ectx.textAlign    = 'center';
  ectx.textBaseline = 'middle';
  const ty = cy + floatY;

  // Layer 1 — outer bloom
  ectx.shadowColor = 'rgba(201, 168, 76, 0.5)';
  ectx.shadowBlur  = 80;
  ectx.fillStyle   = 'rgba(201, 168, 76, 0.08)';
  ectx.fillText('HARRY POTTER', cx, ty);
  ectx.fillText('HARRY POTTER', cx, ty);

  // Layer 2 — mid glow
  ectx.shadowColor = 'rgba(240, 208, 128, 0.7)';
  ectx.shadowBlur  = 35;
  ectx.fillStyle   = 'rgba(240, 208, 128, 0.2)';
  ectx.fillText('HARRY POTTER', cx, ty);

  // Layer 3 — inner glow
  ectx.shadowColor = 'rgba(255, 245, 180, 0.85)';
  ectx.shadowBlur  = 10;
  ectx.fillStyle   = 'rgba(255, 245, 180, 0.35)';
  ectx.fillText('HARRY POTTER', cx, ty);

  // ═══ MAIN TEXT — Animated gold shimmer gradient ═══
  ectx.shadowBlur  = 0;
  ectx.shadowColor = 'transparent';

  const metrics = ectx.measureText('HARRY POTTER');
  const tw = metrics.width;

  const grad = ectx.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
  const shimmer = (Math.sin(endPhase * 0.8) + 1) / 2;

  grad.addColorStop(0,                              '#6b4d14');
  grad.addColorStop(Math.max(0,   shimmer - 0.18),  '#c9a84c');
  grad.addColorStop(shimmer,                         '#f5e070');
  grad.addColorStop(Math.min(1,   shimmer + 0.18),  '#c9a84c');
  grad.addColorStop(1,                              '#6b4d14');

  ectx.fillStyle = grad;
  ectx.fillText('HARRY POTTER', cx, ty);

  // ═══ GOLD DIVIDER LINE ═══
  const divY     = ty + titleSize * 0.65 + floatY * 0.5;
  const divW     = Math.min(tw * 0.45, 220);
  const divAlpha = 0.5 + 0.4 * Math.sin(endPhase * 1.2);

  const divGrad = ectx.createLinearGradient(cx - divW, 0, cx + divW, 0);
  divGrad.addColorStop(0,   'transparent');
  divGrad.addColorStop(0.2, `rgba(201, 168, 76, ${divAlpha * 0.5})`);
  divGrad.addColorStop(0.5, `rgba(240, 208, 128, ${divAlpha})`);
  divGrad.addColorStop(0.8, `rgba(201, 168, 76, ${divAlpha * 0.5})`);
  divGrad.addColorStop(1,   'transparent');

  ectx.shadowColor = `rgba(201, 168, 76, ${divAlpha * 0.6})`;
  ectx.shadowBlur  = 8;
  ectx.fillStyle   = divGrad;
  ectx.fillRect(cx - divW, divY, divW * 2, 1.5);
  ectx.shadowBlur  = 0;
  ectx.shadowColor = 'transparent';

  // ═══ SUBTITLE ═══
  const subY = divY + subSize * 2.5;
  ectx.font      = `400 ${subSize}px 'Cinzel', serif`;
  ectx.textAlign = 'center';

  const subFlicker = 0.6 + 0.2 * Math.sin(endPhase * 0.55);
  ectx.shadowColor = `rgba(201, 168, 76, ${subFlicker * 0.5})`;
  ectx.shadowBlur  = 14;
  ectx.fillStyle   = `rgba(240, 208, 128, ${subFlicker})`;
  ectx.fillText('T H E   C I N E M A T I C   E X P E R I E N C E', cx, subY);

  // ═══ BOTTOM DECORATIVE STARS ═══
  const bStarY = subY + subSize * 2.2;
  ectx.font      = `${Math.max(9, starSize * 0.8)}px serif`;
  ectx.fillStyle = `rgba(201, 168, 76, ${starAlpha * 0.7})`;
  ectx.shadowBlur = 8;
  ectx.fillText('✦', cx, bStarY);

  // ═══ MADE BY GD ═══
  const madeBySize = Math.min(W * 0.013, 14);
  const madeByY    = bStarY + madeBySize * 3;
  ectx.font        = `400 ${madeBySize}px 'Cinzel', serif`;
  const madeByAlpha = 0.35 + 0.15 * Math.sin(endPhase * 0.4);
  ectx.shadowColor = `rgba(201, 168, 76, ${madeByAlpha * 0.4})`;
  ectx.shadowBlur  = 8;
  ectx.fillStyle   = `rgba(201, 168, 76, ${madeByAlpha})`;
  ectx.fillText('M A D E   B Y', cx, madeByY);

  // "GD" — larger, bolder, with its own golden shimmer
  const gdSize = Math.min(W * 0.028, 30);
  const gdY    = madeByY + gdSize * 1.4;
  ectx.font    = `700 ${gdSize}px 'Cinzel Decorative', serif`;

  const gdGrad = ectx.createLinearGradient(cx - gdSize * 2, 0, cx + gdSize * 2, 0);
  const gdShimmer = (Math.sin(endPhase * 1.1 + 1.5) + 1) / 2;
  gdGrad.addColorStop(0,                                '#7a5c10');
  gdGrad.addColorStop(Math.max(0, gdShimmer - 0.2),     '#c9a84c');
  gdGrad.addColorStop(gdShimmer,                         '#f5e070');
  gdGrad.addColorStop(Math.min(1, gdShimmer + 0.2),     '#c9a84c');
  gdGrad.addColorStop(1,                                '#7a5c10');

  ectx.shadowColor = 'rgba(201, 168, 76, 0.6)';
  ectx.shadowBlur  = 20;
  ectx.fillStyle   = gdGrad;
  ectx.fillText('GD', cx, gdY);

  ectx.restore();
}

/* ─────────────────────────────────────────────────
   ⑯ BOOT
   ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', setup);
