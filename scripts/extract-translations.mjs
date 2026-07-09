import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "js/main.js"), "utf8");
const start = src.indexOf("var translations = ");
const end = src.indexOf("var lang = ", start);
let block = src.slice(start + "var translations = ".length, end).trim();

block = block
  .replace(
    /"form\.error": "Something went wrong\. Write me directly at " \+ CONTACT_EMAIL \+ "\."/,
    '"form.error": "Something went wrong. Write me directly at helmut.chs@gmail.com."'
  )
  .replace(
    /"form\.error": "Algo salió mal\. Escríbeme directamente a " \+ CONTACT_EMAIL \+ "\."/,
    '"form.error": "Algo salió mal. Escríbeme directamente a helmut.chs@gmail.com."'
  );

const outDir = path.join(root, "src/i18n");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "translations.js"),
  `export const translations = ${block};\n`
);

console.log("translations.js written");
