// Capturas de revisión: portada en chino, un dominio expandido y el tablero de herramientas.
// Uso: node tools/shot-detail.mjs [url]
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:4173/';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];

async function open(lang, width = 1440, height = 900) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', (e) => errors.push(`${lang}: ${e.message}`));
  await page.goto(`${url}?lang=${lang}`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'));
  return page;
}
async function reach(page, selector) {
  const y = await page.evaluate((sel) => document.querySelector(sel).getBoundingClientRect().top + scrollY - 90, selector);
  for (let s = 1; s <= 14; s++) {
    await page.evaluate((v) => scrollTo(0, v), (y * s) / 14);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1500);
}

let page = await open('zh');
await page.waitForTimeout(5000);
await page.screenshot({ path: 'renders/d-zh-hero.png' });
await page.close();

for (const [lang, w, h] of [['es', 1440, 1000], ['ja', 1440, 1000], ['es', 390, 844]]) {
  page = await open(lang, w, h);
  await reach(page, '[data-domains]');
  await page.click('.domain[data-domain="B"] .domain__open');
  await page.waitForTimeout(1800);
  await reach(page, '.domain.is-open');
  await page.screenshot({ path: `renders/d-${lang}-${w}-domain.png` });
  if (w > 500) {
    await reach(page, '.tools');
    await page.screenshot({ path: `renders/d-${lang}-tools.png` });
  }
  await page.close();
}
console.log(JSON.stringify({ errors }));
await browser.close();
