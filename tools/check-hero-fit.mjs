// Comprueba que el nombre de la portada quepa en tres líneas, sin cortes ni
// desbordes, en todos los idiomas y en varios tamaños de pantalla.
// Uso: node tools/check-hero-fit.mjs [url]
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:4173/';
const LANGS = ['es', 'en', 'de', 'fr', 'ru', 'zh', 'ja', 'it'];
const SIZES = [[390, 844], [360, 740], [768, 1024], [1440, 900]];

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const problems = [];
let checked = 0;

for (const [width, height] of SIZES) {
  for (const lang of LANGS) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(`${url}?lang=${lang}`, { waitUntil: 'load' });
    await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'));
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      const title = document.querySelector('.hero__title');
      const words = [...title.querySelectorAll('.hero__word')];
      return {
        room: title.clientWidth,
        widest: Math.max(...words.map((w) => w.offsetWidth)),
        lines: words.length,
        fontSize: getComputedStyle(title).fontSize,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    checked++;
    if (r.widest > r.room || r.overflow || r.lines !== 3) problems.push({ width, lang, ...r });
    if (width === 390 && (lang === 'ja' || lang === 'ru')) {
      await page.screenshot({ path: `renders/m-cover-${lang}.png` });
    }
    await page.close();
  }
}

console.log(JSON.stringify({ checked, problems }, null, 2));
await browser.close();
