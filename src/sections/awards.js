import { awards } from '../data.js';
import { esc, pad2, sectionHead } from '../core/dom.js';
import { t } from '../i18n/index.js';

export function renderAwards() {
  const rows = awards
    .map(
      (a, i) => `
      <li class="award${a.featured ? ' award--featured' : ''}" data-reveal data-cursor tabindex="0">
        <span class="award__year">${esc(a.year)}</span>
        <div class="award__main">
          <h3 class="award__title">${esc(a.title)}</h3>
          <p class="award__org mono dim">${esc(a.org)}</p>
          <p class="award__desc">${esc(a.desc)}</p>
        </div>
        <span class="award__flag flag">${esc(a.flag)}</span>
        <span class="award__no" aria-hidden="true">${pad2(i + 1)}</span>
      </li>`,
    )
    .join('');

  return `
  <section class="section awards" id="premios" aria-labelledby="premios-title">
    <div class="wrap">
      ${sectionHead('07', t('awards.title'), `${esc(t('awards.meta_a'))}<br>${esc(t('awards.meta_b', { n: pad2(awards.length) }))}`).replace('<h2 ', '<h2 id="premios-title" ')}
      <ol class="awards__list">${rows}</ol>
    </div>
  </section>`;
}
