# Portafolio · Helmut Chaparro Sandoval

Portafolio personal de una sola página: perfil, formación, experiencia, habilidades, competencias, proyectos, premios y contacto. Estética "Terminal Cósmica": blanco y negro con acento rojo, arte ASCII y animación ligada al scroll.

## Stack

Vite · JavaScript (módulos ES, sin framework) · GSAP + ScrollTrigger · Lenis · Canvas 2D.

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # genera dist/
npm run preview   # sirve dist/ en http://localhost:4173
```

## Dónde editar

| Qué | Dónde |
|---|---|
| Textos y datos (perfil, experiencia, proyectos…) | `data/*.json` |
| Foto, CV y logos | `public/assets/` |
| Colores, tipografías, espaciado y tiempos | `src/styles/tokens.css` |
| Estructura de cada sección | `src/sections/` |
| Estilos de cada sección | `src/styles/` |
| Animaciones y scroll | `src/core/motion.js` |
| Navegación, arranque, cursor | `src/core/chrome.js` |
| Visuales en canvas (toro ASCII, retrato ASCII, terreno, emblemas) | `src/visuals/` |

Para agregar un proyecto, una certificación o un premio basta con añadir una entrada al JSON correspondiente; la página se actualiza sola.

## Idiomas

El sitio está disponible en español, inglés, alemán, francés, ruso, chino mandarín, japonés e italiano. El selector está en la barra superior; la elección se recuerda y también funciona con `?lang=ja`. Para añadir o corregir textos:

```bash
node tools/i18n/extract.mjs      # regenera la plantilla docs/i18n/source.es.json
node tools/i18n/check.mjs all    # valida todas las traducciones
```

## Verificación

Con el servidor de preview activo:

```bash
node tools/shot.mjs http://localhost:4173/ renders/d 1440 900   # capturas de escritorio por sección
node tools/shot.mjs http://localhost:4173/ renders/m 390 844    # capturas móviles
node tools/check-rm.mjs                                         # modo "movimiento reducido"
node tools/check-ui.mjs                                         # menú móvil y filtros
```

Los scripts usan el Edge instalado y reportan errores de consola y desbordes horizontales.

## Despliegue en GitHub Pages

El workflow `.github/workflows/deploy.yml` compila y publica `dist/` en cada push a `main`, con `BASE_PATH=/Portfolio/` (la ruta del sitio: https://hchaps404.github.io/Portfolio/).
En GitHub: **Settings → Pages → Source: GitHub Actions**. Para compilar localmente con la misma ruta: `BASE_PATH=/Portfolio/ npm run build`.

© 2026 Helmut Chaparro Sandoval
