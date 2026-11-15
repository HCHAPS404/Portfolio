/**
 * Sistema de movimiento: scroll suave, revelados al entrar en vista,
 * scramble de texto, contadores, barras y animaciones ligadas al scroll.
 * Con `prefers-reduced-motion` todo queda en su estado final, sin animar.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { sections, profile } from '../data.js';
import { $, $$, esc, reduceMotion, finePointer } from './dom.js';
import { setActiveSection, setProgress } from './chrome.js';

gsap.registerPlugin(ScrollTrigger);

const SCRAMBLE_CHARS = '01<>/\\[]{}#%&*+=ABCDEFGHJKLMNPQRSTUVWXYZ';
let lenis = null;

/* ---------- Scroll ---------- */
export function initScroll() {
  if (!reduceMotion) {
    lenis = new Lenis({ lerp: 0.115, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Enlaces internos: desplazamiento suave y foco en el destino
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.3 });
    else target.scrollIntoView();
    history.replaceState(null, '', `#${target.id}`);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}

export function lockScroll(locked) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

/* ---------- Scramble ---------- */
export function scramble(el, { duration = 700, text } = {}) {
  const final = text ?? el.dataset.final ?? el.textContent;
  el.dataset.final = final;
  if (reduceMotion) {
    el.textContent = final;
    return;
  }
  cancelAnimationFrame(el._scrambleRaf);
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - t0) / duration);
    const resolved = Math.floor(p * final.length);
    let out = '';
    for (let i = 0; i < final.length; i++) {
      const ch = final[i];
      out += i < resolved || ch === ' ' ? ch : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) el._scrambleRaf = requestAnimationFrame(step);
    else el.textContent = final;
  };
  el._scrambleRaf = requestAnimationFrame(step);
}

/* ---------- Hero ---------- */
function initHero() {
  const roleEl = $('[data-roles]');
  if (roleEl && !reduceMotion) {
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      i = (i + 1) % profile.roles.length;
      scramble(roleEl, { text: profile.roles[i], duration: 550 });
    }, 2600);
  }

  if (reduceMotion) return;

  gsap.from('[data-hero-word]', {
    yPercent: 115,
    duration: 1.25,
    ease: 'expo.out',
    stagger: 0.11,
    delay: 0.05,
  });
  gsap.from('.hero__top > *, .hero__role, [data-hero-fade]', {
    opacity: 0,
    y: 16,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.06,
    delay: 0.35,
    clearProps: 'transform',
  });

  // Al hacer scroll, el hero se hunde y el toro se desvanece
  gsap.to('.hero__canvas', {
    yPercent: 14,
    opacity: 0.15,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__title', {
    yPercent: -8,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

/* ---------- Revelados genéricos ---------- */
function initReveals() {
  const counters = $$('[data-count]');
  const fills = $$('[data-fill]');
  const heads = $$('[data-head]');

  if (reduceMotion) {
    fills.forEach((f) => (f.style.transform = `scaleX(${Number(f.dataset.fill) / 100})`));
    return;
  }

  gsap.set('[data-reveal]', { opacity: 0, y: 30 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.055,
        overwrite: true,
        clearProps: 'transform',
      }),
  });

  heads.forEach((head) => {
    head.style.setProperty('--rule', 0);
    const title = $('[data-scramble]', head);
    gsap.set(head.children, { opacity: 0, y: 18 });
    ScrollTrigger.create({
      trigger: head,
      start: 'top 86%',
      once: true,
      onEnter: () => {
        gsap.to(head, { '--rule': 1, duration: 1.2, ease: 'expo.out' });
        gsap.to(head.children, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 });
        if (title) scramble(title, { duration: 800 });
      },
    });
  });

  $$('[data-scramble]')
    .filter((el) => !el.closest('[data-head]'))
    .forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => scramble(el, { duration: 900 }) });
    });

  counters.forEach((el) => {
    const target = Number(el.dataset.count);
    const obj = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el,
      // Los contadores del hero arrancan con la página aunque queden bajo el pliegue
      start: el.closest('.hero') ? 'top bottom+=400' : 'top 94%',
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: target,
          duration: 1.5,
          ease: 'power3.out',
          onUpdate: () => (el.textContent = Math.round(obj.v)),
        }),
    });
  });

  fills.forEach((el) => {
    gsap.set(el, { scaleX: 0 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 94%',
      once: true,
      onEnter: () => gsap.to(el, { scaleX: Number(el.dataset.fill) / 100, duration: 1.3, ease: 'expo.out', delay: 0.1 }),
    });
  });
}

/* ---------- Texto que se "enciende" palabra a palabra con el scroll ---------- */
function initSplit() {
  $$('[data-split]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="word">${esc(w)}</span>`).join(' ');
    if (reduceMotion) return;
    gsap.fromTo(
      $$('.word', el),
      { opacity: 0.16 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 55%', scrub: 0.4 },
      },
    );
  });
}

/* ---------- Línea de tiempo ---------- */
function initTimeline() {
  const timeline = $('.timeline');
  if (!timeline) return;

  $$('.xp__toggle', timeline).forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.xp');
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      setTimeout(() => ScrollTrigger.refresh(), 520);
    });
  });

  if (reduceMotion) {
    $$('.xp', timeline).forEach((item) => item.classList.add('is-passed'));
    return;
  }

  gsap.fromTo(
    '.timeline__line i',
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: timeline, start: 'top 62%', end: 'bottom 62%', scrub: 0.3 },
    },
  );
  $$('.xp', timeline).forEach((item) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 62%',
      onEnter: () => item.classList.add('is-passed'),
      onLeaveBack: () => item.classList.remove('is-passed'),
    });
  });
}

/* ---------- Filtro de herramientas ---------- */
function initToolsFilter() {
  const tabs = $$('.tools__tab');
  const chips = $$('.chip');
  const count = $('[data-tools-count]');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-pressed', String(active));
      });
      const on = [];
      chips.forEach((chip) => {
        const match = filter === '*' || chip.dataset.cat === filter;
        chip.classList.toggle('is-off', !match);
        if (match) on.push(chip);
      });
      if (count) count.textContent = on.length;
      if (!reduceMotion) {
        gsap.fromTo(
          on,
          { y: 8, opacity: 0.4 },
          { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.012, clearProps: 'transform,opacity' },
        );
      }
    });
  });
}

/* ---------- Interacciones de puntero ---------- */
function initPointerFx() {
  // Scramble del nombre al pasar sobre una tarjeta de proyecto
  $$('[data-scramble-hover]').forEach((el) => {
    const target = $('[data-scramble-target]', el);
    if (!target) return;
    const run = () => scramble(target, { duration: 450 });
    el.addEventListener('pointerenter', run);
    el.addEventListener('focus', run);
  });

  // Glitch breve del título de contacto cada pocos segundos mientras está a la vista
  const glitchTitle = $('[data-glitch]');
  if (glitchTitle && !reduceMotion) {
    let inView = false;
    new IntersectionObserver(([entry]) => (inView = entry.isIntersecting)).observe(glitchTitle);
    setInterval(() => {
      if (!inView || document.hidden) return;
      glitchTitle.classList.add('is-glitching');
      setTimeout(() => glitchTitle.classList.remove('is-glitching'), 420);
    }, 3400);
  }

  if (!finePointer) return;

  // Foco de luz que sigue al cursor dentro de tarjetas
  $$('.project__link, .domain, .degree').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

/* ---------- Copiar correo ---------- */
function initCopy() {
  $$('[data-copy]').forEach((button) => {
    const label = $('[data-copy-label]', button);
    const status = $('[data-copy-status]');
    const original = label.textContent;
    button.addEventListener('click', async () => {
      let ok = true;
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
      } catch {
        ok = false;
      }
      label.textContent = ok ? 'Copiado ✓' : 'No se pudo copiar';
      if (status) status.textContent = ok ? 'Dirección de correo copiada' : 'No se pudo copiar la dirección';
      setTimeout(() => (label.textContent = original), 2200);
    });
  });
}

/* ---------- Sección activa y progreso ---------- */
function initSectionTracking() {
  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => self.isActive && setActiveSection(s.id),
    });
  });
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => setProgress(self.progress),
  });
  setActiveSection('inicio');
}

/* ---------- Capa extra: paralaje, cortinas, imanes y bandas reactivas ---------- */
function initExtras() {
  if (reduceMotion) return;

  // Numerales fantasma: se desplazan más lento que el contenido
  $$('[data-ghost]').forEach((ghost) => {
    gsap.fromTo(
      ghost,
      { yPercent: 28 },
      {
        yPercent: -38,
        ease: 'none',
        scrollTrigger: { trigger: ghost.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      },
    );
  });

  // Cortina: los paneles visuales se descubren de izquierda a derecha
  $$('[data-wipe]').forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.4,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      },
    );
  });

  // Bandas marquee: se inclinan y aceleran con la velocidad del scroll
  const tracks = $$('.marquee__track > span');
  if (tracks.length) {
    const skew = gsap.quickTo(tracks, 'skewX', { duration: 0.5, ease: 'power3.out' });
    let resetTimer = 0;
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const v = gsap.utils.clamp(-14, 14, self.getVelocity() / -260);
        skew(v);
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => skew(0), 140);
      },
    });
  }

  // Marca gigante del pie: las letras suben una a una
  const letters = $$('[data-mark-letter]');
  if (letters.length) {
    gsap.from(letters, {
      yPercent: 105,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.035,
      scrollTrigger: { trigger: '.footer__mark', start: 'top 96%', once: true },
    });
  }

  if (!finePointer) return;

  // Botones magnéticos: siguen levemente al cursor
  $$('[data-magnetic]').forEach((el) => {
    const moveX = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
    const moveY = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      moveX((e.clientX - (r.left + r.width / 2)) * 0.28);
      moveY((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => {
      moveX(0);
      moveY(0);
    });
  });

  // Sigilos de proyecto: paralaje contra el cursor
  $$('.project__link').forEach((card) => {
    const sigil = $('.project__glyph', card);
    if (!sigil) return;
    const moveX = gsap.quickTo(sigil, 'x', { duration: 0.6, ease: 'power3.out' });
    const moveY = gsap.quickTo(sigil, 'y', { duration: 0.6, ease: 'power3.out' });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      moveX(((e.clientX - r.left) / r.width - 0.5) * 22);
      moveY(((e.clientY - r.top) / r.height - 0.5) * 22);
    });
    card.addEventListener('pointerleave', () => {
      moveX(0);
      moveY(0);
    });
  });
}

export function initMotion() {
  initHero();
  initExtras();
  initSplit();
  initReveals();
  initTimeline();
  initToolsFilter();
  initPointerFx();
  initCopy();
  initSectionTracking();

  // Las fuentes web cambian alturas: recalcular posiciones al terminar de cargar
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
