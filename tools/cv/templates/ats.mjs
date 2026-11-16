// Formato ATS (es, en): una columna, sin tablas ni gráficos ni foto, tipografía del sistema.
import { esc, sentence, options, bullets, parts, link, certLine, page } from './lib.mjs';

export const format = 'ats';
export const pages = [2, 3];
export const usesPhoto = false;
export const requiredLabels = [
  'availabilityLead', 'profile', 'capabilities', 'experience', 'projects', 'education',
  'certifications', 'continuing', 'languages', 'availability', 'tech',
];

const css = `
body { font-family: Arial, Helvetica, sans-serif; font-size: 8.2pt; line-height: 1.19; }
header { text-align: center; }
h1 { font-size: 17pt; text-transform: uppercase; letter-spacing: .2pt; }
.headline { font-weight: bold; font-size: 8.2pt; text-transform: uppercase; margin-top: 1pt; }
.avail { font-weight: bold; }
h2 { font-size: 10pt; margin-top: 6pt; padding-bottom: 1pt; border-bottom: 1pt solid #000; margin-bottom: 3pt; }
h3 { font-size: 9pt; margin-top: 4pt; }
ul { list-style: disc; padding-left: 13pt; margin-top: 1.5pt; }
li { margin-bottom: 1pt; }
.note { margin-top: 1.5pt; }
.edu p { margin-bottom: 3pt; }
`;

export function render(data, ctx) {
  const L = data.labels;
  const o = options(data, { maxBullets: 0, languageUse: true, tech: true });
  const p = data.person;

  const header = `<header>
<h1>${esc(p.name)}</h1>
<p class="headline">${esc(p.headline)}</p>
<p>${esc(parts([p.location, p.phone, p.email]))}</p>
<p>${p.links.map((l) => `${esc(l.label)}: ${link(l)}`).join(' | ')}</p>
<p class="avail">${esc(L.availabilityLead)}: ${esc(p.availability)}</p>
</header>`;

  const capabilities = `<ul>${data.capabilities
    .map((c) => `<li>${esc(c.area)}: ${esc(sentence(c.items, data))}</li>`)
    .join('')}</ul>`;

  const experience = data.experience
    .map(
      (e) => `<section>
<h3>${esc(parts([e.role, e.org]))}</h3>
<p>${esc(parts([e.place, e.period, e.mode]))}</p>
${bullets(e.bullets, o.maxBullets)}
${o.languageUse && e.languageUse ? `<p class="note">${esc(e.languageUse)}</p>` : ''}
${o.tech && e.tech?.length ? `<p class="note">${esc(L.tech)}: ${esc(sentence(e.tech, data))}</p>` : ''}
</section>`
    )
    .join('\n');

  const projects = data.projects
    .map(
      (j) => `<section>
<h3>${esc(parts([j.title, j.context]))}</h3>
<p>${esc(parts([j.period, j.award]))}</p>
${bullets(j.bullets, o.maxBullets)}
${o.tech && j.tech?.length ? `<p class="note">${esc(L.tech)}: ${esc(sentence(j.tech, data))}</p>` : ''}
</section>`
    )
    .join('\n');

  const d = data.education.degree;
  const education = `<div class="edu">
<p>${esc(parts([d.title, d.institution, d.period, d.status]))}</p>
<p>${esc(L.certifications)}: ${data.education.certifications.map((c) => `${certLine(c)} (${esc(c.year)})`).join(' | ')}.</p>
<p>${esc(L.continuing)}: ${esc(data.education.continuing)}</p>
</div>`;

  const languages = `<p>${data.languages
    .map((l) => esc(`${l.name}: ${parts([l.level, l.note], ' - ')}`))
    .join(' | ')}.</p>`;

  const body = `${header}
<h2>${esc(L.profile)}</h2>
<p>${esc(data.profile)}</p>
<h2>${esc(L.capabilities)}</h2>
${capabilities}
<h2>${esc(L.experience)}</h2>
${experience}
<h2>${esc(L.projects)}</h2>
${projects}
<h2>${esc(L.education)}</h2>
${education}
<h2>${esc(L.languages)}</h2>
${languages}
<h2>${esc(L.availability)}</h2>
<p>${esc(data.availability)}</p>`;

  return { html: page({ data, css, body, paper: data.meta.paper ?? 'Letter', margin: '10mm 12mm' }) };
}
