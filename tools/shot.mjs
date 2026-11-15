// Capturas de verificación con Playwright usando el Edge instalado (sin descargar navegador).
//
// Uso:
//   node tools/shot.mjs [url] [prefijo] [ancho] [alto] [modo]
//   modo: "sections" (una captura por sección, por defecto) | "top" (solo la primera vista)
//
// Recorre la página para disparar las animaciones de scroll, captura cada sección
// y reporta errores de consola y desbordes horizontales.
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:4173/';
const prefix = process.argv[3] ?? 'renders/desktop';
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
const mode = process.argv[6] ?? 'sections';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});
page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()}`));

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(3600); // arranque + entrada del hero

const shots = [];
if (mode === 'top') {
  const out = `${prefix}-top.png`;
  await page.screenshot({ path: out });
  shots.push(out);
} else {
  const ids = await page.$$eval('main > section[id]', (els) => els.map((e) => e.id));
  for (const id of ids) {
    // Desplazamiento por pasos para que ScrollTrigger dispare cada revelado
    const top = await page.$eval(`#${id}`, (el) => el.getBoundingClientRect().top + window.scrollY);
    const from = await page.evaluate(() => window.scrollY);
    const steps = Math.max(1, Math.ceil(Math.abs(top - from) / 320));
    for (let i = 1; i <= steps; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), from + ((top - from) * i) / steps);
      await page.waitForTimeout(90);
    }
    await page.waitForTimeout(2600);
    const out = `${prefix}-${id}.png`;
    await page.screenshot({ path: out });
    shots.push(out);
  }
}

const overflow = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const wide = [...document.querySelectorAll('main *')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.right > vw + 2 && !el.closest('.marquee, .hero__canvas');
    })
    .slice(0, 6)
    .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 70));
  return { scrollWidth: document.documentElement.scrollWidth, clientWidth: vw, wide };
});

console.log(JSON.stringify({ shots, errors, overflow }, null, 2));
await browser.close();
