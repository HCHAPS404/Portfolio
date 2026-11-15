// Captura la vista centrada en uno o varios selectores CSS.
// Uso: node tools/shot-at.mjs <ancho> <alto> <prefijo> <selector> [selector…]
import { chromium } from 'playwright-core';

const [width, height, prefix, ...selectors] = process.argv.slice(2);
const url = process.env.SHOT_URL ?? 'http://localhost:4173/';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(3400);

const shots = [];
for (const [i, selector] of selectors.entries()) {
  const target = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.top + window.scrollY - Math.max(70, (window.innerHeight - r.height) / 2);
  }, selector);
  if (target === null) {
    errors.push(`selector sin coincidencias: ${selector}`);
    continue;
  }
  const from = await page.evaluate(() => window.scrollY);
  const steps = Math.max(1, Math.ceil(Math.abs(target - from) / 320));
  for (let s = 1; s <= steps; s++) {
    await page.evaluate((y) => window.scrollTo(0, y), from + ((target - from) * s) / steps);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(2600);
  const out = `${prefix}-${i + 1}.png`;
  await page.screenshot({ path: out });
  shots.push(out);
}

console.log(JSON.stringify({ shots, errors }, null, 2));
await browser.close();
