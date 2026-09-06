// main.js — Absolute Cinema | Final Clean Build

// ==========================================
// 1. ENGINE CONFIGURATION & STATE
// ==========================================
const TOTAL_SCENES   = 12;          // Exactly 12 scene folders exist
const SCENE_FRAMES   = 191;        // Each scene has 191 frames
const PIXELS_PER_FRAME = 28;       // Scroll speed — higher = slower scroll required
const TRIM_START     = 5;          // Cut first 5 frames of each scene (remove overlap seam)

// ── Precompute O(1) virtual frame → {scene, frame} lookup table ──────────────
const sceneMap = [];
// Scene 1: full 191 frames, no trim
for (let f = 0; f < SCENE_FRAMES; f++) sceneMap.push({ s: 0, f });
// Scenes 2-8: skip first TRIM_START frames to remove repeat
for (let sc = 1; sc < TOTAL_SCENES; sc++) {
    for (let f = TRIM_START; f < SCENE_FRAMES; f++) sceneMap.push({ s: sc, f });
}
const TOTAL_VIRTUAL_FRAMES = sceneMap.length;

// Find the first virtual frame that belongs to scene 8 (index 7)
const SCENE8_START_VFRAME = sceneMap.findIndex(x => x.s === 7);

const padNum = (n) => String(n).padStart(4, '0');

const state = {
    currentFrame:       0,
    targetFrame:        0,
    sceneImages:        Array.from({ length: TOTAL_SCENES }, () => []),
    loadedFrames:       0,
    totalInitFrames:    SCENE_FRAMES,   // Only wait for scene 1
    lastRenderedInt:    -1,
    lazyConfig: { scene: 2, idx: 1 }
};

// ==========================================
// 2. CINEMATIC TEXT SCHEDULE
// ==========================================
// All startFrame / endFrame are in VIRTUAL frame units (sceneMap indices)
// Scene boundaries in virtual frames:
//   Scene 1: 0 – 190                      (191 frames)
//   Scene 2: 191 – (191 + 186 - 1) = 376  (186 frames each after trim=5)
//   Scene N start ≈ 191 + (N-2)*186
const S = (scene, localFrame) => {
    if (scene === 1) return localFrame;
    return SCENE_FRAMES + (scene - 2) * (SCENE_FRAMES - TRIM_START) + (localFrame - TRIM_START);
};

const textSchedule = [
    // ── Scene 1 ──
    { start: S(1,10),  end: S(1,75),  effect: 'left',  pos: 'pos-left',   text: 'Silence...' },
    { start: S(1,85),  end: S(1,150), effect: 'rise',  pos: 'pos-center', text: 'Then... [glow]motion.[/glow]' },

    // ── Scene 2 ──
    { start: S(2,20),  end: S(2,80),  effect: 'zoom',   pos: 'pos-center', text: "You don't chase it." },
    { start: S(2,30),  end: S(2,80),  effect: 'rotate', pos: 'pos-center', style: 'margin-top:5rem;font-size:2.5rem;', text: 'It [glow]pulls[/glow] you in.' },

    // ── Scene 3 ──
    { start: S(3,15),  end: S(3,80),  effect: 'right', pos: 'pos-right',  text: 'And then— everything [glow]shifts.[/glow]' },

    // ── Scene 4 ──
    { start: S(4,20),  end: S(4,100), effect: 'rise',  pos: 'pos-left',   text: 'You start to [glow]see.[/glow]' },

    // ── Scene 5 ──
    { start: S(5,20),  end: S(5,90),  effect: 'left',  pos: 'pos-center', style: 'font-family:"Inter",sans-serif;', text: 'This is not just visual.' },
    { start: S(5,40),  end: S(5,90),  effect: 'right', pos: 'pos-center', style: 'margin-top:5rem;font-weight:300;', text: 'This is [glow]feeling.[/glow]' },

    // ── Scene 6 ──
    { start: S(6,20),  end: S(6,90),  effect: 'rise',  pos: 'pos-center', text: 'Beyond the [glow]horizon.[/glow]' },

    // ── Scene 7 ──
    { start: S(7,20),  end: S(7,90),  effect: 'left',  pos: 'pos-left',   text: 'Every frame, a [glow]memory.[/glow]' },

    // ── Scene 8 — RAMSETU (not at end, triggers mid-scene) ──
    { start: SCENE8_START_VFRAME + 20,
      end:   SCENE8_START_VFRAME + 160,
      effect: 'cinematic-rise',
      pos: 'pos-center',
      extraClass: 'rameshwaram-text-layer',
      text: 'RAMESHWARAM' },
];

// ==========================================
// 3. TEXT NODE BUILDER
// ==========================================
function buildTextNodes() {
    const container = document.getElementById('text-container');
    if (!container) return;

    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.getAll().forEach(t => t.kill());
    container.innerHTML = '';

    textSchedule.forEach(item => {
        const el    = document.createElement('div');
        const inner = document.createElement('div');

        el.className    = 'cinematic-text ' + item.pos + (item.extraClass ? ' ' + item.extraClass : '');
        inner.className = 'cinematic-text-inner';
        if (item.style) el.style.cssText = item.style;

        let html = item.text
            .replace(/\[glow\](.*?)\[\/glow\]/g, "<span class='text-glow'>$1</span>")
            .replace(/\[bold\](.*?)\[\/bold\]/g, "<span class='text-bold'>$1</span>");
        inner.innerHTML = html;
        el.appendChild(inner);
        container.appendChild(el);

        if (typeof gsap === 'undefined') return;

        const startPx = item.start * PIXELS_PER_FRAME;
        const endPx   = item.end   * PIXELS_PER_FRAME;

        const isCinematic = item.effect === 'cinematic-rise';

        gsap.timeline({
            scrollTrigger: { start: () => startPx, end: () => endPx, scrub: 1.2 }
        })
        .fromTo(el,
            {
                opacity: 0,
                y: (isCinematic || item.effect === 'rise') ? 60 : 0,
                x: item.effect === 'left' ? -80 : item.effect === 'right' ? 80 : 0,
                scale: item.effect === 'zoom' ? 0.85 : 1,
                filter: 'blur(18px)',
                rotationZ: item.effect === 'rotate' ? 5 : 0,
            },
            {
                opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)', rotationZ: 0,
                duration: isCinematic ? 1.2 : 0.45, ease: 'power2.out'
            }
        )
        .to(el, { scale: 1.04, duration: 0.15, ease: 'none' })
        .to(el, {
            opacity: 0,
            y: (isCinematic || item.effect === 'rise') ? -40 : 0,
            filter: 'blur(18px)', scale: 0.96,
            duration: isCinematic ? 1.2 : 0.45, ease: 'power2.in'
        });
    });
}

// ==========================================
// 4. FRAME LOADER & LAZY ENGINE
// ==========================================
async function initializePreload() {
    // Load scene 1 fully before starting — show progress
    const promises = [];
    for (let i = 1; i <= SCENE_FRAMES; i++) {
        promises.push(
            loadFrame('./scene1/', i, true).then(img => { state.sceneImages[0][i - 1] = img; })
        );
    }
    try {
        await Promise.all(promises);
        startCinemaExperience();
        setTimeout(lazyLoad, 200);
    } catch (e) {
        console.error('Preload failed:', e);
        const txt = document.querySelector('.loader-text');
        if (txt) txt.textContent = 'Load Error — Refresh';
    }
}

function updateLoader() {
    const pct = Math.min(Math.floor(state.loadedFrames / state.totalInitFrames * 100), 100);
    const txt = document.querySelector('.loader-text');
    const bar = document.querySelector('.loader-bar-fill');
    if (txt) txt.textContent = `Loading ${pct}%`;
    if (bar) bar.style.width = pct + '%';
}

function lazyLoad() {
    const cfg = state.lazyConfig;
    if (cfg.scene > TOTAL_SCENES) return;   // All done

    const sceneNum = cfg.scene;
    const start    = cfg.idx;
    const end      = Math.min(start + 12 - 1, SCENE_FRAMES);

    if (start > SCENE_FRAMES) {
        cfg.scene++;
        cfg.idx = 1;
        setTimeout(lazyLoad, 30);
        return;
    }

    const batch = [];
    for (let i = start; i <= end; i++) batch.push(loadFrame(`./scene${sceneNum}/`, i, false));

    Promise.allSettled(batch).then(results => {
        results.forEach((r, i) => {
            if (r.status === 'fulfilled' && r.value) {
                state.sceneImages[sceneNum - 1][start - 1 + i] = r.value;
            }
        });
        cfg.idx = end + 1;
        state.lastRenderedInt = -1;
        setTimeout(lazyLoad, 50);
    });
}

function loadFrame(dir, index, notify) {
    return new Promise(resolve => {
        const done = (res) => {
            if (notify) { state.loadedFrames++; updateLoader(); }
            resolve(res);
        };
        const img = new Image();
        img.src = `${dir}frame_${padNum(index)}.webp`;
        img.onload = async () => {
            try   { done(await createImageBitmap(img)); }
            catch { done(img); }
        };
        img.onerror = () => done(null);
    });
}

// ==========================================
// 5. RENDER ENGINE
// ==========================================
function renderMasterFrame(vf) {
    const canvas = document.getElementById('cinema-canvas');
    if (!canvas) return;
    const ctx  = canvas.getContext('2d', { alpha: false });
    const rect = canvas.getBoundingClientRect();

    ctx.globalAlpha = 1;
    ctx.fillStyle   = '#000';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const fi      = Math.max(0, Math.min(Math.floor(vf), TOTAL_VIRTUAL_FRAMES - 1));
    const mapping = sceneMap[fi];
    if (!mapping) return;

    const { s: si, f: rf } = mapping;
    const localOffset       = rf - (si === 0 ? 0 : TRIM_START);
    const effectiveLen      = SCENE_FRAMES - TRIM_START;

    // Cross-fade transition: first 18 virtual frames of a new scene
    if (si > 0 && localOffset < 18) {
        const alpha    = localOffset / 18;
        const prevArry = state.sceneImages[si - 1];
        const currArry = state.sceneImages[si];

        if (prevArry && prevArry[SCENE_FRAMES - 1])
            drawFrame(ctx, rect, prevArry[SCENE_FRAMES - 1], 1.0, 1.0 + alpha * 0.04);

        if (currArry && currArry[rf])
            drawFrame(ctx, rect, currArry[rf], alpha, 1.04 - alpha * 0.04);

    } else {
        const arr   = state.sceneImages[si];
        const scale = 1.0 + (localOffset / effectiveLen) * 0.035;
        if (arr && arr[rf]) drawFrame(ctx, rect, arr[rf], 1.0, scale);
    }
}

function drawFrame(ctx, rect, img, opacity, scale) {
    if (!img) return;
    const w = img.width  || img.naturalWidth;
    const h = img.height || img.naturalHeight;
    if (!w || !h) return;

    const r  = Math.max(rect.width / w, rect.height / h) * scale;
    const cx = (rect.width  - w * r) / 2;
    const cy = (rect.height - h * r) / 2;

    ctx.globalAlpha = opacity;
    ctx.drawImage(img, 0, 0, w, h, cx, cy, w * r, h * r);
}

// ==========================================
// 6. ANIMATION LOOP
// ==========================================
let _lastTime  = 0;
let _fps       = 0;
let _fpsSmooth = 60;

function animate(now) {
    // Inertia easing — feels buttery
    state.currentFrame += (state.targetFrame - state.currentFrame) * 0.09;
    if (state.currentFrame < 0) state.currentFrame = 0;

    const ci = Math.floor(state.currentFrame);
    if (ci !== state.lastRenderedInt || Math.abs(state.targetFrame - state.currentFrame) > 0.01) {
        renderMasterFrame(state.currentFrame);
        state.lastRenderedInt = ci;
    }

    // FPS debug
    if (_lastTime) {
        _fps = 1000 / (now - _lastTime);
        _fpsSmooth = _fpsSmooth * 0.9 + _fps * 0.1;
        const dbg = document.getElementById('debug-fps');
        if (dbg) dbg.textContent = Math.round(_fpsSmooth);
    }
    _lastTime = now;

    // Debug panel
    const dc = document.getElementById('debug-curr');
    const dt = document.getElementById('debug-target');
    const ds = document.getElementById('debug-scene');
    if (dc) dc.textContent   = Math.floor(state.currentFrame);
    if (dt) dt.textContent   = Math.floor(state.targetFrame);
    if (ds && sceneMap[Math.floor(state.currentFrame)])
        ds.textContent = sceneMap[Math.floor(state.currentFrame)].s + 1;

    requestAnimationFrame(animate);
}

// ==========================================
// 7. SCROLL HEIGHT
// ==========================================
function setScrollHeight() {
    const h     = TOTAL_VIRTUAL_FRAMES * PIXELS_PER_FRAME + window.innerHeight;
    const track = document.querySelector('.scroll-track');
    if (track) track.style.height = h + 'px';
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
}

// ==========================================
// 8. SMOOTH SCROLL (Lenis — single RAF)
// ==========================================
let lenis = null;

function initLenis() {
    if (typeof Lenis === 'undefined') {
        // Fallback plain scroll
        window.addEventListener('scroll', () => {
            state.targetFrame = Math.min(
                (window.scrollY || window.pageYOffset) / PIXELS_PER_FRAME,
                TOTAL_VIRTUAL_FRAMES - 1
            );
        }, { passive: true });
        return;
    }

    lenis = new Lenis({
        duration:       1.2,
        easing:         t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel:    true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.8,
    });

    lenis.on('scroll', ({ scroll }) => {
        state.targetFrame = Math.min(scroll / PIXELS_PER_FRAME, TOTAL_VIRTUAL_FRAMES - 1);
    });

    // Single RAF — drive Lenis inside our own animate loop avoids double-tick jank
    function lenisRaf(t) { lenis.raf(t); requestAnimationFrame(lenisRaf); }
    requestAnimationFrame(lenisRaf);
}

// ==========================================
// 9. CINEMA START
// ==========================================
function startCinemaExperience() {
    const loader          = document.getElementById('loader');
    const canvasContainer = document.querySelector('.canvas-container');

    if (loader && typeof gsap !== 'undefined')
        gsap.to(loader, { opacity: 0, duration: 0.8, onComplete: () => loader.style.display = 'none' });

    document.body.style.overflow = 'auto';
    setScrollHeight();
    buildTextNodes();

    // Resize canvas to physical pixels for crisp HiDPI
    const cvs = document.getElementById('cinema-canvas');
    if (cvs) resizeCanvas(cvs);

    if (canvasContainer && typeof gsap !== 'undefined') {
        canvasContainer.classList.add('loaded');
        gsap.fromTo(canvasContainer, { scale: 1.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: 'power2.out' });
    }

    // Show scroll hint
    const hint = document.getElementById('audio-hint');
    if (hint) {
        setTimeout(() => { hint.style.opacity = '1'; }, 1200);
        setTimeout(() => { hint.style.opacity = '0'; }, 4000);
    }

    initLenis();
    renderMasterFrame(0);
    requestAnimationFrame(animate);
}

function resizeCanvas(cvs) {
    const dpr  = window.devicePixelRatio || 1;
    const rect = cvs.getBoundingClientRect();
    cvs.width  = rect.width  * dpr;
    cvs.height = rect.height * dpr;
    cvs.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ==========================================
// 10. BOOT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    document.body.style.overflow = 'hidden';

    const startOverlay = document.getElementById('start-overlay');
    if (startOverlay) startOverlay.style.display = 'none';

    window.addEventListener('resize', () => {
        const cvs = document.getElementById('cinema-canvas');
        if (cvs) resizeCanvas(cvs);
        setScrollHeight();
        state.lastRenderedInt = -1;
    });

    initializePreload();
});
