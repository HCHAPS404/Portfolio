// Generador de hojas de vida en PDF, una por idioma/país.
//
//   node tools/cv/build.mjs                 todos los idiomas con JSON en tools/cv/content/
//   node tools/cv/build.mjs es en           solo esos códigos
//   node tools/cv/build.mjs --draft de ja   usa content/_draft/<código>.json y escribe en content/_draft/out/
//   node tools/cv/build.mjs --html es       guarda además el HTML intermedio junto al PDF
//
// Lee content/<código>.json, elige la plantilla según meta.format y la imprime con el Edge del sistema.
import { chromium } from 'playwright-core';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const contentDir = path.join(here, 'content');
const draftDir = path.join(contentDir, '_draft');
const photoPath = path.join(root, 'public', 'assets', 'img', 'profile', 'foto.png');

const args = process.argv.slice(2);
const draft = args.includes('--draft');
const keepHtml = args.includes('--html');
let codes = args.filter((a) => !a.startsWith('--'));

const srcDir = draft ? draftDir : contentDir;
const outDir = draft ? path.join(draftDir, 'out') : path.join(root, 'public', 'assets', 'docs');

if (!codes.length) {
  codes = (await readdir(srcDir)).filter((f) => /^[a-z]{2}(-[A-Za-z]+)?\.json$/.test(f)).map((f) => f.replace(/\.json$/, '')).sort();
}
if (!codes.length) {
  console.error(`No hay JSON de contenido en ${srcDir}`);
  process.exit(1);
}

const REQUIRED = ['meta', 'person', 'profile', 'capabilities', 'experience', 'projects', 'education', 'languages', 'availability', 'labels'];

function validate(code, data, tpl) {
  const errors = [];
  for (const k of REQUIRED) if (data[k] == null) errors.push(`falta la clave «${k}»`);
  if (!errors.length) {
    for (const k of ['lang', 'format']) if (!data.meta[k]) errors.push(`falta meta.${k}`);
    for (const k of ['name', 'headline', 'location', 'phone', 'email', 'links', 'availability']) if (!data.person[k]) errors.push(`falta person.${k}`);
    for (const k of tpl?.requiredLabels ?? []) if (!data.labels[k]) errors.push(`falta labels.${k} (lo exige la plantilla «${data.meta.format}»)`);
    for (const k of tpl?.requiredFields ?? []) {
      const v = k.split('.').reduce((o, p) => o?.[p], data);
      if (v == null || v === '') errors.push(`falta ${k} (lo exige la plantilla «${data.meta.format}»)`);
    }
  }
  if (errors.length) throw new Error(`${code}.json no es válido:\n  - ${errors.join('\n  - ')}`);
}

const countPages = (buf) => (buf.toString('latin1').match(/\/Type\s*\/Page(?![a-zA-Z])/g) ?? []).length;

async function toPdf(browser, html) {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true });
  await page.close();
  return buf;
}

let photo = null;
const loadPhoto = async () =>
  (photo ??= existsSync(photoPath) ? `data:image/png;base64,${(await readFile(photoPath)).toString('base64')}` : '');

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
let failed = false;

try {
  for (const code of codes) {
    try {
      const data = JSON.parse(await readFile(path.join(srcDir, `${code}.json`), 'utf8'));
      const format = data.meta?.format;
      const tplPath = path.join(here, 'templates', `${format}.mjs`);
      if (!format || !existsSync(tplPath)) throw new Error(`${code}.json: meta.format «${format}» no tiene plantilla en tools/cv/templates/`);
      const tpl = await import(new URL(`./templates/${format}.mjs`, import.meta.url));
      validate(code, data, tpl);

      const ctx = { code, photo: tpl.usesPhoto ? await loadPhoto() : '' };
      const out = tpl.render(data, ctx);
      const pdf = await toPdf(browser, out.html);
      const file = path.join(outDir, `cv-${code}.pdf`);
      await writeFile(file, pdf);
      if (keepHtml) await writeFile(file.replace(/\.pdf$/, '.html'), out.html);

      const n = countPages(pdf);
      let detail = '';
      let ok = !tpl.pages || (n >= tpl.pages[0] && n <= tpl.pages[1]);
      if (out.parts) {
        // Documento compuesto (ja): se cuenta cada parte por separado.
        const counts = [];
        for (const part of out.parts) {
          const pn = countPages(await toPdf(browser, part.html));
          counts.push(`${part.name}: ${pn}`);
          if (part.pages && (pn < part.pages[0] || pn > part.pages[1])) ok = false;
        }
        detail = ` (${counts.join(' + ')})`;
      }
      const target = tpl.pages ? `objetivo ${tpl.pages[0]}-${tpl.pages[1]}` : '';
      console.log(`cv-${code}.pdf  [${format}]  ${n} página${n === 1 ? '' : 's'}${detail}  ${ok ? 'OK' : 'FUERA DE RANGO'} ${target}  ->  ${path.relative(root, file)}`);
    } catch (err) {
      failed = true;
      console.error(`ERROR ${code}: ${err.message}`);
    }
  }
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
