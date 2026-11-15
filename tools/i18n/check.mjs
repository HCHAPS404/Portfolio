// Valida un archivo de traducción contra la plantilla en español.
// Uso: node tools/i18n/check.mjs <codigo> [<codigo> …]   (por ejemplo: en de fr)
//      node tools/i18n/check.mjs all
//      Añade --warnings para listar posibles mezclas de idioma (texto sin traducir o en otro alfabeto).
// Sale con código 1 si hay errores.
import { existsSync, readFileSync } from 'node:fs';

const CODES = ['en', 'de', 'fr', 'ru', 'zh', 'ja', 'it'];
const args = process.argv.slice(2);
const names = args.filter((a) => !a.startsWith('--'));
const targets = names[0] === 'all' || names.length === 0 ? CODES : names;
const source = JSON.parse(readFileSync('docs/i18n/source.es.json', 'utf8'));

const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
const hasLetters = (s) => /[\p{L}\p{N}]/u.test(s);
let failed = false;

for (const code of targets) {
  const file = `src/i18n/locales/${code}.json`;
  const errors = [];
  if (!existsSync(file)) {
    console.log(`✗ ${code}: no existe ${file}`);
    failed = true;
    continue;
  }
  let loc;
  try {
    loc = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    console.log(`✗ ${code}: JSON inválido (${e.message})`);
    failed = true;
    continue;
  }

  // Interfaz: mismas claves, mismos marcadores {…}, sin vacíos
  for (const [key, es] of Object.entries(source.ui)) {
    const value = loc.ui?.[key];
    if (typeof value !== 'string' || !value.trim()) errors.push(`ui.${key}: falta o está vacío`);
    else if (placeholders(value) !== placeholders(es)) errors.push(`ui.${key}: marcadores distintos (${placeholders(es) || '—'} → ${placeholders(value) || '—'})`);
  }
  for (const key of Object.keys(loc.ui ?? {})) if (!(key in source.ui)) errors.push(`ui.${key}: clave que no existe`);

  // Datos: misma forma, mismas longitudes de arreglo, sin vacíos ni campos extra
  const walk = (src, dst, path) => {
    if (Array.isArray(src)) {
      if (!Array.isArray(dst)) return errors.push(`${path}: debe ser una lista`);
      if (dst.length !== src.length) errors.push(`${path}: ${dst.length} elementos, se esperaban ${src.length}`);
      src.forEach((item, i) => walk(item, dst[i], `${path}[${i}]`));
    } else if (src && typeof src === 'object') {
      if (!dst || typeof dst !== 'object' || Array.isArray(dst)) return errors.push(`${path}: debe ser un objeto`);
      for (const key of Object.keys(src)) walk(src[key], dst[key], `${path}.${key}`);
      for (const key of Object.keys(dst)) if (!(key in src)) errors.push(`${path}.${key}: campo que no existe`);
    } else if (typeof dst !== 'string' || !hasLetters(dst)) errors.push(`${path}: falta o está vacío`);
  };
  walk(source.data, loc.data, 'data');

  // Texto que se quedó sin traducir (idéntico al español) en campos largos
  const long = [];
  const compare = (src, dst, path) => {
    if (Array.isArray(src)) src.forEach((x, i) => compare(x, dst?.[i], `${path}[${i}]`));
    else if (src && typeof src === 'object') Object.keys(src).forEach((k) => compare(src[k], dst?.[k], `${path}.${k}`));
    else if (typeof src === 'string' && src.length > 60 && src === dst && !path.endsWith('.tech')) long.push(path); // `.tech` son listas de tecnologías: pueden coincidir
  };
  compare(source.data, loc.data, 'data');
  for (const p of long) errors.push(`${p}: texto largo idéntico al español (sin traducir)`);

  // Avisos (no bloquean): posibles mezclas de idioma que hay que revisar a mano
  const warnings = [];
  const NATIVE = { ru: /[Ѐ-ӿ]/, zh: /[一-鿿]/, ja: /[぀-ヿ一-鿿]/ }[code];
  const leaves = [];
  const collect = (src, dst, path) => {
    if (Array.isArray(src)) src.forEach((x, i) => collect(x, dst?.[i], `${path}[${i}]`));
    else if (src && typeof src === 'object') Object.keys(src).forEach((k) => collect(src[k], dst?.[k], `${path}.${k}`));
    else if (typeof dst === 'string') leaves.push([path, src, dst]);
  };
  collect(source.ui, loc.ui, 'ui');
  collect(source.data, loc.data, 'data');
  for (const [path, src, dst] of leaves) {
    // Ruso, chino y japonés van completos en su escritura: ninguna palabra en alfabeto latino
    const latin = NATIVE ? dst.replace(/\{\w+\}/g, '').match(/[A-Za-zÀ-ÿ]{2,}/g) : null;
    if (latin) warnings.push(`${path}: alfabeto latino (${[...new Set(latin)].join(', ')}) → «${dst.length > 70 ? `${dst.slice(0, 70)}…` : dst}»`);
    else if (!NATIVE && src === dst && /\p{Ll}{4,}/u.test(dst)) warnings.push(`${path}: idéntico al español → «${dst}»`);
  }
  if (process.argv.includes('--warnings') && warnings.length) {
    console.log(`  ${code}: ${warnings.length} avisos para revisar`);
    warnings.forEach((w) => console.log(`   · ${w}`));
  }

  if (errors.length) {
    failed = true;
    console.log(`✗ ${code}: ${errors.length} problemas`);
    errors.slice(0, 25).forEach((e) => console.log(`   - ${e}`));
    if (errors.length > 25) console.log(`   … y ${errors.length - 25} más`);
  } else {
    console.log(`✓ ${code}: ${Object.keys(source.ui).length} textos de interfaz y todo el contenido`);
  }
}
process.exit(failed ? 1 : 0);
