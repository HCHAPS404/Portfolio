// Valida un archivo de traducción contra la plantilla en español.
// Uso: node tools/i18n/check.mjs <codigo> [<codigo> …]   (por ejemplo: en de fr)
//      node tools/i18n/check.mjs all
// Sale con código 1 si hay errores.
import { existsSync, readFileSync } from 'node:fs';

const CODES = ['en', 'de', 'fr', 'ru', 'zh', 'ja', 'it'];
const args = process.argv.slice(2);
const targets = args[0] === 'all' || args.length === 0 ? CODES : args;
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
