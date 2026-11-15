// Auditoría de mezcla de idiomas sobre la página ya pintada.
// Para cada idioma lista los textos visibles que: (a) son idénticos a los de la
// versión en español, o (b) en ruso/chino/japonés no tienen ningún carácter propio.
// Uso: node tools/i18n/audit-dom.mjs [url]
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:4173/';
const NATIVE = { ru: /[Ѐ-ӿ]/, zh: /[一-鿿]/, ja: /[぀-ヿ一-鿿]/ };

const browser = await chromium.launch({ channel: 'msedge', headless: true });
async function texts(lang) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${url}?lang=${lang}`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'));
  await page.waitForTimeout(600);
  const out = await page.evaluate(() => {
    const set = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement.closest('script, style, noscript, [data-roles]')) continue;
      const text = node.textContent.replace(/\s+/g, ' ').trim();
      if (text.length > 1 && /\p{L}{2}/u.test(text)) set.add(text);
    }
    for (const el of document.querySelectorAll('[aria-label], [alt], [title], [placeholder]')) {
      for (const attr of ['aria-label', 'alt', 'title', 'placeholder']) {
        const v = el.getAttribute(attr);
        if (v && /\p{L}{2}/u.test(v)) set.add(`@${attr}: ${v}`);
      }
    }
    return [...set];
  });
  await page.close();
  return out;
}

const es = new Set(await texts('es'));
for (const lang of ['en', 'de', 'fr', 'it', 'ru', 'zh', 'ja']) {
  const list = await texts(lang);
  const flagged = list.filter((s) => (NATIVE[lang] ? !NATIVE[lang].test(s) : es.has(s)));
  console.log(`\n## ${lang} — ${flagged.length} de ${list.length}`);
  console.log(flagged.join(' | '));
}
await browser.close();
