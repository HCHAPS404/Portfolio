// Comprueba el idioma inicial según el país (zona horaria simulada), el cambio de
// idioma con su pantalla de carga y que cada idioma monte su propia portada.
// Uso: node tools/check-geo.mjs [url]
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:4173/';
const CASES = [
  ['America/Bogota', 'en-US', 'es'],
  ['Europe/Berlin', 'en-US', 'de'],
  ['Europe/Paris', 'en-US', 'fr'],
  ['Asia/Novosibirsk', 'en-US', 'ru'],
  ['Asia/Shanghai', 'en-US', 'zh'],
  ['Asia/Tokyo', 'en-US', 'ja'],
  ['Europe/Rome', 'en-US', 'it'],
  ['America/Chicago', 'es-MX', 'en'],
  ['America/Sao_Paulo', 'it-IT', 'it'], // país sin idioma propio en el sitio: región del navegador
  ['America/Sao_Paulo', 'pt-BR', 'en'], // sin pistas: inglés
];

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { geo: [], errors: [] };

for (const [timezoneId, locale, expected] of CASES) {
  const context = await browser.newContext({ timezoneId, locale });
  const page = await context.newPage();
  page.on('pageerror', (e) => report.errors.push(`${timezoneId}: ${e.message}`));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForSelector('.hero__canvas[data-scene]');
  const got = await page.evaluate(() => document.documentElement.lang);
  const scene = await page.getAttribute('.hero__canvas', 'data-scene');
  report.geo.push({ timezoneId, locale, expected, got, scene, ok: got === expected && scene === expected });
  await context.close();
}

// Cambio de idioma: cortina, recarga, pantalla de carga con el texto «cambiando idioma»
const context = await browser.newContext({ timezoneId: 'America/Bogota', locale: 'es-CO', viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.on('pageerror', (e) => report.errors.push(`switch: ${e.message}`));
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'));
await page.waitForTimeout(1200);
await page.click('.langsel__btn');
await page.click('[data-lang-code="ja"]');
await page.waitForSelector('html[lang="ja"] .boot', { timeout: 8000 });
await page.waitForTimeout(700);
const bootText = await page.textContent('.boot__log');
await page.screenshot({ path: 'renders/switch-loader.png' });
await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'));
await page.waitForTimeout(1500);
report.switch = {
  lang: await page.evaluate(() => document.documentElement.lang),
  bootText,
  bootRemoved: (await page.$('.boot')) === null,
  stored: await page.evaluate(() => localStorage.getItem('portfolio-lang')),
};
// La elección manual manda sobre el país en la siguiente visita
await page.goto(url, { waitUntil: 'load' });
await page.waitForSelector('.hero__canvas[data-scene]');
report.switch.nextVisit = await page.evaluate(() => document.documentElement.lang);
await context.close();

console.log(JSON.stringify(report, null, 2));
await browser.close();
