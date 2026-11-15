// Captura la portada de cada idioma y las diez pantallas de carga.
// Uso: node tools/shot-covers.mjs [url] [ancho] [alto] [prefijo]
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:4173/';
const width = Number(process.argv[3] ?? 1440);
const height = Number(process.argv[4] ?? 900);
const prefix = process.argv[5] ?? 'renders/cover';
const LANGS = ['es', 'en', 'de', 'fr', 'ru', 'zh', 'ja', 'it'];

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { errors: [], covers: [], loaders: [] };

for (const lang of LANGS) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', (e) => report.errors.push(`${lang}: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && report.errors.push(`${lang}: ${m.text()}`));
  await page.goto(`${url}?lang=${lang}`, { waitUntil: 'load' });
  await page.waitForTimeout(9000);
  const out = `${prefix}-${lang}.png`;
  await page.screenshot({ path: out });
  report.covers.push({ lang, scene: await page.getAttribute('.hero__canvas', 'data-scene'), out });
  await page.close();
}

for (let n = 1; n <= 10; n++) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', (e) => report.errors.push(`loader ${n}: ${e.message}`));
  await page.goto(`${url}?lang=es&loader=${n}`, { waitUntil: 'commit' });
  await page.waitForSelector('.boot');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${prefix}-loader-${n}a.png` });
  await page.waitForFunction(() => document.querySelector('[data-boot-count]')?.textContent === '100', null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(330);
  await page.screenshot({ path: `${prefix}-loader-${n}b.png` });
  report.loaders.push({ n, variant: await page.getAttribute('.boot', 'data-variant').catch(() => null) });
  await page.close();
}

console.log(JSON.stringify(report, null, 2));
await browser.close();
