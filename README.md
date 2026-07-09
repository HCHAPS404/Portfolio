# Portfolio — Helmut Chaparro Sandoval

Sitio en vivo: **[hchaps404.github.io/Portfolio](https://hchaps404.github.io/Portfolio/)**

Portafolio personal en una sola página. Está hecho con **React 19 y Vite** — el código fuente vive en `src/`, se compila a `dist/` y eso es lo que publica GitHub Pages.

Soy ingeniero electrónico y desarrollador full-stack en Bogotá. Cofundador de [DevKit Electronics](https://devkitelectronics.com) y Poimen Labs. Este repo es la versión que mantengo yo; la estética es carbón + cobre, bilingüe ES/EN, y las secciones van de perfil y experiencia hasta proyectos con carpetas arrastrables.

## Stack

| Capa | Tecnología |
|------|------------|
| UI | React 19 (JSX) |
| Build | Vite 6 |
| Estilos | CSS en `src/index.css` |
| i18n | Context API + `src/i18n/translations.js` |
| Deploy | GitHub Actions → Pages |

GitHub no muestra “React” en la barra de lenguajes: cuenta el JSX como **JavaScript**. Si ves mucho CSS, es normal — casi todo el diseño está en un solo archivo de estilos.

## Desarrollo local

```bash
git clone https://github.com/HCHAPS404/Portfolio.git
cd Portfolio
npm install
npm run dev
```

Abre `http://localhost:5173`.

Build:

```bash
npm run build
npm run preview
```

## Deploy (GitHub Pages)

El workflow `.github/workflows/deploy.yml` hace `npm run build` en cada push a `main` y sube `dist/`.

En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

> Si la página sale en blanco, casi siempre es porque Pages está publicando la rama `main` (código fuente) en vez del artefacto del workflow. El `index.html` del repo apunta a `/src/main.jsx`, que solo funciona con `npm run dev`, no en hosting estático.

`vite.config.js` usa `base: "/Portfolio/"` porque la URL del proyecto es una subruta. Si despliegas en la raíz de un dominio propio:

```powershell
$env:BASE_PATH="/"; npm run build
```

## Dónde editar qué

- **Textos ES/EN** → `src/i18n/translations.js`
- **Experiencia, becas, proyectos** → `src/data/`
- **Componentes de cada sección** → `src/components/`
- **Foto, logos, CV** → `public/assets/`
- **Formulario (Formspree)** → `FORM_ENDPOINT` en `src/data/config.js`

## Estructura

```
index.html          Entrada Vite
src/
  App.jsx           Secciones principales
  main.jsx          Mount de React
  index.css         Estilos
  components/       UI por sección
  data/             Contenido estático
  hooks/            Scroll, animaciones, carpetas
  context/          Idioma
  i18n/             Traducciones
public/assets/      Imágenes y CV
.github/workflows/  Deploy automático
```

## Contacto

- Web: [helmutchs.com](https://www.helmutchs.com)
- Email: [helmut.chs@gmail.com](mailto:helmut.chs@gmail.com)
- LinkedIn: [helmut-chaparro-sandoval](https://www.linkedin.com/in/helmut-chaparro-sandoval-370192317/)
- GitHub: [@HCHAPS404](https://github.com/HCHAPS404)
- Instagram: [@divisum.hell](https://instagram.com/divisum.hell)
- TikTok: [@imhell.12](https://www.tiktok.com/@imhell.12)

MIT License · © 2026 Helmut Chaparro Sandoval
