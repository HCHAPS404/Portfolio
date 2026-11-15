/** Escapa texto para insertarlo en HTML. */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const pad2 = (n) => String(n).padStart(2, '0');

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Cabecera estándar de sección. */
export function sectionHead(no, title, meta) {
  return `
    <span class="sec-ghost" aria-hidden="true" data-ghost>${esc(no)}</span>
    <header class="sec-head" data-head>
      <span class="sec-head__no" aria-hidden="true">${esc(no)}</span>
      <h2 class="sec-head__title" data-scramble>${esc(title)}</h2>
      <p class="sec-head__meta">${meta}</p>
    </header>`;
}

/** Hash determinista de un texto (para patrones generativos estables). */
export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Generador pseudoaleatorio con semilla (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Ejecuta `draw(time)` en cada frame solo mientras `el` está en pantalla.
 * Con movimiento reducido dibuja un único frame estático.
 */
export function visibleLoop(el, draw, { fps = 60 } = {}) {
  let raf = 0;
  let visible = false;
  let last = 0;
  const interval = 1000 / fps;

  const tick = (now) => {
    if (!visible) {
      raf = 0;
      return;
    }
    if (now - last >= interval - 1) {
      last = now;
      draw(now);
    }
    raf = requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (reduceMotion) {
      if (visible) draw(4200);
      return;
    }
    if (visible && !raf) raf = requestAnimationFrame(tick);
  });
  io.observe(el);

  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
  };
}

/** Ajusta un canvas a su tamaño CSS con densidad de píxeles (máx. 2x). */
export function fitCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height, dpr };
}
