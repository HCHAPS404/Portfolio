<!-- Banner -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:141110,100:C9835A&height=180&section=header&text=Helmut%20Chaparro%20Sandoval&fontColor=ECE7E1&fontSize=40&fontAlignY=38&desc=Electronics%20Engineer%20·%20Full-Stack%20Developer%20·%20Founder&descSize=16&descAlignY=60&descColor=C9835A" alt="Helmut Chaparro Sandoval" />
</p>

<p align="center">
  <a href="https://www.helmutchs.com"><img src="https://img.shields.io/badge/Website-helmutchs.com-C9835A?style=for-the-badge&labelColor=141110" alt="Website" /></a>
  <a href="https://www.linkedin.com/in/helmut-chaparro-sandoval-370192317/"><img src="https://img.shields.io/badge/LinkedIn-Helmut%20Chaparro-C9835A?style=for-the-badge&labelColor=141110" alt="LinkedIn" /></a>
  <a href="mailto:helmut.chs@gmail.com"><img src="https://img.shields.io/badge/Email-helmut.chs@gmail.com-C9835A?style=for-the-badge&labelColor=141110" alt="Email" /></a>
</p>

---

Este repositorio es mi **portafolio / hoja de vida interactiva**: una sola página, sin frameworks ni paso de build, pensada para verse tan cuidada como el trabajo que describe.

Soy ingeniero electrónico y desarrollador full-stack. Trabajo desde el circuito hasta la nube — sistemas embebidos, diseño de PCB, plataformas empresariales e IA sobre hardware — y fundé **DevKit Electronics S.A.S** (educación en ingeniería, ciencia y STEM) y **Poimen** (soluciones agrícolas con ingeniería).

## Qué encontrarás en la página

- Perfil, formación y certificaciones.
- Habilidades por dominios y herramientas de trabajo.
- Experiencia, incluyendo mis dos empresas.
- Premios y competencias — entre ellos el 1er puesto en la hackatón nacional UNGRD × PNUD con **NAVIRA-SATViRe**, un sistema de alerta temprana de deslizamientos.
- Proyectos navegables como carpetas, enlazados a sus repositorios.
- Doble idioma (ES/EN) que sigue el navegador, y un formulario de contacto.

## Cómo correrlo

```bash
git clone https://github.com/HCHAPS404/Portfolio.git
cd Portfolio
npx serve .        # o simplemente abre index.html
```

## Estructura

```
index.html      Contenido y estructura
css/styles.css  Sistema de diseño (paleta cobre sobre carbón)
js/main.js      i18n, animaciones, navegador de proyectos y formulario
assets/         Foto y CV
```

## Detalles de implementación

- **Idiomas.** Detecta el idioma del navegador (español → ES, resto → EN) con selector manual que se recuerda. Los textos viven en el objeto `translations` de `js/main.js`.
- **Formulario de contacto.** Sin backend abre el cliente de correo hacia `helmut.chs@gmail.com`. Para envío directo, define `FORM_ENDPOINT` en `js/main.js` con un endpoint de [Formspree](https://formspree.io).
- **Paleta y tipografía.** Definidas como variables CSS al inicio de `css/styles.css` (`--copper`, `--bg`, `--surface`…).

## Contacto

**helmut.chs@gmail.com** · [helmutchs.com](https://www.helmutchs.com) · [LinkedIn](https://www.linkedin.com/in/helmut-chaparro-sandoval-370192317/)

<sub>© 2026 Helmut Chaparro Sandoval — Bogotá D.C., Colombia. Código bajo licencia MIT.</sub>
