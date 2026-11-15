/**
 * Interacciones de la sección Habilidades:
 *  - Bloques de dominio: al pulsar uno se expande a todo el ancho de su fila y muestra
 *    el detalle; la X (o Esc) lo encoge. Se anima con GSAP Flip.
 *  - Herramientas: categorías con barras, buscador, inspector y resaltado por familia.
 */
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, reduceMotion } from './dom.js';

gsap.registerPlugin(Flip, ScrollTrigger);

/* ---------------------------------------------------------------------------
   Dominios expandibles
   ------------------------------------------------------------------------- */
function initDomains(scrollTo) {
  const grid = $('[data-domains]');
  if (!grid) return;
  const cards = $$('.domain', grid);

  const columns = () => getComputedStyle(grid).gridTemplateColumns.split(' ').length;

  /** Cada tarjeta conserva su sitio; la abierta se coloca al inicio de su fila para ocuparla entera. */
  function setOrders(open) {
    cards.forEach((card, i) => (card.style.order = String(i * 2)));
    if (open) {
      const rowStart = Math.floor(cards.indexOf(open) / columns()) * columns();
      open.style.order = String(rowStart * 2 - 1);
    }
  }

  function setOpen(card, open) {
    card.classList.toggle('is-open', open);
    $('.domain__open', card).setAttribute('aria-expanded', String(open));
    $('.domain__detail', card).hidden = !open;
  }

  function toggle(card, open) {
    const current = cards.find((c) => c.classList.contains('is-open'));
    const state = Flip.getState(cards, { props: 'opacity' });

    if (current && current !== card) setOpen(current, false);
    setOpen(card, open);
    setOrders(open ? card : null);

    const done = () => {
      ScrollTrigger.refresh();
      if (open) scrollTo?.(card);
    };

    if (reduceMotion) {
      done();
      return;
    }
    Flip.from(state, {
      duration: 0.8,
      ease: 'expo.inOut',
      scale: false,
      nested: true,
      onComplete: done,
    });
  }

  setOrders(null);

  cards.forEach((card) => {
    $('.domain__open', card).addEventListener('click', () => toggle(card, true));
    $('.domain__close', card).addEventListener('click', () => {
      toggle(card, false);
      $('.domain__open', card).focus({ preventScroll: true });
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = cards.find((c) => c.classList.contains('is-open'));
    if (!open) return;
    toggle(open, false);
    $('.domain__open', open).focus({ preventScroll: true });
  });

  // Al cambiar el número de columnas (giro de pantalla, redimensionado) se recalcula el orden
  let lastCols = columns();
  window.addEventListener('resize', () => {
    const now = columns();
    if (now === lastCols) return;
    lastCols = now;
    setOrders(cards.find((c) => c.classList.contains('is-open')) ?? null);
  });
}

/* ---------------------------------------------------------------------------
   Herramientas
   ------------------------------------------------------------------------- */
function initTools() {
  const root = $('[data-tools]');
  if (!root) return;

  const tiles = $$('.tool', root);
  const tabs = $$('.tools__cat', root);
  const board = $('.tools__board', root);
  const search = $('[data-tools-search]', root);
  const countEl = $('[data-tools-count]', root);
  const empty = $('[data-tools-empty]', root);
  const inspector = $('[data-inspector]', root);

  let filter = '*';
  let query = '';
  let pinned = null;

  function apply() {
    let shown = 0;
    tiles.forEach((tile) => {
      const okCat = filter === '*' || tile.dataset.cat === filter;
      const okQuery = !query || tile.dataset.name.includes(query);
      const on = okCat && okQuery;
      tile.classList.toggle('is-off', !on);
      $('.tool__btn', tile).tabIndex = on ? 0 : -1;
      if (on) shown += 1;
    });
    countEl.textContent = shown;
    empty.hidden = shown > 0;
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filter = tab.dataset.filter;
      tabs.forEach((x) => {
        const active = x === tab;
        x.classList.toggle('is-active', active);
        x.setAttribute('aria-pressed', String(active));
      });
      apply();
      if (!reduceMotion) {
        gsap.fromTo(
          tiles.filter((x) => !x.classList.contains('is-off')),
          { y: 10, opacity: 0.3 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: { each: 0.014, from: 'start' }, clearProps: 'transform,opacity' },
        );
      }
    });
  });

  search.addEventListener('input', () => {
    query = search.value.trim().toLowerCase();
    apply();
  });

  /* Inspector */
  const hint = inspector.dataset.hint;
  function show(btn) {
    inspector.classList.add('is-active');
    inspector.replaceChildren();
    const sym = Object.assign(document.createElement('span'), { className: 'insp__sym', textContent: btn.dataset.sym });
    const main = document.createElement('span');
    main.className = 'insp__main';
    const name = Object.assign(document.createElement('strong'), { className: 'insp__name', textContent: btn.dataset.tool });
    const meta = document.createElement('span');
    meta.className = 'insp__meta mono';
    const sameAsCode = btn.dataset.catName.toLowerCase() === btn.dataset.code.toLowerCase();
    const category = sameAsCode ? btn.dataset.catName : `${btn.dataset.catName} · ${btn.dataset.code}`;
    const parts = [`${inspector.dataset.labelCat}: ${category}`];
    if (btn.dataset.domains) parts.push(`${inspector.dataset.labelDomains}: ${btn.dataset.domains}`);
    meta.textContent = parts.join('   /   ');
    main.append(name, meta);
    inspector.append(sym, main);
  }
  function clearInspector() {
    inspector.classList.remove('is-active');
    inspector.replaceChildren(Object.assign(document.createElement('span'), { className: 'tools__inspector-hint', textContent: hint }));
  }

  function kin(btn) {
    const cat = btn.closest('.tool').dataset.cat;
    board.classList.add('has-hover');
    tiles.forEach((tile) => tile.classList.toggle('is-kin', tile.dataset.cat === cat));
  }
  function unkin() {
    board.classList.remove('has-hover');
    tiles.forEach((tile) => tile.classList.remove('is-kin'));
  }

  $$('.tool__btn', board).forEach((btn) => {
    const enter = () => {
      show(btn);
      kin(btn);
    };
    const leave = () => {
      unkin();
      if (pinned) {
        show(pinned);
        kin(pinned);
      } else clearInspector();
    };
    btn.addEventListener('pointerenter', enter);
    btn.addEventListener('focus', enter);
    btn.addEventListener('pointerleave', leave);
    btn.addEventListener('blur', leave);
    btn.addEventListener('click', () => {
      const same = pinned === btn;
      pinned?.closest('.tool').classList.remove('is-pinned');
      pinned = same ? null : btn;
      pinned?.closest('.tool').classList.add('is-pinned');
      if (pinned) {
        show(pinned);
        kin(pinned);
      } else clearInspector();
    });
  });
}

export function initSkillsUi({ scrollTo } = {}) {
  initDomains(scrollTo);
  initTools();
}
