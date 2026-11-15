// Prueba de las funciones interactivas: bloques de dominio, herramientas y selector de idioma.
// Uso: node tools/check-features.mjs [url] [ancho] [alto]
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:4173/';
const width = Number(process.argv[3] ?? 1440);
const height = Number(process.argv[4] ?? 900);

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width, height } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(3400);

const result = {};
const goTo = async (selector, offset = 90) => {
  const y = await page.$eval(selector, (el, off) => el.getBoundingClientRect().top + scrollY - off, offset);
  const from = await page.evaluate(() => scrollY);
  const steps = Math.max(1, Math.ceil(Math.abs(y - from) / 320));
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((v) => scrollTo(0, v), from + ((y - from) * i) / steps);
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(1800);
};

// --- Dominios
await goTo('.domains');
await page.screenshot({ path: 'renders/f-domains-closed.png' });
await page.click('.domain[data-domain="B"] .domain__open');
await page.waitForTimeout(1900);
result.domainOpens = await page.$eval('.domain[data-domain="B"]', (el) => el.classList.contains('is-open') && !el.querySelector('.domain__detail').hidden);
result.domainSpansRow = await page.$eval('.domain[data-domain="B"]', (el) => el.getBoundingClientRect().width > innerWidth * 0.8);
result.blocksInDetail = await page.$$eval('.domain.is-open .dd__block', (els) => els.length);
await page.screenshot({ path: 'renders/f-domain-open.png' });
await page.click('.domain.is-open .domain__close');
await page.waitForTimeout(1500);
result.domainCloses = await page.$eval('.domain[data-domain="B"]', (el) => !el.classList.contains('is-open'));
result.focusBack = await page.evaluate(() => document.activeElement?.className?.includes('domain__open'));
// Abrir otro y cerrar con Escape
await page.click('.domain[data-domain="F"] .domain__open');
await page.waitForTimeout(1400);
await page.keyboard.press('Escape');
await page.waitForTimeout(1300);
result.escapeCloses = await page.$$eval('.domain.is-open', (els) => els.length === 0);

// --- Herramientas
await goTo('.tools', 100);
await page.hover('.tool[data-name="altium designer"] .tool__btn');
await page.waitForTimeout(500);
await page.screenshot({ path: 'renders/f-tools-hover.png' });
await page.click('.tools__cat[data-filter="embedded"]');
await page.waitForTimeout(900);
result.toolsShownEmbedded = await page.$eval('[data-tools-count]', (el) => el.textContent);
await page.fill('[data-tools-search]', 'st');
await page.waitForTimeout(500);
result.toolsShownSearch = await page.$eval('[data-tools-count]', (el) => el.textContent);
await page.screenshot({ path: 'renders/f-tools-filter.png' });
await page.fill('[data-tools-search]', 'zzzz');
await page.waitForTimeout(300);
result.emptyMessage = await page.$eval('[data-tools-empty]', (el) => !el.hidden);

// --- Idioma
await page.evaluate(() => scrollTo(0, 0));
await page.waitForTimeout(800);
await page.click('.langsel__btn');
await page.waitForTimeout(500);
result.languageOptions = await page.$$eval('.langsel__opt', (els) => els.map((e) => e.dataset.langCode));
await page.screenshot({ path: 'renders/f-lang.png', clip: { x: 0, y: 0, width, height: 420 } });

console.log(JSON.stringify({ errors, ...result }, null, 2));
await browser.close();
