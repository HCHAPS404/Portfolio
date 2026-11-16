// Lebenslauf (de): tabular, fechas a la izquierda, foto arriba a la derecha, lugar/fecha/firma al final.
import { esc, sentence, options, bullets, parts, link, certLine, page, rowCss, row, entryRow, reverseChrono, docDate, photoTag } from './lib.mjs';

export const format = 'lebenslauf';
export const pages = [2, 3];
export const usesPhoto = true;
export const requiredLabels = [
  'docTitle', 'personal', 'name', 'location', 'phone', 'email', 'availability', 'profile', 'experience',
  'projects', 'education', 'certifications', 'continuing', 'capabilities', 'languages', 'tech',
];

const css = `
body { font-family: Arial, Helvetica, sans-serif; font-size: 8.6pt; line-height: 1.24; }
${rowCss('30mm')}
.top { display: flex; justify-content: space-between; align-items: flex-start; }
.top .data { flex: 1; padding-right: 8mm; }
h1 { font-size: 20pt; font-weight: bold; margin-bottom: 1mm; }
.headline { font-size: 9pt; margin-bottom: 3mm; }
.photo { width: 33mm; height: 44mm; border: .5pt solid #000; }
h2 { font-size: 11pt; margin: 4.5mm 0 2mm; padding-bottom: .6mm; border-bottom: .8pt solid #000; }
.row { margin-bottom: 1.6mm; }
.row.tight { margin-bottom: .5mm; }
.l { font-weight: bold; }
.entry .l { font-weight: normal; }
.entry .ehead .r { min-height: 2.5em; }
.entry { margin-bottom: 2.6mm; }
.role { font-weight: bold; font-size: 9.2pt; }
ul { list-style: disc; padding-left: 11pt; margin-top: .8mm; }
li { margin-bottom: .4mm; }
.note { margin-top: .8mm; font-size: 8.3pt; }
.sign { margin-top: 8mm; break-inside: avoid; break-before: avoid; }
.sign .line { margin-top: 12mm; width: 62mm; border-top: .6pt solid #000; padding-top: 1mm; }
`;

export function render(data, ctx) {
  const L = data.labels;
  const o = options(data, { maxBullets: 0, languageUse: false, tech: false, photoColor: false });
  const p = data.person;

  const personal = [
    [L.name, esc(p.name)],
    [L.location, esc(p.location)],
    [L.phone, esc(p.phone)],
    [L.email, esc(p.email)],
    ...p.links.map((l) => [l.label, link(l)]),
    [L.availability, esc(p.availability)],
  ]
    .map(([k, v]) => row(esc(k), v, 'tight'))
    .join('');

  const entry = (e, sub) =>
    entryRow(
      esc(e.period),
      `<div class="role">${esc(e.role ?? e.title)}</div><div>${esc(sub)}</div>`,
      `${bullets(e.bullets, o.maxBullets)}
${o.languageUse && e.languageUse ? `<p class="note">${esc(e.languageUse)}</p>` : ''}
${o.tech && e.tech?.length ? `<p class="note">${esc(L.tech)}: ${esc(sentence(e.tech, data))}</p>` : ''}`
    );

  const d = data.education.degree;
  const closing = data.closing ?? {};

  const body = `<div class="top">
<div class="data">
<h1>${esc(L.docTitle)}</h1>
<p class="headline">${esc(p.headline)}</p>
<h2>${esc(L.personal)}</h2>
${personal}
</div>
${photoTag(ctx, o)}
</div>
<h2>${esc(L.profile)}</h2>
<p>${esc(data.profile)}</p>
<h2>${esc(L.experience)}</h2>
${reverseChrono(data.experience).map((e) => entry(e, parts([e.org, e.place, e.mode], ' · '))).join('')}
<h2>${esc(L.projects)}</h2>
${data.projects.map((j) => entry(j, parts([j.context, j.award], ' · '))).join('')}
<h2>${esc(L.education)}</h2>
${entryRow(esc(d.period), `<div class="role">${esc(d.title)}</div><div>${esc(parts([d.institution, d.status], ' · '))}</div>`)}
<h2>${esc(L.certifications)}</h2>
${data.education.certifications.map((c) => row(esc(c.year), certLine(c), 'tight')).join('')}
${row(esc(L.continuing), esc(data.education.continuing), 'cont')}
<h2>${esc(L.capabilities)}</h2>
${data.capabilities.map((c) => row(esc(c.area), esc(sentence(c.items, data)))).join('')}
<h2>${esc(L.languages)}</h2>
${data.languages.map((l) => row(esc(l.name), esc(parts([l.level, l.note], ' - ')), 'tight')).join('')}
<div class="sign">
<p>${esc(parts([closing.place ?? p.location, closing.date ?? docDate(data).numeric], ', '))}</p>
<div class="line">${esc(p.name)}</div>
</div>`;

  return { html: page({ data, css, body, paper: 'A4', margin: '14mm 16mm' }) };
}
