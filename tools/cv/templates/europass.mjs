// Curriculum vitae «formato europeo» (it): rótulos a la izquierda, contenido a la derecha,
// tabla de idiomas por nivel MCER/QCER y autorización de tratamiento de datos al final.
import { esc, sentence, options, bullets, parts, link, certLine, page, rowCss, row, entryRow, reverseChrono, docDate } from './lib.mjs';

export const format = 'europass';
export const pages = [2, 3];
export const usesPhoto = false;
export const requiredLabels = [
  'docTitle', 'personal', 'name', 'location', 'phone', 'email', 'availability', 'profile', 'experience',
  'projects', 'education', 'certifications', 'continuing', 'capabilities', 'languages', 'motherTongue',
  'otherLanguages', 'langCol', 'levelCol', 'noteCol', 'tech', 'privacy',
];

const css = `
body { font-family: Arial, Helvetica, sans-serif; font-size: 8.7pt; line-height: 1.25; }
${rowCss('36mm', '0mm')}
.entry .l { width: 36mm; }
.entry { break-before: auto; }
.l { text-align: right; padding-right: 3.5mm; }
.r { border-left: .6pt solid #000; padding-left: 3.5mm; padding-bottom: 1.5mm; }
.title .l { font-size: 15pt; font-weight: bold; }
.title .r { font-size: 15pt; font-weight: bold; }
.sec { margin-top: 3mm; break-after: avoid; }
.sec .l { font-weight: bold; text-transform: uppercase; font-size: 9pt; letter-spacing: .2pt; break-after: avoid; }
.sec .r { border-left: 0; border-bottom: .6pt solid #000; padding-bottom: 0; height: 1.2em; margin-bottom: 1.5mm; }
.role { font-weight: bold; font-size: 9pt; }
ul { list-style: disc; padding-left: 11pt; margin-top: .8mm; }
li { margin-bottom: .3mm; }
.note { margin-top: .6mm; font-size: 8.2pt; }
table.lang { border-collapse: collapse; width: 100%; }
table.lang th, table.lang td { border: .5pt solid #000; padding: .8mm 1.6mm; text-align: left; vertical-align: top; font-weight: normal; }
table.lang th { font-weight: bold; }
.privacy { margin-top: 5mm; font-size: 8.2pt; break-inside: avoid; break-before: avoid; }
.sign { display: flex; justify-content: space-between; margin-top: 9mm; }
.sign .line { width: 60mm; border-top: .6pt solid #000; padding-top: 1mm; text-align: center; }
`;

export function render(data, ctx) {
  const L = data.labels;
  const o = options(data, { maxBullets: 0, languageUse: false, tech: false });
  const p = data.person;
  const sec = (t) => row(esc(t), '', 'sec');

  const entry = (e, sub) =>
    entryRow(
      esc(e.period),
      `<div class="role">${esc(e.role ?? e.title)}</div><div>${esc(sub)}</div>`,
      `${bullets(e.bullets, o.maxBullets)}
${o.languageUse && e.languageUse ? `<p class="note">${esc(e.languageUse)}</p>` : ''}
${o.tech && e.tech?.length ? `<p class="note">${esc(L.tech)}: ${esc(sentence(e.tech, data))}</p>` : ''}`
    );

  const d = data.education.degree;
  const native = data.languages.filter((l) => l.native);
  const other = data.languages.filter((l) => !l.native);
  const closing = data.closing ?? {};

  const body = `${row(esc(L.docTitle), esc(p.name), 'title')}
${sec(L.personal)}
${row(esc(L.name), `<b>${esc(p.name)}</b>`)}
${row(esc(L.location), esc(p.location))}
${row(esc(L.phone), esc(p.phone))}
${row(esc(L.email), esc(p.email))}
${p.links.map((l) => row(esc(l.label), link(l))).join('')}
${row(esc(L.availability), esc(p.availability))}
${sec(L.profile)}
${row('', `<div class="role">${esc(p.headline)}</div><p>${esc(data.profile)}</p>`)}
${sec(L.experience)}
${reverseChrono(data.experience).map((e) => entry(e, parts([e.org, e.place, e.mode], ' · '))).join('')}
${sec(L.projects)}
${data.projects.map((j) => entry(j, parts([j.context, j.award], ' · '))).join('')}
${sec(L.education)}
${entryRow(esc(d.period), `<div class="role">${esc(d.title)}</div><div>${esc(parts([d.institution, d.status], ' · '))}</div>`)}
${row(esc(L.certifications), `<ul style="margin-top:0">${data.education.certifications.map((c) => `<li>${certLine(c)} (${esc(c.year)})</li>`).join('')}</ul>`)}
${row(esc(L.continuing), esc(data.education.continuing))}
${sec(L.capabilities)}
${row(esc(L.motherTongue), `<b>${esc(native.map((l) => l.name).join(', '))}</b>`)}
${row(
  esc(L.otherLanguages),
  `<table class="lang"><thead><tr><th>${esc(L.langCol)}</th><th>${esc(L.levelCol)}</th><th>${esc(L.noteCol)}</th></tr></thead><tbody>${other
    .map((l) => `<tr><td>${esc(l.name)}</td><td>${esc(l.level)}</td><td>${esc(l.note)}</td></tr>`)
    .join('')}</tbody></table>`
)}
${data.capabilities.map((c) => row(esc(c.area), esc(sentence(c.items, data)))).join('')}
<div class="privacy">
<p>${esc(L.privacy)}</p>
<div class="sign"><p>${esc(parts([closing.place ?? p.location, closing.date ?? docDate(data).numeric], ', '))}</p><div class="line">${esc(p.name)}</div></div>
</div>`;

  return { html: page({ data, css, body, paper: 'A4', margin: '14mm 15mm' }) };
}
