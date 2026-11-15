// Verifica el modo "movimiento reducido": sin errores y con el contenido visible.
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(process.argv[2] ?? 'http://localhost:4173/', { waitUntil: 'load' });
await page.waitForTimeout(1500);
const hidden = await page.evaluate(() =>
  [...document.querySelectorAll('main [data-reveal], main [data-head] > *, main [data-hero-fade]')]
    .filter((el) => Number(getComputedStyle(el).opacity) < 0.99).length);
const boot = await page.$('.boot');
await page.evaluate(() => document.getElementById('experiencia').scrollIntoView());
await page.waitForTimeout(600);
await page.screenshot({ path: 'renders/rm-experiencia.png' });
// Interacciones: acordeón, filtro y menú móvil
await page.click('.xp:nth-child(2) .xp__toggle');
const opened = await page.$eval('.xp:nth-child(2)', (el) => el.classList.contains('is-open'));
await page.click('.tools__tab:nth-child(3)');
const count = await page.$eval('[data-tools-count]', (el) => el.textContent);
console.log(JSON.stringify({ errors, hiddenElements: hidden, bootRemoved: !boot, accordionOpens: opened, toolsCountAfterFilter: count }, null, 2));
await browser.close();
