/**
 * "Chrome" del sitio: arranque tipo terminal, HUD de navegación, menú móvil,
 * riel de progreso, reloj de Bogotá y cursor personalizado.
 */
import { sections, profile } from '../data.js';
import { $, $$, esc, pad2, reduceMotion, finePointer } from './dom.js';

const navSections = sections.filter((s) => s.id !== 'inicio');

export function renderChrome() {
  const links = navSections
    .map(
      (s, i) =>
        `<a href="#${s.id}" data-nav="${s.id}"><span aria-hidden="true">${pad2(i + 1)}</span>${esc(s.label)}</a>`,
    )
    .join('');

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('');

  return `
  <div class="boot" aria-hidden="true">
    <pre class="boot__log"></pre>
    <p class="boot__count"><span data-boot-count>000</span><i>%</i></p>
    <span class="boot__bar"><i></i></span>
  </div>

  <header class="hud">
    <a class="hud__brand" href="#inicio" aria-label="${esc(profile.name)} — inicio" data-cursor>
      <span class="hud__mark" aria-hidden="true"></span>${esc(initials)}<span class="red">/</span>PORTAFOLIO
    </a>
    <nav class="hud__nav" aria-label="Navegación principal">${links}</nav>
    <div class="hud__right">
      <span class="hud__clock" aria-hidden="true">BOG <span data-clock>--:--:--</span></span>
      <button class="hud__menu" type="button" aria-expanded="false" aria-controls="menu" data-cursor>
        <span data-menu-label>Menú</span><i aria-hidden="true"></i>
      </button>
    </div>
  </header>

  <div class="menu" id="menu" hidden>
    <nav class="menu__nav" aria-label="Menú móvil">${links}</nav>
    <p class="menu__foot mono dim">${esc(profile.location)} · ${esc(profile.availability)}</p>
  </div>

  <aside class="rail" aria-hidden="true">
    <span class="rail__no" data-rail-no>00</span>
    <span class="rail__bar"><i data-rail-bar></i></span>
    <span class="rail__label" data-rail-label>Inicio</span>
  </aside>

  <div class="cursor" aria-hidden="true"><i class="cursor__ring"></i><i class="cursor__dot"></i></div>
  <div class="grain" aria-hidden="true"></div>`;
}

/** Secuencia de arranque. Resuelve cuando el sitio queda a la vista. */
export function boot() {
  const el = $('.boot');
  if (!el) return Promise.resolve();
  if (reduceMotion) {
    el.remove();
    return Promise.resolve();
  }

  const log = $('.boot__log', el);
  const count = $('[data-boot-count]', el);
  const bar = $('.boot__bar i', el);
  const lines = [
    'HCS-OS v2.6 // BOGOTÁ 04.7110N 074.0721W',
    '> cargando perfil ............. OK',
    '> montando motor ASCII ........ OK',
    '> calibrando telemetría ....... OK',
    '> enlace establecido',
  ];
  const DURATION = 1350;

  return new Promise((resolve) => {
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / DURATION);
      const shown = Math.ceil(p * lines.length);
      log.textContent = lines.slice(0, shown).join('\n');
      count.textContent = String(Math.round(p * 100)).padStart(3, '0');
      bar.style.transform = `scaleX(${p})`;
      if (p < 1) {
        requestAnimationFrame(step);
        return;
      }
      el.classList.add('is-done');
      resolve();
      setTimeout(() => el.remove(), 900);
    };
    requestAnimationFrame(step);
  });
}

function initClock() {
  const targets = $$('[data-clock]');
  if (!targets.length) return;
  const fmt = new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const tick = () => {
    const text = fmt.format(new Date());
    targets.forEach((t) => (t.textContent = text));
  };
  tick();
  setInterval(tick, 1000);
}

function initMenu(onToggle) {
  const button = $('.hud__menu');
  const menu = $('#menu');
  const label = $('[data-menu-label]');
  if (!button || !menu) return;

  const set = (open) => {
    button.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Cerrar' : 'Menú';
    document.documentElement.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => {
        if (button.getAttribute('aria-expanded') === 'false') menu.hidden = true;
      }, 420);
    }
    onToggle?.(open);
  };

  button.addEventListener('click', () => set(button.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) set(false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      set(false);
      button.focus();
    }
  });
  window.matchMedia('(min-width: 1101px)').addEventListener('change', (e) => {
    if (e.matches) set(false);
  });
}

function initCursor() {
  const cursor = $('.cursor');
  if (!cursor) return;
  if (!finePointer || reduceMotion) {
    cursor.remove();
    return;
  }
  const ring = $('.cursor__ring', cursor);
  const dot = $('.cursor__dot', cursor);
  const pos = { x: innerWidth / 2, y: innerHeight / 2, rx: innerWidth / 2, ry: innerHeight / 2 };

  window.addEventListener(
    'pointermove',
    (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      cursor.classList.add('is-visible');
      const interactive = e.target.closest?.('[data-cursor], a, button');
      cursor.classList.toggle('is-active', Boolean(interactive));
      cursor.classList.toggle('is-inverse', Boolean(e.target.closest?.('.contact')));
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));

  const loop = () => {
    pos.rx += (pos.x - pos.rx) * 0.18;
    pos.ry += (pos.y - pos.ry) * 0.18;
    dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    ring.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/** Actualiza el HUD cuando cambia la sección activa. */
export function setActiveSection(id) {
  $$('[data-nav]').forEach((a) => {
    if (a.dataset.nav === id) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
  document.documentElement.classList.toggle('on-accent', id === 'contacto');
  const index = sections.findIndex((s) => s.id === id);
  const no = $('[data-rail-no]');
  const label = $('[data-rail-label]');
  if (no) no.textContent = pad2(Math.max(0, index));
  if (label) label.textContent = sections[index]?.label ?? '';
}

export function setProgress(p) {
  const bar = $('[data-rail-bar]');
  if (bar) bar.style.transform = `scaleY(${p})`;
  document.documentElement.classList.toggle('is-scrolled', p > 0.004);
}

export function initChrome({ onMenuToggle } = {}) {
  initClock();
  initMenu(onMenuToggle);
  initCursor();
}
