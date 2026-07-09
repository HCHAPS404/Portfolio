# Portfolio · Helmut Chaparro Sandoval

Sitio en vivo: **[hchaps404.github.io/Portfolio](https://hchaps404.github.io/Portfolio/)**

Mi portafolio personal. Una sola página, bilingüe (ES/EN), hecha con React y Vite. El código está en `src/`, el build en `dist/`.

Soy ingeniero electrónico y desarrollador full-stack en Bogotá. Fundé [DevKit Electronics](https://devkitelectronics.com) (soy uno de los dos fundadores oficiales) y soy cofundador de Poimen Labs. Este repo es la versión que mantengo yo.

## Stack

React 19, Vite 6, CSS en `src/index.css`, i18n con Context API. Se publica con GitHub Actions en Pages.

## Desarrollo local

```bash
git clone https://github.com/HCHAPS404/Portfolio.git
cd Portfolio
npm install
npm run dev
```

Abre `http://localhost:5173`.

```bash
npm run build
npm run preview
```

## Deploy

El workflow en `.github/workflows/deploy.yml` compila y sube `dist/` en cada push a `main`.

En GitHub: **Settings → Pages → Source: GitHub Actions**.

Si la página sale en blanco, revisa que Pages no esté publicando la rama `main` directamente. El `index.html` del repo apunta a `/src/main.jsx`, que solo corre en desarrollo.

Para dominio propio en la raíz:

```powershell
$env:BASE_PATH="/"; npm run build
```

## Dónde editar

- Textos ES/EN → `src/i18n/translations.js`
- Experiencia, becas, proyectos → `src/data/`
- Componentes → `src/components/`
- Imágenes y CV → `public/assets/`
- Formulario → `FORM_ENDPOINT` en `src/data/config.js`

## Contacto

- [helmutchs.com](https://www.helmutchs.com)
- [helmut.chs@gmail.com](mailto:helmut.chs@gmail.com)
- [LinkedIn](https://www.linkedin.com/in/helmut-chaparro-sandoval-370192317/)
- [@HCHAPS404](https://github.com/HCHAPS404)
- [@divisum.hell](https://instagram.com/divisum.hell)
- [@imhell.12](https://www.tiktok.com/@imhell.12)

MIT · © 2026 Helmut Chaparro Sandoval
