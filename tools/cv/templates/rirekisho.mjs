// 履歴書 + 職務経歴書 (ja): un solo PDF con dos documentos.
// 1) 履歴書: formulario de cuadrícula tipo JIS / 厚生労働省 (2 páginas A4). Los datos que la fuente no trae
//    (生年月日, 性別, 郵便番号, 連絡先) quedan como casillas vacías para rellenar a mano.
// 2) 職務経歴書: 職務要約, 職務経歴 por empresa, 活かせる経験・知識・技術, 資格, 自己PR.
import { esc, sentence, options, parts, link, certLine, page, reverseChrono, docDate, photoTag } from './lib.mjs';

export const format = 'rirekisho';
export const pages = [4, 5];
export const usesPhoto = true;
export const requiredLabels = [
  'docTitle', 'asOf', 'furigana', 'name', 'birth', 'birthBlank', 'gender', 'photoHint', 'address', 'postal',
  'phone', 'email', 'contact', 'contactNote', 'year', 'month', 'history', 'educationHeader', 'workHeader',
  'current', 'end', 'licenses', 'motivation', 'requests',
  'shokumuTitle', 'summary', 'experience', 'business', 'employment', 'position', 'duties', 'achievements',
  'tech', 'projects', 'overview', 'capabilities', 'certifications', 'languages', 'selfPR',
];
export const requiredFields = [
  'person.nameKana', 'rirekisho.education', 'rirekisho.work', 'rirekisho.motivation', 'rirekisho.requests',
  'shokumu.summary', 'shokumu.selfPR',
];

const ROWS_PAGE_1 = 19; // filas de 学歴・職歴 que caben en la primera hoja
const MIN_ROWS_PAGE_2 = 4;
const MIN_LICENSE_ROWS = 6;

const css = `
@page shokumu { size: A4; margin: 12mm 14mm; }
body { font-family: "Yu Gothic", "Meiryo", "Noto Sans JP", sans-serif; font-size: 9pt; line-height: 1.35; font-weight: 500; }
b, th, h1, h2, h3 { font-weight: bold; }

/* ---------- 履歴書 ---------- */
.sheet { height: 272mm; display: flex; flex-direction: column; break-after: page; }
table { border-collapse: collapse; width: 100%; table-layout: fixed; }
.rk td, .rk th { border: .5pt solid #000; padding: 0 2mm; vertical-align: middle; text-align: left; font-weight: 500; }
.rk table { border: 1.3pt solid #000; }
.rk .lab { font-size: 7.6pt; }
.titlebar { display: flex; justify-content: space-between; align-items: flex-end; height: 11mm; padding-bottom: 1.5mm; }
.titlebar .t { font-size: 18pt; font-weight: bold; letter-spacing: 6pt; }
.idblock { display: flex; align-items: flex-end; gap: 6mm; }
.idblock table { flex: 1; }
.photobox { width: 30mm; height: 40mm; border: .5pt solid #000; flex: none; margin-bottom: 1.5mm; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 7pt; }
.photobox .photo { width: 100%; height: 100%; }
.dash td, .dash th { border-bottom: .5pt dashed #000 !important; }
.kana { height: 6.5mm; font-size: 8pt; }
.namerow { height: 20mm; }
.namerow .v { font-size: 16pt; }
.birthrow { height: 9mm; }
.addr { margin-top: -1.3pt; }
.addrrow { height: 15mm; }
.addrrow td, .side { vertical-align: top !important; padding-top: 1mm !important; }
.side .v { display: block; margin-top: 1.5mm; font-size: 9pt; word-break: break-all; }
.gap { height: 3mm; flex: none; }
.hist th { height: 7mm; text-align: center !important; }
.hist td { height: 8.5mm; }
.hist .y, .hist .m { text-align: center; padding: 0; }
.hist .c { text-align: center; letter-spacing: 8pt; }
.hist .e { text-align: right; padding-right: 8mm; }
.box { border: 1.3pt solid #000; display: flex; flex-direction: column; }
.box .bh { border-bottom: .5pt solid #000; padding: 1mm 2mm; font-size: 8pt; flex: none; }
.box .bb { padding: 2mm 2.5mm; flex: 1; }
.box.grow { flex: 1; }
.box.req { min-height: 32mm; flex: none; }
.foot { font-size: 7pt; padding-top: 1mm; flex: none; }

/* ---------- 職務経歴書 ---------- */
.sk { page: shokumu; font-size: 8.2pt; }
.sk h1 { font-size: 16pt; text-align: center; letter-spacing: 6pt; margin-bottom: 2mm; }
.sk .meta { text-align: right; margin-bottom: 2mm; }
.sk h2 { font-size: 10.5pt; margin: 4.5mm 0 1.8mm; padding: .6mm 2mm; background: #e2e2e2; border-left: 3pt solid #000; }
.sk .co { margin-bottom: 3mm; }
.sk .cohead { display: flex; justify-content: space-between; gap: 4mm; border: .6pt solid #000; border-bottom: 0; background: #f0f0f0; padding: 1mm 2mm; font-weight: bold; break-inside: avoid; break-after: avoid; }
.sk td, .sk th { border: .6pt solid #000; padding: 1mm 2mm; vertical-align: top; text-align: left; font-weight: 500; }
.sk th { width: 24mm; background: #f6f6f6; font-weight: bold; }
.sk ul { list-style: disc; padding-left: 11pt; }
.sk .cert th { width: 16mm; }
.sk .pr { margin-bottom: 2mm; }
.sk .pr b { display: block; }
.sk .endmark { text-align: right; margin-top: 4mm; }
`;

const ul = (items) => `<ul>${items.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;

function rirekisho(data, ctx, o) {
  const L = data.labels;
  const p = data.person;
  const rk = data.rirekisho;
  const date = `${rk.date ?? docDate(data).long}${L.asOf}`;

  const line = (r) => `<tr><td class="y">${esc(r.year ?? '')}</td><td class="m">${esc(r.month ?? '')}</td><td class="${r.cls ?? ''}">${esc(r.text ?? '')}</td></tr>`;
  const rows = [
    { text: L.educationHeader, cls: 'c' },
    ...rk.education,
    { text: L.workHeader, cls: 'c' },
    ...rk.work,
    ...(data.experience.some((e) => e.end === 'present') ? [{ text: L.current, cls: 'e' }] : []),
    { text: L.end, cls: 'e' },
  ];
  const pad = (list, n) => [...list, ...Array.from({ length: Math.max(0, n - list.length) }, () => ({}))];
  const first = pad(rows.slice(0, ROWS_PAGE_1), ROWS_PAGE_1);
  const rest = pad(rows.slice(ROWS_PAGE_1), MIN_ROWS_PAGE_2);

  const licenses = pad(
    rk.licenses ??
      [...data.education.certifications]
        .sort((a, b) => Number(a.year) - Number(b.year))
        .map((c) => ({ year: c.year, month: '', text: c.name + (c.issuer ? `（${c.issuer}）` : '') })),
    MIN_LICENSE_ROWS
  );

  const cols = '<colgroup><col style="width:17mm"><col style="width:10mm"><col></colgroup>';
  const histTable = (list, title) => `<table class="hist">${cols}
<thead><tr><th>${esc(L.year)}</th><th>${esc(L.month)}</th><th>${esc(title)}</th></tr></thead>
<tbody>${list.map(line).join('')}</tbody></table>`;

  const photo = photoTag(ctx, o) || esc(L.photoHint);

  return `<div class="rk">
<div class="sheet">
<div class="titlebar"><span class="t">${esc(L.docTitle)}</span><span>${esc(date)}</span></div>
<div class="idblock">
<table>
<colgroup><col style="width:22mm"><col><col style="width:16mm"><col style="width:26mm"></colgroup>
<tr class="kana dash"><th class="lab">${esc(L.furigana)}</th><td colspan="3">${esc(p.nameKana)}</td></tr>
<tr class="namerow"><th class="lab">${esc(L.name)}</th><td colspan="3" class="v">${esc(p.name)}</td></tr>
<tr class="birthrow"><th class="lab">${esc(L.birth)}</th><td>${esc(L.birthBlank)}</td><th class="lab">${esc(L.gender)}</th><td></td></tr>
</table>
<div class="photobox">${photo}</div>
</div>
<table class="addr">
<colgroup><col style="width:22mm"><col><col style="width:52mm"></colgroup>
<tr class="kana dash"><th class="lab">${esc(L.furigana)}</th><td>${esc(p.locationKana ?? '')}</td><td rowspan="2" class="side"><span class="lab">${esc(L.phone)}</span><span class="v">${esc(p.phone)}</span></td></tr>
<tr class="addrrow"><th class="lab">${esc(L.address)}</th><td><span class="lab">${esc(L.postal)}</span><br>${esc(p.location)}</td></tr>
<tr class="kana dash"><th class="lab">${esc(L.furigana)}</th><td></td><td rowspan="2" class="side"><span class="lab">${esc(L.email)}</span><span class="v">${esc(p.email)}</span></td></tr>
<tr class="addrrow"><th class="lab">${esc(L.contact)}</th><td><span class="lab">${esc(L.postal)}　${esc(L.contactNote)}</span></td></tr>
</table>
<div class="gap"></div>
${histTable(first, L.history)}
</div>
<div class="sheet">
${histTable(rest, L.history)}
<div class="gap"></div>
${histTable(licenses, L.licenses)}
<div class="gap"></div>
<div class="box grow"><div class="bh">${esc(L.motivation)}</div><div class="bb">${esc(rk.motivation)}</div></div>
<div class="gap"></div>
<div class="box req"><div class="bh">${esc(L.requests)}</div><div class="bb">${esc(rk.requests)}</div></div>
${L.genderNote ? `<div class="foot">${esc(L.genderNote)}</div>` : ''}
</div>
</div>`;
}

function shokumu(data, o) {
  const L = data.labels;
  const p = data.person;
  const sk = data.shokumu;
  const date = `${data.rirekisho.date ?? docDate(data).long}${L.asOf}`;
  const tr = (k, v) => (v ? `<tr><th>${esc(k)}</th><td>${v}</td></tr>` : '');

  const company = (e) => `<div class="co">
<div class="cohead"><span>${esc(e.org)}</span><span>${esc(e.period)}</span></div>
<table>
${tr(L.business, esc(e.business ?? ''))}
${tr(L.employment, esc(parts([e.mode, e.place], ' / ')))}
${tr(L.position, esc(e.role))}
${tr(L.duties, ul((e.duties ?? e.bullets).slice(0, o.maxBullets || undefined)))}
${tr(L.achievements, e.achievements?.length ? ul(e.achievements) : '')}
${o.tech ? tr(L.tech, esc(sentence(e.tech, data))) : ''}
</table>
</div>`;

  const project = (j) => `<div class="co">
<div class="cohead"><span>${esc(j.title)}</span><span>${esc(j.period)}</span></div>
<table>
${tr(L.overview, esc(parts([j.context, j.award], ' / ')))}
${tr(L.duties, ul(j.bullets.slice(0, o.maxBullets || undefined)))}
${o.tech ? tr(L.tech, esc(sentence(j.tech, data))) : ''}
</table>
</div>`;

  const selfPR = [].concat(sk.selfPR).map((x) =>
    typeof x === 'string' ? `<p class="pr">${esc(x)}</p>` : `<p class="pr"><b>${esc(x.title)}</b>${esc(x.text)}</p>`
  );

  return `<div class="sk">
<h1>${esc(L.shokumuTitle)}</h1>
<p class="meta">${esc(date)}<br>${esc(L.name)}　${esc(p.name)}</p>
<h2>${esc(L.summary)}</h2>
<p>${esc(sk.summary)}</p>
<h2>${esc(L.experience)}</h2>
${reverseChrono(data.experience).map(company).join('')}
<h2>${esc(L.projects)}</h2>
${data.projects.map(project).join('')}
<h2>${esc(L.capabilities)}</h2>
<table>${data.capabilities.map((c) => `<tr><th style="width:42mm">${esc(c.area)}</th><td>${esc(sentence(c.items, data))}</td></tr>`).join('')}</table>
<h2>${esc(L.certifications)}</h2>
<table class="cert">${data.education.certifications.map((c) => `<tr><th>${esc(c.year)}</th><td>${certLine(c)}</td></tr>`).join('')}
<tr><th>${esc(L.languages)}</th><td>${data.languages.map((l) => esc(`${l.name}：${parts([l.level, l.note], ' - ')}`)).join('<br>')}</td></tr>
${p.links.map((l) => `<tr><th>${esc(l.label)}</th><td>${link(l)}</td></tr>`).join('')}</table>
<h2>${esc(L.selfPR)}</h2>
${selfPR.join('')}
<p class="endmark">${esc(L.end)}</p>
</div>`;
}

export function render(data, ctx) {
  const o = options(data, { maxBullets: 0, tech: true, photoColor: false });
  const a = rirekisho(data, ctx, o);
  const b = shokumu(data, o);
  const doc = (body) => page({ data, css, body, paper: 'A4', margin: '12mm' });
  return {
    html: doc(a + b),
    parts: [
      { name: '履歴書', html: doc(a), pages: [2, 2] },
      { name: '職務経歴書', html: doc(b), pages: [2, 3] },
    ],
  };
}
