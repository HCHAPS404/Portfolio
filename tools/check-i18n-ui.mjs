// Prueba el cambio de idioma en el navegador y revisa cada idioma de punta a punta:
// título, navegación, titular de contacto, sin textos sin traducir, sin errores ni desbordes.
// Uso: node tools/check-i18n-ui.mjs [url] [ancho] [alto]
import { chromium } from 'playwright-core';

const url = (process.argv[2] ?? 'http://localhost:4173/').replace(/\/?$/, '/');
const width = Number(process.argv[3] ?? 1440);
const height = Number(process.argv[4] ?? 900);
const CODES = ['en', 'de', 'fr', 'ru', 'zh', 'ja', 'it'];

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = {};

// 1) Cambio de idioma con el selector (flujo real del visitante)
{
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(3300);
  const before = await page.title();
  await page.click('.langsel__btn');
  await page.click('.langsel__opt[data-lang-code="ja"]');
  await page.waitForURL(() => true, { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(2200);
  report.switcher = {
    titleBefore: before,
    titleAfter: await page.title(),
    htmlLang: await page.evaluate(() => document.documentElement.lang),
    current: await page.$eval('.langsel__current', (e) => e.textContent),
    storedPreference: await page.evaluate(() => localStorage.getItem('portfolio-lang')),
    errors,
  };
  await page.close();
}

// 2) Cada idioma, cargado por ?lang=
for (const code of CODES) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(`${url}?lang=${code}`, { waitUntil: 'load' });
  await page.waitForTimeout(3300);
  const info = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const title = document.querySelector('.contact__title');
    const wide = [...document.querySelectorAll('main *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.right > vw + 2 && !el.closest('.marquee, .hero__canvas, .rule__scale');
      })
      .slice(0, 4)
      .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 60));
    const missing = [...document.body.innerText.matchAll(/\b[a-z0-9]+(?:\.[a-z0-9_]+){1,3}\b/g)]
      .map((m) => m[0])
      .filter((s) => /^(nav|hero|edu|xp|skills|comp|proj|contact|about|awards|hud|lang|rule|footer|ch|meta|a11y|boot)\./.test(s));
    return {
      lang: document.documentElement.lang,
      title: document.title,
      nav: [...document.querySelectorAll('.hud__nav a')].map((a) => a.textContent.replace(/^\d+/, '')).slice(0, 3),
      heroRole: document.querySelector('[data-roles]')?.textContent,
      contactTitle: title?.textContent,
      contactTitleSize: title ? Math.round(parseFloat(getComputedStyle(title).fontSize)) : null,
      contactTitleWraps: title ? title.getBoundingClientRect().height > parseFloat(getComputedStyle(title).fontSize) * 1.3 : null,
      untranslatedKeys: [...new Set(missing)],
      overflow: wide,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  report[code] = { ...info, errors };
  await page.close();
}

console.log(JSON.stringify(report, null, 2));
await browser.close();
