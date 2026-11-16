// Captura de revisión de una hoja de vida: renderiza el HTML intermedio y guarda una imagen por página.
// Uso: node tools/cv/shot.mjs <código> [prefijo]
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const [code, prefix = 'renders/cv'] = process.argv.slice(2);
const html = await readFile(path.join(here, '..', '..', 'public', 'assets', 'docs', `cv-${code}.html`), 'utf8');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const h = await page.evaluate(() => document.documentElement.scrollHeight);
await page.setViewportSize({ width: 794, height: Math.min(h, 16000) });
await page.screenshot({ path: `${prefix}-${code}.png`, fullPage: true });
console.log(`${prefix}-${code}.png altura ${h}px (≈${Math.ceil(h / 1123)} hojas A4)`);
await browser.close();
