// Utilidades compartidas por todas las plantillas de hoja de vida.

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Une una lista (o devuelve la cadena tal cual). `sep` depende del idioma: ", " o "、". */
export const joinList = (v, sep = ', ') => (Array.isArray(v) ? v.filter(Boolean).join(sep) : String(v ?? ''));

/** Separador de listas propio del idioma. */
export const listSep = (data) => data.meta.listSeparator ?? (['zh', 'ja'].includes(data.meta.lang) ? '、' : ', ');

/** Lista terminada en punto (el punto también depende del idioma). */
export function sentence(v, data) {
  const s = joinList(v, listSep(data)).trim();
  if (!s) return '';
  const stop = data.meta.fullStop ?? (['zh', 'ja'].includes(data.meta.lang) ? '。' : '.');
  return /[.。!?！？]$/.test(s) ? s : s + stop;
}

/** Opciones de la plantilla: valores por defecto del formato + `meta.options` del JSON. */
export const options = (data, defaults) => ({ ...defaults, ...(data.meta.options ?? {}) });

/** Viñetas, opcionalmente recortadas con `maxBullets`. */
export function bullets(items, max) {
  const list = (items ?? []).filter(Boolean);
  const shown = max ? list.slice(0, max) : list;
  if (!shown.length) return '';
  return `<ul>${shown.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;
}

/** Une con un separador solo las partes que no están vacías. */
export const parts = (arr, sep = ' | ') => arr.filter((x) => x != null && String(x).trim() !== '').join(sep);

const key = (v, isEnd) => {
  if (!v) return 0;
  if (v === 'present') return 999999;
  const [y, m] = String(v).split('-').map(Number);
  return y * 100 + (m || (isEnd ? 12 : 1));
};

/** Orden cronológico inverso: primero lo vigente, luego por fecha de fin y de inicio. */
export function reverseChrono(list) {
  return [...list].sort((a, b) => key(b.end, true) - key(a.end, true) || key(b.start) - key(a.start));
}

/** Fecha de emisión del documento: `meta.date` (AAAA-MM-DD) o la del día de la compilación. */
export function docDate(data) {
  const d = data.meta.date ? new Date(data.meta.date + 'T12:00:00') : new Date();
  return {
    date: d,
    long: new Intl.DateTimeFormat(data.meta.locale ?? data.meta.lang, { dateStyle: 'long' }).format(d),
    numeric: new Intl.DateTimeFormat(data.meta.locale ?? data.meta.lang, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d),
  };
}

export const link = (l) => `<a href="${esc(l.url)}">${esc(l.display ?? l.url)}</a>`;

export const certLine = (c) => esc(c.name) + (c.issuer ? ` - ${esc(c.issuer)}` : '');

/** Documento HTML completo. */
export function page({ data, css, body, paper = 'A4', margin = '14mm' }) {
  return `<!doctype html>
<html lang="${esc(data.meta.lang)}">
<head>
<meta charset="utf-8">
<title>${esc(data.meta.title ?? data.person.name)}</title>
<style>
@page { size: ${paper}; margin: ${margin}; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { color: #000; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
a { color: inherit; text-decoration: none; }
h1, h2, h3, h4, p, ul { margin: 0; padding: 0; }
h1, h2, h3, h4 { break-after: avoid; }
li { break-inside: avoid; }
.keep { break-inside: avoid; }
.photo { object-fit: cover; object-position: 58% 30%; display: block; }
.photo.gray { filter: grayscale(1); }
${css}
</style>
</head>
<body>
${body}
</body>
</html>`;
}

/** Estilos de la rejilla «rótulo a la izquierda / contenido a la derecha» (de, it, ru, zh). */
// `.row`  = fila corta (rejilla, no se parte entre páginas).
// `.entry` = fila larga (experiencia, proyectos): todo en flujo normal para que se parta bien entre
//            páginas y el texto quede en el PDF en orden de lectura; la fecha es un bloque de altura 0.
export const rowCss = (leftWidth, gap = '4mm') => `
.row { display: grid; grid-template-columns: ${leftWidth} 1fr; column-gap: ${gap}; break-inside: avoid; }
.entry > .ehead { break-inside: avoid; break-after: avoid; }
.entry .l { width: ${leftWidth}; height: 0; overflow: visible; }
.entry .r { margin-left: calc(${leftWidth} + ${gap}); }
`;

export const row = (left, right, cls = '') =>
  `<div class="row ${cls}"><div class="l">${left}</div><div class="r">${right}</div></div>`;

/** Fila larga: `left` (fecha) + cabecera que no se separa + cuerpo que sí puede partirse. */
export const entryRow = (left, head, body = '') =>
  `<div class="entry"><div class="ehead"><div class="l">${left}</div><div class="r">${head}</div></div>${body.trim() ? `<div class="r">${body}</div>` : ''}</div>`;

export const photoTag = (ctx, opt, cls = '') =>
  ctx.photo ? `<img class="photo ${opt.photoColor ? '' : 'gray'} ${cls}" src="${ctx.photo}" alt="">` : '';
