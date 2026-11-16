# Esquema del contenido de las hojas de vida

Un archivo por idioma: `tools/cv/content/<código>.json`. `node tools/cv/build.mjs [códigos]` genera
`public/assets/docs/cv-<código>.pdf` con la plantilla que indica `meta.format`.

## Campos comunes (obligatorios)
- `meta`: `lang`, `format` (ats | lebenslauf | cv-fr | europass | rezyume | jianli | rirekisho), `locale`, `paper`, `title`.
- `person`: `name`, `headline`, `location`, `phone`, `email`, `links[]` ({id,label,url,display}), `availability`.
- `profile` (texto), `capabilities[]` ({area, items[]}), `experience[]`, `projects[]`, `education` (`degree`, `certifications[]`, `continuing`), `languages[]` ({code,name,level,cefr,native,note}), `availability`, `labels` (rótulos de sección de la plantilla).
- `experience[]`: `id`, `role`, `org`, `place`, `period`, `start`, `end` (`present` si está vigente), `mode`, `bullets[]`, `tech[]`.
- `projects[]`: `id`, `title`, `context`, `period`, `award`, `bullets[]`, `tech[]`.

## Extras por formato
- `jianli` (zh): `objective` = lista de { label, value }; `labels.objective`.
- `rezyume` (ru): `labels.desiredPosition`.
- `europass` (it): `labels.privacy` (cláusula D.Lgs. 196/2003 y GDPR); idiomas con `cefr`.
- `lebenslauf` (de): sin fecha de nacimiento ni datos que el CV fuente no tenga.
- `rirekisho` (ja): `person.nameKana`; `rirekisho.{education,work}` = lista de { year, month, text } (mes vacío si no se conoce); `rirekisho.motivation`, `rirekisho.requests`; `shokumu.summary`, `shokumu.selfPR`.

## Reglas
- No inventar datos. Lo que el formato pide y el CV fuente no trae (fecha de nacimiento, género, dirección exacta) se omite o queda vacío.
- Tecnologías, empresas y productos en alfabeto latino en todos los idiomas (convención profesional y lectura de filtros automáticos).
- Límites de páginas por plantilla: ver `pages` en `templates/<formato>.mjs`; el build avisa si se sale.
- Revisión visual: `node tools/cv/build.mjs --html <código>` y después `node tools/cv/shot.mjs <código>`.
