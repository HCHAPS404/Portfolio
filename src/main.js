import './styles/base.css';
import './styles/chrome.css';
import './styles/hero.css';
import './styles/sections.css';
import './styles/contact.css';
import './styles/extras.css';
import './styles/skills.css';
import './styles/i18n.css';

import { initData, profile, skills, sections, asset } from './data.js';
import { $, $$, esc } from './core/dom.js';
import { detectLang, setupLang, consumeSwitch, t } from './i18n/index.js';
import { renderChrome, initChrome } from './core/chrome.js';
import { startLoader } from './core/loader.js';
import { initScroll, initMotion, lockScroll } from './core/motion.js';

import { renderHero } from './sections/hero.js';
import { renderAbout } from './sections/about.js';
import { renderEducation } from './sections/education.js';
import { renderExperience } from './sections/experience.js';
import { renderSkills } from './sections/skills.js';
import { renderCompetitions } from './sections/competitions.js';
import { renderProjects } from './sections/projects.js';
import { renderAwards } from './sections/awards.js';
import { renderContact, renderFooter } from './sections/contact.js';

import { createHeroScene } from './visuals/hero/index.js';
import { createAsciiPortrait } from './visuals/ascii-portrait.js';
import { createTerrain } from './visuals/terrain.js';
import { createWaves } from './visuals/waves.js';

/** Regla de transición entre secciones: anuncia la siguiente con una escala graduada. */
function sectionRule(id) {
  const index = sections.findIndex((s) => s.id === id);
  const total = sections.length - 1;
  return `
  <div class="rule" aria-hidden="true">
    <div class="wrap rule__inner">
      <span class="rule__label"><b>↓</b> ${esc(t('rule.next', { section: sections[index].label }))}</span>
      <span class="rule__scale"><i class="rule__marker"></i></span>
      <span class="rule__code">${String(index).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
    </div>
  </div>`;
}

/** Banda de roles entre el hero y el perfil. */
function renderRolesMarquee() {
  const items = profile.roles.map((r) => `${esc(r)}<i>✦</i>`).join(' ');
  return `
  <div class="marquee" aria-hidden="true">
    <div class="marquee__track"><span>${items} </span><span>${items} </span></div>
  </div>`;
}

/** Banda de dominios antes del contacto. */
function renderDomainsMarquee() {
  const items = skills.domains.map((d) => `${esc(d.title)}<i>/</i>`).join(' ');
  return `
  <div class="marquee marquee--ghost" aria-hidden="true">
    <div class="marquee__track" style="--marquee-dur: 70s"><span>${items} </span><span>${items} </span></div>
  </div>`;
}

function render() {
  const app = $('#app');
  app.innerHTML = `
    ${renderChrome()}
    <main id="main">
      ${renderHero()}
      ${renderRolesMarquee()}
      ${renderAbout()}
      ${sectionRule('formacion')}
      ${renderEducation()}
      ${renderExperience()}
      ${sectionRule('habilidades')}
      ${renderSkills()}
      ${renderCompetitions()}
      ${sectionRule('proyectos')}
      ${renderProjects()}
      ${renderAwards()}
      ${renderDomainsMarquee()}
      ${renderContact()}
    </main>
    ${renderFooter()}`;
}

async function initVisuals(lang) {
  // La portada cambia con el idioma (ver src/visuals/hero/index.js)
  const cover = $('.hero__canvas');
  if (cover) await createHeroScene(cover, lang);

  const portrait = $('.about__canvas');
  if (portrait) createAsciiPortrait(portrait, asset(profile.photo));

  // Cada competencia elige su animación con el campo `visual` de data/projects.json
  const factories = { terrain: createTerrain, waves: createWaves };
  $$('.comp__canvas').forEach((canvas) => (factories[canvas.dataset.visual] ?? createTerrain)(canvas));
}

/**
 * Ajusta el tamaño del nombre de la portada para que la línea más ancha quepa:
 * el nombre cambia de alfabeto y de longitud según el idioma.
 */
function fitHeroTitle() {
  const title = $('.hero__title');
  if (!title) return;
  title.style.fontSize = '';
  const room = title.clientWidth;
  const widest = Math.max(...$$('.hero__word', title).map((w) => w.offsetWidth));
  if (widest > room) {
    const size = parseFloat(getComputedStyle(title).fontSize);
    title.style.fontSize = `${Math.floor(size * (room / widest) * 0.97)}px`;
  }
}

/** Título, descripción y etiquetas para compartir, en el idioma elegido. */
function applyDocumentMeta() {
  document.title = t('meta.title');
  const set = (selector, value) => $(selector)?.setAttribute('content', value);
  set('meta[name="description"]', t('meta.description'));
  set('meta[property="og:title"]', t('meta.og_title'));
  set('meta[property="og:description"]', t('meta.og_description'));
  $('.skip-link').textContent = t('a11y.skip');
}

/** Tipografías de alfabetos que las fuentes base no cubren (se piden solo si hacen falta). */
const EXTRA_FONTS = {
  ru: 'Inter:wght@500;700',
  ja: 'Noto+Sans+JP:wght@500;700',
  zh: 'Noto+Sans+SC:wght@500;700',
};

function loadScriptFonts(lang) {
  const family = EXTRA_FONTS[lang];
  if (!family) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  document.head.append(link);
}

async function start() {
  // La pantalla de carga sale antes que nada; el resto se prepara detrás
  const { switching, scroll } = consumeSwitch();
  const loader = startLoader({ switching });

  const lang = await setupLang(detectLang());
  initData();
  applyDocumentMeta();
  loadScriptFonts(lang);
  loader.label([
    profile.name.toUpperCase(),
    switching ? t('boot.switching') : t('boot.tagline', { year: new Date().getFullYear() }),
  ]);

  render();
  fitHeroTitle();
  document.fonts?.ready.then(fitHeroTitle);
  window.addEventListener('resize', fitHeroTitle);
  initChrome({ onMenuToggle: lockScroll });
  initScroll();
  await initVisuals(lang).catch((error) => console.error(error));
  await loader.finish();
  document.documentElement.classList.add('is-ready');
  initMotion();

  // Tras cambiar de idioma se vuelve al punto donde estaba la lectura
  if (switching && scroll > 0) {
    requestAnimationFrame(() => window.scrollTo(0, scroll));
  }
}

start();
