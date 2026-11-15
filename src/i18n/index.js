/**
 * Internacionalización.
 *
 * - `locales/es.json` es la base: trae los textos de la interfaz (`ui`). El contenido
 *   en español vive en `data/*.json`.
 * - Cada otro idioma (`locales/<código>.json`) trae `ui` y un `data` con la misma forma
 *   que los JSON de contenido, solo con los campos de texto traducidos. Se carga
 *   bajo demanda y se funde sobre la base.
 * - Cambiar de idioma guarda la preferencia y recarga la página (ver `switchLang`).
 */
import es from './locales/es.json';
import { langFromCountry } from './geo.js';

/** Idiomas disponibles, en el orden en que se muestran en el selector. */
export const LANGS = [
  { code: 'es', short: 'ES', native: 'Español' },
  { code: 'en', short: 'EN', native: 'English' },
  { code: 'de', short: 'DE', native: 'Deutsch' },
  { code: 'fr', short: 'FR', native: 'Français' },
  { code: 'ru', short: 'РУ', native: 'Русский' },
  { code: 'zh', short: '中', native: '中文' },
  { code: 'ja', short: '日', native: '日本語' },
  { code: 'it', short: 'IT', native: 'Italiano' },
];

const STORAGE_KEY = 'portfolio-lang';
const SCROLL_KEY = 'portfolio-scroll';
const SWITCH_KEY = 'portfolio-switching';

// Carga perezosa de los idiomas distintos del español
const loaders = import.meta.glob(['./locales/*.json', '!./locales/es.json']);

let lang = 'es';
let ui = es.ui;
let overlay = {};

const isSupported = (code) => LANGS.some((l) => l.code === code);

/**
 * Elige el idioma inicial: ?lang= → elección guardada del visitante → país del
 * visitante → idioma del navegador → inglés (visitante internacional sin más pistas).
 */
export function detectLang() {
  try {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (isSupported(fromUrl)) {
      localStorage.setItem(STORAGE_KEY, fromUrl);
      return fromUrl;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isSupported(saved)) return saved;
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
  const byCountry = langFromCountry();
  if (isSupported(byCountry)) return byCountry;
  for (const candidate of navigator.languages ?? [navigator.language]) {
    const short = String(candidate).slice(0, 2).toLowerCase();
    if (isSupported(short)) return short;
  }
  return 'en';
}

/** Carga el idioma y prepara `t()` y `localize()`. */
export async function setupLang(code) {
  lang = isSupported(code) ? code : 'es';
  ui = es.ui;
  overlay = {};
  if (lang !== 'es') {
    const load = loaders[`./locales/${lang}.json`];
    if (load) {
      const mod = (await load()).default;
      ui = { ...es.ui, ...mod.ui };
      overlay = mod.data ?? {};
    }
  }
  document.documentElement.lang = lang;
  return lang;
}

export const getLang = () => lang;

/** Texto de la interfaz. Los marcadores `{nombre}` se sustituyen con `vars`. */
export function t(key, vars) {
  const text = ui[key];
  if (text === undefined) {
    if (import.meta.env.DEV) console.warn(`[i18n] falta la clave "${key}"`);
    return key;
  }
  return vars ? text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '') : text;
}

/** Texto con plural: usa `<clave>_one` cuando n es 1 y `<clave>_other` en el resto. */
export function tn(key, n, vars) {
  return t(n === 1 ? `${key}_one` : `${key}_other`, { n, ...vars });
}

function merge(base, over) {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base)) {
    if (!Array.isArray(over)) return base;
    return base.map((item, i) =>
      item && typeof item === 'object' ? merge(item, over[i]) : (over[i] ?? item),
    );
  }
  if (base && typeof base === 'object') {
    const out = { ...base };
    for (const key of Object.keys(over)) out[key] = merge(base[key], over[key]);
    return out;
  }
  return over;
}

/** Devuelve el contenido base con la traducción de `name` aplicada encima. */
export function localize(base, name) {
  return merge(base, overlay[name]);
}

/**
 * Cambia de idioma: guarda la preferencia, recuerda el punto de lectura, baja la
 * cortina y recarga. La página nueva abre con la pantalla de carga ya puesta.
 */
export function switchLang(code) {
  if (!isSupported(code) || code === lang) return;
  try {
    localStorage.setItem(STORAGE_KEY, code);
    sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)));
    sessionStorage.setItem(SWITCH_KEY, '1');
  } catch {
    /* sin almacenamiento: se recarga igualmente */
  }
  const url = new URL(location.href);
  url.searchParams.delete('lang');
  const hash = location.hash;
  document.documentElement.classList.add('is-switching');
  setTimeout(() => location.replace(url.pathname + url.search + hash), 520);
}

/** ¿Esta carga viene de un cambio de idioma? Devuelve y limpia el punto de lectura. */
export function consumeSwitch() {
  try {
    const switching = sessionStorage.getItem(SWITCH_KEY) === '1';
    const scroll = Number(sessionStorage.getItem(SCROLL_KEY) ?? 0);
    sessionStorage.removeItem(SWITCH_KEY);
    sessionStorage.removeItem(SCROLL_KEY);
    return { switching, scroll };
  } catch {
    return { switching: false, scroll: 0 };
  }
}
