// CV francés (fr): A4, sobrio, accroche bajo el nombre, sin foto, 2 páginas.
import { esc, sentence, options, bullets, parts, link, certLine, page, reverseChrono } from './lib.mjs';

export const format = 'cv-fr';
export const pages = [2, 2];
export const usesPhoto = false;
export const requiredLabels = [
  'profile', 'experience', 'projects', 'education', 'certifications', 'continuing',
  'capabilities', 'languages', 'availability', 'tech',
];

const css = `
body { font-family: Arial, Helvetica, sans-serif; font-size: 8.2pt; line-height: 1.2; }
h1 { font-size: 19pt; letter-spacing: .3pt; }
.accroche { font-size: 10pt; font-weight: bold; margin: 1mm 0 1.5mm; }
.contact { font-size: 8.4pt; }
header { border-bottom: 1.2pt solid #000; padding-bottom: 2.5mm; }
h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: .5pt; margin: 4mm 0 1.6mm; padding-bottom: .5mm; border-bottom: .6pt solid #000; }
.entry { margin-bottom: 2.2mm; }
.head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; break-inside: avoid; break-after: avoid; }
.head .t { font-weight: bold; font-size: 9pt; }
.head .d { white-space: nowrap; }
.sub { font-style: italic; break-after: avoid; }
ul { list-style: disc; padding-left: 11pt; margin-top: .6mm; }
li { margin-bottom: .3mm; }
.note { margin-top: .5mm; font-size: 8.2pt; }
.kv { margin-bottom: 1mm; }
.kv b { font-weight: bold; }
`;

export function render(data, ctx) {
  const L = data.labels;
  const o = options(data, { maxBullets: 0, languageUse: false, tech: true });
  const p = data.person;

  const entry = (e, title, sub) => `<div class="entry">
<div class="head"><span class="t">${esc(title)}</span><span class="d">${esc(e.period)}</span></div>
${sub ? `<div class="sub">${esc(sub)}</div>` : ''}
${bullets(e.bullets, o.maxBullets)}
${o.languageUse && e.languageUse ? `<p class="note">${esc(e.languageUse)}</p>` : ''}
${o.tech && e.tech?.length ? `<p class="note">${esc(L.tech)} : ${esc(sentence(e.tech, data))}</p>` : ''}
</div>`;

  const d = data.education.degree;

  const body = `<header>
<h1>${esc(p.name)}</h1>
<p class="accroche">${esc(p.headline)}</p>
<p class="contact">${esc(parts([p.location, p.phone, p.email]))}</p>
<p class="contact">${p.links.map((l) => `${esc(l.label)} : ${link(l)}`).join(' | ')}</p>
</header>
<h2>${esc(L.profile)}</h2>
<p>${esc(data.profile)}</p>
<h2>${esc(L.experience)}</h2>
${reverseChrono(data.experience).map((e) => entry(e, parts([e.role, e.org], ' - '), parts([e.place, e.mode], ' · '))).join('')}
<h2>${esc(L.projects)}</h2>
${data.projects.map((j) => entry(j, j.title, parts([j.context, j.award], ' · '))).join('')}
<h2>${esc(L.education)}</h2>
<div class="entry">
<div class="head"><span class="t">${esc(parts([d.title, d.institution], ' - '))}</span><span class="d">${esc(d.period)}</span></div>
${d.status ? `<div class="sub">${esc(d.status)}</div>` : ''}
</div>
<p class="kv"><b>${esc(L.certifications)} :</b> ${data.education.certifications.map((c) => `${certLine(c)} (${esc(c.year)})`).join(' ; ')}.</p>
<p class="kv"><b>${esc(L.continuing)} :</b> ${esc(data.education.continuing)}</p>
<h2>${esc(L.capabilities)}</h2>
${data.capabilities.map((c) => `<p class="kv"><b>${esc(c.area)} :</b> ${esc(sentence(c.items, data))}</p>`).join('')}
<h2>${esc(L.languages)}</h2>
<p>${data.languages.map((l) => esc(`${l.name} : ${parts([l.level, l.note], ' - ')}`)).join(' | ')}.</p>
<h2>${esc(L.availability)}</h2>
<p>${esc(data.availability)}</p>`;

  return { html: page({ data, css, body, paper: 'A4', margin: '10mm 13mm' }) };
}
