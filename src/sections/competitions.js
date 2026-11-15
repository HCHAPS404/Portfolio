import { competitions } from '../data.js';
import { esc, pad2, sectionHead } from '../core/dom.js';
import { t, tn } from '../i18n/index.js';

/** Medalla de puntos de reloj: anillo graduado giratorio, anillo punteado inverso y el puesto. */
function medal(place) {
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const r1 = i % 5 === 0 ? 40 : 43.5;
    ticks += `M${(50 + Math.cos(a) * r1).toFixed(2)} ${(50 + Math.sin(a) * r1).toFixed(2)}L${(50 + Math.cos(a) * 47).toFixed(2)} ${(50 + Math.sin(a) * 47).toFixed(2)}`;
  }
  return `
  <svg class="medal" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <g class="medal__spin"><circle cx="50" cy="50" r="48.5"/><path d="${ticks}"/></g>
    <circle cx="50" cy="50" r="35"/>
    <g class="medal__spin medal__spin--rev"><circle cx="50" cy="50" r="30" stroke-dasharray="1.5 4.5"/></g>
    <text class="medal__no" x="50" y="64" text-anchor="middle">${esc(place)}</text>
  </svg>`;
}

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
        ? `<a class="btn" href="${esc(c.repo)}" target="_blank" rel="noopener" data-cursor data-magnetic>${esc(t('comp.repo'))} <span class="btn__arrow" aria-hidden="true">↗</span></a>`
        : '';
      return `
      <article class="comp comp--place-${esc(c.place ?? 0)}" data-reveal>
        <div class="comp__visual" data-wipe>
          <canvas class="comp__canvas" data-visual="${esc(c.visual ?? 'terrain')}" aria-hidden="true"></canvas>
        </div>

        <div class="comp__info">
          <p class="comp__flag">
            <span>${esc(c.flag)}</span>
            <span class="comp__medal">${medal(c.place ?? 0)}</span>
          </p>
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
      ${sectionHead('05', t('nav.competitions'), `${esc(t('comp.meta_a'))}<br>${esc(tn('comp.count', competitions.length, { n: pad2(competitions.length) }))}`).replace('<h2 ', '<h2 id="competencias-title" ')}
      <ul class="tally">${tally}</ul>
      <div class="comp-list">${panels}</div>
    </div>
  </section>`;
}
