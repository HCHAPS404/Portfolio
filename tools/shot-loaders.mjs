// Captura las diez pantallas de carga en su etapa 1 (≈85 %) y en la etapa 2.
// Uso: node tools/shot-loaders.mjs [url] [ancho] [alto]
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:4173/';
const width = Number(process.argv[3] ?? 1440);
const height = Number(process.argv[4] ?? 900);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];

for (let n = 1; n <= 10; n++) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', (e) => errors.push(`loader ${n}: ${e.message}`));
  await page.goto(`${url}?lang=es&loader=${n}`, { waitUntil: 'commit' });
  await page.waitForSelector('.boot');
  await page.waitForFunction(() => Number(document.querySelector('[data-boot-count]')?.textContent) >= 85, null, { timeout: 9000 }).catch(() => {});
  await page.screenshot({ path: `renders/loader-${n}a.png` });
  await page.waitForFunction(() => document.querySelector('[data-boot-count]')?.textContent === '100', null, { timeout: 9000 }).catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: `renders/loader-${n}b.png` });
  await page.close();
}
console.log(JSON.stringify({ errors }));
await browser.close();
