/**
 * "Chrome" del sitio: barra superior con navegación y selector de idioma,
 * menú móvil, riel de progreso y cursor personalizado.
 */
import { sections, profile, initials } from '../data.js';
import { $, $$, esc, pad2, reduceMotion, finePointer } from './dom.js';
import { t, LANGS, getLang, switchLang } from '../i18n/index.js';

export function renderChrome() {
  const navSections = sections.filter((s) => s.id !== 'inicio');
  const current = LANGS.find((l) => l.code === getLang()) ?? LANGS[0];
  const links = navSections
    .map(
      (s, i) =>
        `<a href="#${s.id}" data-nav="${s.id}"><span aria-hidden="true">${pad2(i + 1)}</span>${esc(s.label)}</a>`,
    )
    .join('');

  const langOptions = LANGS.map(
    (l) => `
        <li><button class="langsel__opt" type="button" lang="${l.code}" data-lang-code="${l.code}"${l.code === current.code ? ' aria-current="true"' : ''} data-cursor>
          <span class="langsel__code" aria-hidden="true">${esc(l.short)}</span><span class="langsel__name">${esc(l.native)}</span>
        </button></li>`,
  ).join('');

  return `
  <header class="hud">
    <a class="hud__brand" href="#inicio" aria-label="${esc(t('hud.home_aria', { name: profile.name }))}" data-cursor>
      <span class="hud__mark" aria-hidden="true"></span>${esc(initials)}<span class="red">/</span>${esc(t('hud.brand'))}
    </a>
    <nav class="hud__nav" aria-label="${esc(t('a11y.main_nav'))}">${links}</nav>
    <div class="hud__right">
      <div class="langsel" data-lang>
        <button class="langsel__btn" type="button" aria-expanded="false" aria-controls="lang-list" aria-label="${esc(t('lang.aria', { lang: current.native }))}" data-cursor>
          <svg class="langsel__globe" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>
          <span class="langsel__current" aria-hidden="true">${esc(current.short)}</span>
          <i class="langsel__chev" aria-hidden="true"></i>
        </button>
        <ul class="langsel__list" id="lang-list" aria-label="${esc(t('lang.label'))}" hidden>${langOptions}
        </ul>
      </div>
      <button class="hud__menu" type="button" aria-expanded="false" aria-controls="menu" data-cursor>
        <span data-menu-label>${esc(t('hud.menu'))}</span><i aria-hidden="true"></i>
      </button>
    </div>
  </header>

  <div class="menu" id="menu" hidden>
    <nav class="menu__nav" aria-label="${esc(t('a11y.mobile_nav'))}">${links}</nav>
    <p class="menu__foot mono dim">${esc(profile.location)} · ${esc(profile.availability)}</p>
  </div>

  <aside class="rail" aria-hidden="true">
    <span class="rail__no" data-rail-no>00</span>
    <span class="rail__bar"><i data-rail-bar></i></span>
    <span class="rail__label" data-rail-label>${esc(t('nav.home'))}</span>
  </aside>

  <div class="cursor" aria-hidden="true"><i class="cursor__ring"></i><i class="cursor__dot"></i></div>
  <div class="grain" aria-hidden="true"></div>`;
}

function initMenu(onToggle) {
  const button = $('.hud__menu');
  const menu = $('#menu');
  const label = $('[data-menu-label]');
  if (!button || !menu) return;

  const set = (open) => {
    button.setAttribute('aria-expanded', String(open));
    label.textContent = open ? t('hud.close') : t('hud.menu');
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

function initLang() {
  const root = $('[data-lang]');
  if (!root) return;
  const button = $('.langsel__btn', root);
  const list = $('.langsel__list', root);

  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    list.hidden = !open;
    root.classList.toggle('is-open', open);
  };

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
    if (open) $('[aria-current="true"]', list)?.focus({ preventScroll: true });
  });

  list.addEventListener('click', (e) => {
    const option = e.target.closest('[data-lang-code]');
    if (!option) return;
    setOpen(false);
    switchLang(option.dataset.langCode);
  });

  // Flechas, inicio y fin dentro de la lista
  list.addEventListener('keydown', (e) => {
    const options = $$('.langsel__opt', list);
    const i = options.indexOf(document.activeElement);
    const go = (n) => options[(n + options.length) % options.length].focus();
    if (e.key === 'ArrowDown') (e.preventDefault(), go(i + 1));
    else if (e.key === 'ArrowUp') (e.preventDefault(), go(i - 1));
    else if (e.key === 'Home') (e.preventDefault(), go(0));
    else if (e.key === 'End') (e.preventDefault(), go(options.length - 1));
  });

  document.addEventListener('pointerdown', (e) => {
    if (!root.contains(e.target)) setOpen(false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !list.hidden) {
      setOpen(false);
      button.focus();
    }
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
  initMenu(onMenuToggle);
  initLang();
  initCursor();
}
