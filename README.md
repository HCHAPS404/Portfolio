# Helmut Chaparro Sandoval · Portafolio

Portafolio personal en una sola página, pensado para GitHub Pages: perfil, formación, experiencia, habilidades, competencias, proyectos, premios y contacto, en **ocho idiomas**, con escenas 3D propias, una pantalla de carga animada y hojas de vida en PDF adaptadas al formato de cada país.

**Sitio:** https://hchaps404.github.io/Portfolio/

---

## Qué incluye

- **Portada por idioma.** Cada idioma muestra una disciplina distinta, dibujada en 3D sobre Canvas 2D: placa electrónica (español), ADN (inglés), brazo robótico (alemán), satélites (francés), esfera de Bloch (ruso), red neuronal (chino), dron con lidar (japonés) y engranajes con pistón (italiano).
- **Pantalla de carga** en dos etapas, con diez variantes que se eligen al azar sin repetir. Aparece al abrir el sitio y al cambiar de idioma.
- **Idioma según el país.** Se deduce en el navegador (zona horaria y región), sin enviar datos a ningún servicio. Si el visitante elige un idioma, esa elección prevalece.
- **Perfil con escenarios que rotan**: qué hago en cada área, ramas de énfasis y cargos.
- **Experiencia con aporte** por cada cargo, además de logros y tecnologías.
- **Habilidades en formato de tabla periódica.** Son 63 herramientas en diez categorías; cada una se despliega con qué es y cómo la uso. Los dominios de afinidad se expanden con resumen, cifras y enfoque.
- **Competencias en 3D.** Una montaña con sensores y alerta de deslizamiento, y Cartagena amurallada con la Torre del Reloj.
- **Hojas de vida (8 PDF)** generadas desde un único contenido, con el formato propio de cada país.

## Stack

| Capa | Tecnología |
|---|---|
| Build y desarrollo | Vite 8, JavaScript en módulos ES (sin framework) |
| Animación | GSAP con ScrollTrigger y Flip, Lenis para el scroll suave |
| Visuales | Canvas 2D y un motor 3D propio de sólidos con sombreado (`src/visuals/kit3d.js`) |
| Verificación | playwright-core sobre el Edge instalado |
| Hojas de vida | HTML y CSS generados desde JavaScript, impresos a PDF con Edge |
| Despliegue | GitHub Actions → GitHub Pages |

## Estructura

```
data/                 contenido en español: perfil, experiencia, formación, habilidades, proyectos, premios
src/
  main.js             arranque: idioma, datos, pantalla de carga y secciones
  data.js             acceso único a los datos
  sections/           una función render por sección (devuelve HTML)
  core/               arranque, navegación, animación, pantalla de carga, perfil y habilidades
  i18n/               idioma, traducciones y detección por país (geo.js)
  visuals/            escenas canvas: portadas por idioma (hero/), competencias y motor 3D (kit3d.js)
  styles/             tokens de diseño, base y estilos por sección
public/assets/        foto, logos y hojas de vida en PDF (cv-<idioma>.pdf)
tools/
  i18n/               extracción, validación y auditoría de traducciones
  cv/                 generador de hojas de vida: contenido, plantillas y build
  *.mjs               pruebas y capturas de verificación
docs/i18n/            plantilla en español que se traduce a cada idioma
```

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # compila en dist/
npm run preview   # sirve dist/ en http://localhost:4173
```

Para compilar con la ruta de GitHub Pages: `BASE_PATH=/Portfolio/ npm run build`.

## Dónde editar

| Qué | Dónde |
|---|---|
| Textos y datos | `data/*.json` |
| Traducciones de la interfaz y del contenido | `src/i18n/locales/<código>.json` |
| Foto, logos y hojas de vida | `public/assets/` |
| Colores, tipografía, espaciado y tiempos | `src/styles/tokens.css` |
| Estructura de cada sección | `src/sections/` |
| Portadas por idioma | `src/visuals/hero/` (asignación en `index.js`) |
| Animación de la pantalla de carga | `src/core/loader.js` |
| Escenas de competencias | `src/visuals/terrain.js` y `src/visuals/waves.js` |
| Hojas de vida | `tools/cv/content/<código>.json` (esquema en `tools/cv/content/SCHEMA.md`) |

Para añadir un proyecto, una certificación o un premio basta con agregar una entrada al JSON correspondiente.

## Idiomas

Español, inglés, alemán, francés, ruso, chino mandarín, japonés e italiano. El selector está en la barra superior; la elección se recuerda y puede forzarse con `?lang=ja`. El ruso, el chino y el japonés van completos en su propia escritura, incluidos los nombres de empresas, software y siglas.

```bash
node tools/i18n/extract.mjs               # regenera la plantilla docs/i18n/source.es.json
node tools/i18n/check.mjs all             # valida las siete traducciones
node tools/i18n/check.mjs ru --warnings   # marca palabras en alfabeto latino
node tools/i18n/audit-dom.mjs URL         # busca textos sin traducir en la página ya pintada
```

> Las traducciones se elaboraron con apoyo de modelos de IA y están pendientes de revisión por hablantes nativos.

## Hojas de vida por país

`tools/cv/build.mjs` lee `tools/cv/content/<código>.json`, elige la plantilla según `meta.format` y genera `public/assets/docs/cv-<código>.pdf`.

| Idioma | Formato | Particularidades |
|---|---|---|
| Español, inglés | ATS | Una columna, sin tablas ni foto, para los filtros automáticos |
| Alemán | Lebenslauf | Fechas a la izquierda, foto arriba a la derecha, lugar y firma |
| Francés | CV francés | Accroche bajo el nombre, sin foto |
| Italiano | Formato europeo | Rótulos a la izquierda, niveles MCER y cláusula GDPR |
| Ruso | Резюме | Cronología inversa y datos de contacto arriba |
| Chino | 简历 | Objetivo laboral, educación antes que experiencia, foto |
| Japonés | 履歴書 + 職務経歴書 | Formulario en dos partes; los campos que el CV fuente no trae quedan en blanco |

```bash
node tools/cv/build.mjs             # todos los idiomas
node tools/cv/build.mjs de ja       # solo esos códigos
node tools/cv/build.mjs --html de   # además deja el HTML intermedio
node tools/cv/shot.mjs de           # imagen del HTML para revisar el diseño
```

Los datos que un formato pide y el CV fuente no tiene (fecha de nacimiento, género, dirección exacta) no se inventan: se omiten o quedan en blanco.

## Verificación

Con el servidor de preview activo (`npm run preview`):

```bash
node tools/check-rm.mjs          # movimiento reducido, menú móvil, acordeón y filtros
node tools/check-ui.mjs          # menú y navegación
node tools/check-features.mjs    # dominios, herramientas e idiomas
node tools/check-i18n-ui.mjs     # errores, desbordes y textos sin traducir en los siete idiomas
node tools/check-geo.mjs         # idioma por país y cambio de idioma
node tools/check-hero-fit.mjs    # el nombre de la portada cabe en todos los idiomas y tamaños
```

Para revisar a mano: `tools/shot.mjs` (por sección), `tools/shot-covers.mjs` (portadas), `tools/shot-loaders.mjs` (pantallas de carga) y `tools/shot-profile.mjs` (perfil y experiencia). Todos reportan errores de consola y desbordes horizontales.

## Despliegue

El workflow `.github/workflows/deploy.yml` compila y publica `dist/` en GitHub Pages con cada push a `main`. Para activarlo: **Settings → Pages → Source: GitHub Actions**.

## Licencia

MIT. Ver [LICENSE](LICENSE).

## Contacto

- Web: https://www.helmutchs.com
- LinkedIn: https://www.linkedin.com/in/helmut-chaparro-sandoval-370192317/
- GitHub: https://github.com/HCHAPS404
- Correo: helmut.chs@gmail.com

© 2026 Helmut Chaparro Sandoval
