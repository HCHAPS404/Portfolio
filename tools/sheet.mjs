// Hoja de contactos: junta varias capturas en una sola imagen.
// Uso: node tools/sheet.mjs <salida.png> <columnas> <imagen…>
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
const [out, cols, ...files] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.setContent(`<body style="margin:0;background:#333;display:grid;gap:4px;grid-template-columns:repeat(${cols},1fr)">${files.map((f) => `<img style="width:100%;display:block" src="data:image/png;base64,${readFileSync(f).toString('base64')}">`).join('')}</body>`);
await page.waitForLoadState('networkidle');
await page.screenshot({ path: out, fullPage: true });
await browser.close();
