import { education, certificates } from '../data.js';
import { esc, pad2, sectionHead } from '../core/dom.js';

function degreeProgress(period) {
  const [from, to] = period.split('–').map((y) => parseInt(y, 10));
  if (!from || !to) return null;
  const now = new Date().getFullYear() + new Date().getMonth() / 12;
  return Math.round(Math.min(1, Math.max(0, (now - from) / (to - from))) * 100);
}

export function renderEducation() {
  const degrees = education
    .map((e) => {
      const [from, to] = e.period.split('–').map((s) => s.trim());
      const pct = degreeProgress(e.period);
      return `
      <article class="degree corners" data-reveal>
        <p class="mono dim">Educación académica</p>
        <p class="degree__years" aria-label="${esc(e.period)}">
          <span>${esc(from)}</span><i aria-hidden="true"></i><span>${esc(to)}</span>
        </p>
        <h3 class="degree__title">${esc(e.degree)}</h3>
        <p class="degree__inst">${esc(e.institution)}</p>
        ${
          pct === null
            ? ''
            : `<div class="degree__progress">
                <span class="mono"><i class="pulse" aria-hidden="true"></i>${esc(e.status)}</span>
                <span class="degree__bar" aria-hidden="true"><i data-fill="${pct}"></i></span>
                <span class="mono dim">Línea de tiempo</span>
              </div>`
        }
      </article>`;
    })
    .join('');

  const rows = certificates
    .map(
      (c, i) => `
      <li class="cert" data-reveal data-cursor>
        <span class="cert__no">${pad2(i + 1)}</span>
        <span class="cert__name">${esc(c.name)}${c.award ? ' <span class="flag">Beca</span>' : ''}</span>
        <span class="cert__issuer">${esc(c.issuer)}</span>
        <span class="cert__date">${esc(c.date || '—')}</span>
      </li>`,
    )
    .join('');

  return `
  <section class="section education" id="formacion" aria-labelledby="formacion-title">
    <div class="wrap">
      ${sectionHead('02', 'Formación', `Educación<br>${pad2(certificates.length)} certificaciones`).replace('<h2 ', '<h2 id="formacion-title" ')}

      <div class="education__grid">
        <div class="education__degrees">${degrees}</div>

        <div class="education__certs">
          <p class="cert cert--head mono dim" aria-hidden="true">
            <span>N.º</span><span>Certificación</span><span>Emisor</span><span>Año</span>
          </p>
          <ol>${rows}</ol>
        </div>
      </div>
    </div>
  </section>`;
}
