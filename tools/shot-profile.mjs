// Capturas de revisión del perfil, la experiencia y una ficha de herramienta desplegada.
// Uso: node tools/shot-profile.mjs [url] [idioma] [ancho] [alto]
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:4173/';
const lang = process.argv[3] ?? 'es';
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 1000);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width, height } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`${url}?lang=${lang}`, { waitUntil: 'load' });
await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'));

async function reach(selector, offset = 80) {
  const y = await page.evaluate(([sel, off]) => document.querySelector(sel).getBoundingClientRect().top + scrollY - off, [selector, offset]);
  const from = await page.evaluate(() => scrollY);
  for (let s = 1; s <= 14; s++) {
    await page.evaluate((v) => scrollTo(0, v), from + ((y - from) * s) / 14);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1600);
}
const tag = `${lang}-${width}`;
await reach('#perfil');
await page.screenshot({ path: `renders/p-${tag}-1.png` });
await reach('.about__lower', 110);
await page.screenshot({ path: `renders/p-${tag}-2.png` });
await reach('#experiencia');
await page.screenshot({ path: `renders/p-${tag}-3.png` });
await reach('.tools', 70);
await page.click('.tool:nth-child(2) .tool__btn');
await page.waitForTimeout(900);
await page.screenshot({ path: `renders/p-${tag}-4.png` });
await reach('#premios');
await page.screenshot({ path: `renders/p-${tag}-5.png` });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
console.log(JSON.stringify({ errors, overflow }));
await browser.close();
