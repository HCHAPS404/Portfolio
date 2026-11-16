// 简历 (zh): cabecera con datos y foto, 求职意向, 教育背景 antes de la experiencia, rótulos en bandas. 2 páginas.
import { esc, sentence, options, bullets, parts, link, certLine, page, reverseChrono, photoTag } from './lib.mjs';

export const format = 'jianli';
export const pages = [2, 2];
export const usesPhoto = true;
export const requiredLabels = [
  'docTitle', 'location', 'phone', 'email', 'objective', 'education', 'certifications', 'continuing',
  'experience', 'projects', 'capabilities', 'languages', 'profile', 'tech',
];
export const requiredFields = ['objective'];

const css = `
body { font-family: "Microsoft YaHei", "Noto Sans SC", sans-serif; font-size: 8.6pt; line-height: 1.38; }
.top { display: flex; justify-content: space-between; align-items: flex-start; gap: 6mm; }
.top .data { flex: 1; }
.doc { font-size: 9pt; letter-spacing: 3pt; }
h1 { font-size: 19pt; margin: 0 0 1.5mm; }
.kv { display: grid; grid-template-columns: 16mm 1fr; column-gap: 2mm; }
.kv .k { font-weight: bold; }
.photo { width: 27mm; height: 36mm; border: .5pt solid #000; }
h2 { font-size: 10pt; background: #e2e2e2; border-left: 3pt solid #000; padding: .6mm 2.5mm; margin: 3.2mm 0 1.6mm; }
.obj { display: grid; grid-template-columns: 1fr 1fr; column-gap: 6mm; row-gap: .5mm; }
.entry { margin-bottom: 1.8mm; }
.head { display: grid; grid-template-columns: 36mm 1fr; column-gap: 3mm; break-inside: avoid; break-after: avoid; }
.head .t { font-weight: bold; }
.sub { padding-left: 39mm; break-after: avoid; }
ul { list-style: disc; padding-left: 11pt; margin: .4mm 0 0 39mm; }
li { margin-bottom: .1mm; }
.note { margin: .3mm 0 0 39mm; font-size: 8.2pt; }
.line { margin-bottom: .8mm; }
.line b { font-weight: bold; }
`;

export function render(data, ctx) {
  const L = data.labels;
  const o = options(data, { maxBullets: 0, languageUse: false, tech: true, photoColor: false });
  const p = data.person;
  const sep = data.meta.labelSeparator ?? '：';

  const kv = [
    [L.location, esc(p.location)],
    [L.phone, esc(p.phone)],
    [L.email, esc(p.email)],
    ...p.links.map((l) => [l.label, link(l)]),
  ];

  const entry = (e, title, sub) => `<div class="entry">
<div class="head"><span>${esc(e.period)}</span><span class="t">${esc(title)}</span></div>
${sub ? `<div class="sub">${esc(sub)}</div>` : ''}
${bullets(e.bullets, o.maxBullets)}
${o.languageUse && e.languageUse ? `<p class="note">${esc(e.languageUse)}</p>` : ''}
${o.tech && e.tech?.length ? `<p class="note">${esc(L.tech)}${sep}${esc(sentence(e.tech, data))}</p>` : ''}
</div>`;

  const d = data.education.degree;

  const body = `<div class="top">
<div class="data">
<p class="doc">${esc(L.docTitle)}</p>
<h1>${esc(p.name)}</h1>
<div class="kv">${kv.map(([k, v]) => `<span class="k">${esc(k)}</span><span>${v}</span>`).join('')}</div>
</div>
${photoTag(ctx, o)}
</div>
<h2>${esc(L.objective)}</h2>
<div class="obj">${data.objective.map((r) => `<div><b>${esc(r.label)}</b>${sep}${esc(r.value)}</div>`).join('')}</div>
<h2>${esc(L.education)}</h2>
<div class="entry">
<div class="head"><span>${esc(d.period)}</span><span class="t">${esc(parts([d.institution, d.title, d.status], ' | '))}</span></div>
</div>
<p class="line"><b>${esc(L.certifications)}</b>${sep}${data.education.certifications.map((c) => `${certLine(c)} (${esc(c.year)})`).join('；')}</p>
<p class="line"><b>${esc(L.continuing)}</b>${sep}${esc(data.education.continuing)}</p>
<h2>${esc(L.experience)}</h2>
${reverseChrono(data.experience).map((e) => entry(e, parts([e.org, e.role], ' | '), parts([e.place, e.mode], ' · '))).join('')}
<h2>${esc(L.projects)}</h2>
${data.projects.map((j) => entry(j, j.title, parts([j.context, j.award], ' · '))).join('')}
<h2>${esc(L.capabilities)}</h2>
${data.capabilities.map((c) => `<p class="line"><b>${esc(c.area)}</b>${sep}${esc(sentence(c.items, data))}</p>`).join('')}
<h2>${esc(L.languages)}</h2>
<p>${data.languages.map((l) => esc(`${l.name}${sep}${parts([l.level, l.note], ' - ')}`)).join('；')}</p>
<h2>${esc(L.profile)}</h2>
<p>${esc(data.profile)}</p>`;

  return { html: page({ data, css, body, paper: 'A4', margin: '13mm 15mm' }) };
}
