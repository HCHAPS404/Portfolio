// Captura una vista concreta: la parte alta de la página o un selector centrado.
// Uso: node tools/shot-one.mjs <url> <salida.png> [espera_ms] [ancho] [alto] [selector]
import { chromium } from 'playwright-core';

const [url, out, wait = '7000', width = '1440', height = '900', selector] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), null, { timeout: 15000 }).catch(() => {});
if (selector) {
  const target = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.top + window.scrollY - Math.max(70, (window.innerHeight - r.height) / 2);
  }, selector);
  if (target === null) errors.push(`sin coincidencias: ${selector}`);
  else {
    for (let s = 1; s <= 12; s++) {
      await page.evaluate((y) => window.scrollTo(0, y), (target * s) / 12);
      await page.waitForTimeout(90);
    }
  }
}
await page.waitForTimeout(Number(wait));
if (selector && !selector.startsWith('#')) {
  const el = await page.$(selector);
  await (el ? el.screenshot({ path: out }) : page.screenshot({ path: out }));
} else await page.screenshot({ path: out });
console.log(JSON.stringify({ out, errors }));
await browser.close();
