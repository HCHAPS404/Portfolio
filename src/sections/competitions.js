import { competitions } from '../data.js';
import { esc, pad2, sectionHead } from '../core/dom.js';

// Rótulos del panel visual según la animación elegida en data (`visual`).
const HUD = {
  terrain: { title: 'SAT // Alerta temprana', sub: 'Remoción en masa' },
  waves: { title: 'CTG // Costa Caribe', sub: 'Cartagena de Indias' },
};

// Texto provisional para los campos que el dueño aún no ha completado (no inventar).
const PENDING_DETAIL = 'Detalle del proyecto en preparación.';

export function renderCompetitions() {
  const tally = competitions
    .map(
      (c) => `
      <li class="tally__item${c.place === 1 ? ' tally__item--first' : ''}" data-reveal>
        <span class="tally__place">${esc(pad2(c.place ?? 0))}</span>
        <span class="tally__text">
          <span class="tally__flag">${esc(c.flag)}</span>
          <span class="tally__org mono dim">${esc(c.org)}</span>
        </span>
      </li>`,
    )
    .join('');

  const panels = competitions
    .map((c) => {
      const hud = HUD[c.visual] ?? HUD.terrain;
      const metaLine = [c.no, c.org, c.year].filter(Boolean).map(esc).join(' · ');
      const action = c.repo
        ? `<a class="btn" href="${esc(c.repo)}" target="_blank" rel="noopener" data-cursor data-magnetic>Ver repositorio <span class="btn__arrow" aria-hidden="true">↗</span></a>`
        : '';
      return `
      <article class="comp comp--place-${esc(c.place ?? 0)}" data-reveal>
        <div class="comp__visual" data-wipe>
          <canvas class="comp__canvas" data-visual="${esc(c.visual ?? 'terrain')}" aria-hidden="true"></canvas>
          <p class="comp__hud comp__hud--tl mono">${esc(hud.title)}<br><span class="dim">${esc(hud.sub)}</span></p>
          <p class="comp__hud comp__hud--tr mono"><i class="pulse" aria-hidden="true"></i>En vivo · simulación</p>
          <p class="comp__hud comp__hud--bl mono dim">${esc(c.meta)}</p>
        </div>

        <div class="comp__info">
          <p class="comp__flag"><span>${esc(c.flag)}</span></p>
          <p class="mono dim">${metaLine}</p>
          <h3 class="comp__name" data-scramble>${esc(c.name)}</h3>
          <p class="comp__summary">${esc(c.summary)}</p>
          <p class="comp__detail dim">${esc(c.detail ?? PENDING_DETAIL)}</p>
          ${action}
        </div>
      </article>`;
    })
    .join('');

  return `
  <section class="section competitions" id="competencias" aria-labelledby="competencias-title">
    <div class="wrap">
      ${sectionHead('05', 'Competencias', `Concursos y hackatones<br>${pad2(competitions.length)} registro${competitions.length === 1 ? '' : 's'}`).replace('<h2 ', '<h2 id="competencias-title" ')}
      <ul class="tally">${tally}</ul>
      <div class="comp-list">${panels}</div>
    </div>
  </section>`;
}
