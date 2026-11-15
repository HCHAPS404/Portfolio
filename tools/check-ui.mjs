// Capturas puntuales: menú móvil abierto y bloque de herramientas.
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://localhost:4173/';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
mobile.on('pageerror', (e) => errors.push(e.message));
await mobile.goto(url, { waitUntil: 'load' });
await mobile.waitForTimeout(3200);
await mobile.click('.hud__menu');
await mobile.waitForTimeout(1100);
await mobile.screenshot({ path: 'renders/m-menu.png' });
await mobile.click('#menu a[href="#proyectos"]');
await mobile.waitForTimeout(2600);
const menuClosed = await mobile.$eval('#menu', (el) => el.hidden);
const atProjects = await mobile.evaluate(() => Math.abs(document.getElementById('proyectos').getBoundingClientRect().top) < 80);

const desk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
desk.on('pageerror', (e) => errors.push(e.message));
await desk.goto(url, { waitUntil: 'load' });
await desk.waitForTimeout(3200);
const y = await desk.$eval('.tools', (el) => el.getBoundingClientRect().top + scrollY - 120);
for (let i = 1; i <= 30; i++) { await desk.evaluate((v) => scrollTo(0, v), (y * i) / 30); await desk.waitForTimeout(70); }
await desk.waitForTimeout(2200);
await desk.screenshot({ path: 'renders/d-tools.png' });
console.log(JSON.stringify({ errors, menuClosed, atProjects }, null, 2));
await browser.close();
