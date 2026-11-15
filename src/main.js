import './styles/base.css';
import './styles/chrome.css';
import './styles/hero.css';
import './styles/sections.css';
import './styles/contact.css';
import './styles/extras.css';

import { profile, skills, sections, asset } from './data.js';
import { $, $$, esc } from './core/dom.js';
import { renderChrome, initChrome, boot } from './core/chrome.js';
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

import { createPcb } from './visuals/pcb.js';
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
      <span class="rule__label"><b>↓</b> Siguiente — ${esc(sections[index].label)}</span>
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

function initVisuals() {
  const board = $('.hero__canvas');
  if (board) createPcb(board);

  const portrait = $('.about__canvas');
  if (portrait) createAsciiPortrait(portrait, asset(profile.photo));

  // Cada competencia elige su animación con el campo `visual` de data/projects.json
  const factories = { terrain: createTerrain, waves: createWaves };
  $$('.comp__canvas').forEach((canvas) => (factories[canvas.dataset.visual] ?? createTerrain)(canvas));
}

async function start() {
  render();
  initChrome({ onMenuToggle: lockScroll });
  initScroll();
  initVisuals();
  await boot();
  document.documentElement.classList.add('is-ready');
  initMotion();
}

start();
