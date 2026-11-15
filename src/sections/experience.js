import { experience } from '../data.js';
import { esc, pad2, sectionHead } from '../core/dom.js';

export function renderExperience() {
  const items = experience
    .map((x, i) => {
      const open = i === 0;
      const org = x.link
        ? `<a href="${esc(x.link)}" target="_blank" rel="noopener" data-cursor>${esc(x.org)} <span aria-hidden="true">↗</span></a>`
        : esc(x.org);
      return `
      <li class="xp${x.featured ? ' xp--featured' : ''}${open ? ' is-open' : ''}" data-reveal>
        <span class="xp__node" aria-hidden="true"></span>
        <div class="xp__when">
          <span class="xp__period">${esc(x.period)}</span>
          <span class="xp__type">${esc(x.type)}</span>
        </div>
        <div class="xp__main">
          <h3 class="xp__role">
            <button class="xp__toggle" type="button" aria-expanded="${open}" aria-controls="xp-panel-${i}" data-cursor>
              <span class="xp__no" aria-hidden="true">${pad2(i + 1)}</span>
              <span class="xp__role-text">${esc(x.role)}</span>
              <span class="xp__icon" aria-hidden="true"></span>
            </button>
          </h3>
          <p class="xp__org">${org}</p>
          <p class="xp__summary">${esc(x.summary)}</p>
          <div class="xp__panel" id="xp-panel-${i}" role="region" aria-label="Detalle: ${esc(x.role)}">
            <div class="xp__panel-inner">
              <ul class="xp__bullets">${x.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
            </div>
          </div>
          <ul class="xp__tags">${x.tags.map((t) => `<li class="tag">${esc(t)}</li>`).join('')}</ul>
        </div>
      </li>`;
    })
    .join('');

  return `
  <section class="section experience" id="experiencia" aria-labelledby="experiencia-title">
    <div class="wrap">
      ${sectionHead('03', 'Experiencia', `${pad2(experience.length)} roles<br>2021 — Actualidad`).replace('<h2 ', '<h2 id="experiencia-title" ')}

      <div class="timeline">
        <span class="timeline__line" aria-hidden="true"><i></i></span>
        <ol class="timeline__list">${items}</ol>
      </div>
    </div>
  </section>`;
}
