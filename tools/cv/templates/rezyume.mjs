// Резюме (ru): ФИО, желаемая должность, контакты; опыт en orden cronológico inverso con fechas a la izquierda.
import { esc, sentence, options, bullets, parts, link, certLine, page, rowCss, row, entryRow, reverseChrono } from './lib.mjs';

export const format = 'rezyume';
export const pages = [2, 3];
export const usesPhoto = false;
export const requiredLabels = [
  'docTitle', 'desiredPosition', 'location', 'phone', 'email', 'availability', 'experience', 'projects',
  'education', 'certifications', 'continuing', 'capabilities', 'languages', 'profile', 'tech',
];

const css = `
body { font-family: Arial, sans-serif; font-size: 8.7pt; line-height: 1.25; }
${rowCss('31mm')}
.doc { font-size: 9pt; letter-spacing: 2pt; text-transform: uppercase; }
h1 { font-size: 19pt; margin: .5mm 0 2.5mm; }
header { border-bottom: 1.2pt solid #000; padding-bottom: 2mm; }
header .row { margin-bottom: .6mm; }
header .l { font-weight: bold; }
h2 { font-size: 10.5pt; margin: 4.2mm 0 1.8mm; padding-bottom: .5mm; border-bottom: .6pt solid #000; }
.row { margin-bottom: 1.5mm; }
.entry { margin-bottom: 2.4mm; }
.role { font-weight: bold; font-size: 9pt; }
.area .l { font-weight: bold; }
ul { list-style: disc; padding-left: 11pt; margin-top: .8mm; }
li { margin-bottom: .3mm; }
.note { margin-top: .6mm; font-size: 8.2pt; }
`;

export function render(data, ctx) {
  const L = data.labels;
  const o = options(data, { maxBullets: 0, languageUse: false, tech: false });
  const p = data.person;

  const entry = (e, sub) =>
    entryRow(
      esc(e.period),
      `<div class="role">${esc(e.role ?? e.title)}</div><div>${esc(sub)}</div>`,
      `${bullets(e.bullets, o.maxBullets)}
${o.languageUse && e.languageUse ? `<p class="note">${esc(e.languageUse)}</p>` : ''}
${o.tech && e.tech?.length ? `<p class="note">${esc(L.tech)}: ${esc(sentence(e.tech, data))}</p>` : ''}`
    );

  const d = data.education.degree;
  const head = [
    [L.desiredPosition, `<b>${esc(p.desiredPosition ?? p.headline)}</b>`],
    [L.availability, esc(p.availability)],
    [L.location, esc(p.location)],
    [L.phone, esc(p.phone)],
    [L.email, esc(p.email)],
    ...p.links.map((l) => [l.label, link(l)]),
  ];

  const body = `<header>
<p class="doc">${esc(L.docTitle)}</p>
<h1>${esc(p.name)}</h1>
${head.map(([k, v]) => row(esc(k), v)).join('')}
</header>
<h2>${esc(L.experience)}</h2>
${reverseChrono(data.experience).map((e) => entry(e, parts([e.org, e.place, e.mode], ' · '))).join('')}
<h2>${esc(L.projects)}</h2>
${data.projects.map((j) => entry(j, parts([j.context, j.award], ' · '))).join('')}
<h2>${esc(L.education)}</h2>
${entryRow(esc(d.period), `<div class="role">${esc(d.institution)}</div><div>${esc(parts([d.title, d.status], ' · '))}</div>`)}
<h2>${esc(L.certifications)}</h2>
${data.education.certifications.map((c) => row(esc(c.year), certLine(c))).join('')}
${row(`<b>${esc(L.continuing)}</b>`, esc(data.education.continuing))}
<h2>${esc(L.capabilities)}</h2>
${data.capabilities.map((c) => row(esc(c.area), esc(sentence(c.items, data)), 'area')).join('')}
<h2>${esc(L.languages)}</h2>
${data.languages.map((l) => row(esc(l.name), esc(parts([l.level, l.note], ' - ')), 'area')).join('')}
<h2>${esc(L.profile)}</h2>
<p>${esc(data.profile)}</p>`;

  return { html: page({ data, css, body, paper: 'A4', margin: '14mm 16mm' }) };
}
