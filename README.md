<!-- Banner -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:141110,100:C9835A&height=180&section=header&text=Helmut%20Chaparro%20Sandoval&fontColor=ECE7E1&fontSize=40&fontAlignY=38&desc=Electronics%20Engineer%20%C2%B7%20Full-Stack%20Developer%20%C2%B7%20Entrepreneur&descSize=16&descAlignY=60&descColor=C9835A" alt="Helmut Chaparro Sandoval" />
</p>

<p align="center">
  <a href="https://www.helmutchs.com"><img src="https://img.shields.io/badge/Website-helmutchs.com-C9835A?style=for-the-badge&labelColor=141110" alt="Website" /></a>
  <a href="https://www.linkedin.com/in/helmut-chaparro-sandoval-370192317/"><img src="https://img.shields.io/badge/LinkedIn-Helmut%20Chaparro-C9835A?style=for-the-badge&labelColor=141110" alt="LinkedIn" /></a>
  <a href="mailto:helmut.chs@gmail.com"><img src="https://img.shields.io/badge/Email-helmut.chs@gmail.com-C9835A?style=for-the-badge&labelColor=141110" alt="Email" /></a>
  <a href="https://github.com/HCHAPS404"><img src="https://img.shields.io/badge/GitHub-HCHAPS404-C9835A?style=for-the-badge&labelColor=141110" alt="GitHub" /></a>
</p>

---

Hola. Este repo es mi portafolio en una sola página, ahora construido con **React + Vite**. Misma estética y comportamiento que la versión estática anterior, con componentes modulares y un paso de build para producción.

Soy ingeniero electrónico y desarrollador full-stack en Bogotá. Llevo unos seis años entre circuitos, firmware, software y datos. Soy **cofundador y gerente general** de **DevKit Electronics S.A.S** (educación en ingeniería, ciencia y STEM — hardware y software) y **Poimen Labs** (AgriTech y automatización agrícola en Colombia). También participo en IEEE y en proyectos de robótica, IA y hardware aplicado.

## Qué hay en la página

- Perfil con datos de contacto, idiomas y métricas.
- Formación académica y certificaciones.
- Campos de afinidad técnica (embebidos, PCB, datos, IA, robótica, bioingeniería, etc.).
- Herramientas que uso a diario y habilidades blandas.
- Experiencia laboral, incluidas DevKit Electronics y Poimen Labs como empresas cofundadas.
- Becas, premios y competencias — hackatón UNGRD × PNUD (1er puesto con **NAVIRA-SATViRe**), becas Altium (Global Scholarship y Grad to Career) y liderazgo IEEE.
- Proyectos en formato carpeta, cada uno enlazado a su repositorio.
- Animaciones de scroll, timeline en experiencia y fondo ambiental tipo PCB.
- Idioma ES/EN según el navegador, con selector manual.
- Formulario de contacto hacia `helmut.chs@gmail.com`.

## Correr en local

```bash
git clone https://github.com/HCHAPS404/Portfolio.git
cd Portfolio
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

### Build de producción

```bash
npm run build
npm run preview
```

El resultado queda en `dist/`. Esa carpeta es la que se publica — no subas el código fuente tal cual a Pages.

## Publicar en GitHub Pages

URL del sitio: **https://hchaps404.github.io/Portfolio/**

Este proyecto es React + Vite, así que GitHub Pages necesita el **build** (`dist/`), no los archivos de `src/`. Si publicas la raíz del repo, la página queda en blanco porque el navegador no puede ejecutar `.jsx` directamente.

### Opción recomendada (GitHub Actions)

1. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Haz push a `main`. El workflow `.github/workflows/deploy.yml` corre `npm run build` y sube `dist/`.
3. Revisa la pestaña **Actions** hasta que el deploy termine en verde.

`vite.config.js` ya tiene `base: "/Portfolio/"` para que JS, CSS e imágenes carguen en la subruta correcta.

### Si lo haces a mano

```bash
npm install
npm run build
```

Luego publica **solo el contenido de `dist/`** (rama `gh-pages` o el método que uses). No copies `index.html` de la raíz del proyecto.

### Dominio propio (helmutchs.com, Vercel, etc.)

```bash
# PowerShell
$env:BASE_PATH="/"; npm run build
```

En Linux/macOS: `BASE_PATH=/ npm run build`


```
index.html              Entrada Vite
src/
  App.jsx               Composición de secciones
  main.jsx              Punto de entrada React
  index.css             Estilos (paleta cobre sobre carbón)
  i18n/translations.js  Textos ES/EN
  data/                 Contenido estático (experiencia, proyectos, etc.)
  components/           Secciones y UI
  hooks/                Animaciones, nav activa, drag de carpetas
  context/              Idioma global
public/assets/          Foto, logos y CV
```

Los archivos `css/styles.css` y `js/main.js` en la raíz conservan la versión estática anterior como referencia.

## Notas técnicas

- Los textos bilingües están en `src/i18n/translations.js` (experiencia, becas, i18n completo).
- El contenido estructurado (experiencia, premios, proyectos) vive en `src/data/`.
- El formulario usa `mailto` por defecto. Para envío directo, configura `FORM_ENDPOINT` en `src/data/config.js` (por ejemplo con Formspree).
- Colores y tipografías en variables CSS al inicio de `src/index.css`.

## Redes

<p align="center">
  <a href="https://x.com/HCHAPS404"><img src="https://img.shields.io/badge/X-@HCHAPS404-C9835A?style=for-the-badge&labelColor=141110" alt="X" /></a>
  <a href="https://instagram.com/hchaps404"><img src="https://img.shields.io/badge/Instagram-@hchaps404-C9835A?style=for-the-badge&labelColor=141110" alt="Instagram" /></a>
  <a href="https://facebook.com/hchaps404"><img src="https://img.shields.io/badge/Facebook-hchaps404-C9835A?style=for-the-badge&labelColor=141110" alt="Facebook" /></a>
  <a href="https://youtube.com/@HCHAPS404"><img src="https://img.shields.io/badge/YouTube-@HCHAPS404-C9835A?style=for-the-badge&labelColor=141110" alt="YouTube" /></a>
</p>

<p align="center">
  <a href="https://www.helmutchs.com">helmutchs.com</a> ·
  <a href="mailto:helmut.chs@gmail.com">helmut.chs@gmail.com</a> ·
  Bogotá D.C., Colombia
</p>

<sub>© 2026 Helmut Chaparro Sandoval · MIT License</sub>
