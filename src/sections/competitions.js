import { competitions } from '../data.js';
import { esc, pad2, sectionHead } from '../core/dom.js';

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
      const metaLine = [c.no, c.org, c.year].filter(Boolean).map(esc).join(' · ');
      const action = c.repo
        ? `<a class="btn" href="${esc(c.repo)}" target="_blank" rel="noopener" data-cursor data-magnetic>Ver repositorio <span class="btn__arrow" aria-hidden="true">↗</span></a>`
        : '';
      return `
      <article class="comp comp--place-${esc(c.place ?? 0)}" data-reveal>
        <div class="comp__visual" data-wipe>
          <canvas class="comp__canvas" data-visual="${esc(c.visual ?? 'terrain')}" aria-hidden="true"></canvas>
        </div>

        <div class="comp__info">
          <p class="comp__flag"><span>${esc(c.flag)}</span></p>
          <p class="mono dim">${metaLine}</p>
          <h3 class="comp__name" data-scramble>${esc(c.name)}</h3>
          ${c.summary ? `<p class="comp__summary">${esc(c.summary)}</p>` : ''}
          ${c.detail ? `<p class="comp__detail dim">${esc(c.detail)}</p>` : ''}
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
