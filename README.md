# Portfolio · Hoja de Vida Interactiva

Portafolio personal estilo hoja de vida con diseño **glassmorphism**, construido con HTML, CSS y JavaScript puros (sin dependencias ni build).

## Estructura de las 6 etapas

1. **Inicio (Hero)** — Presentación con foto, rol animado (efecto máquina de escribir), botones de acción y redes sociales.
2. **Perfil Profesional** — Sobre mí, datos personales y estadísticas animadas.
3. **Formación & Idiomas** — Estudios (línea de tiempo), capacitación complementaria e idiomas con barras de nivel.
4. **Habilidades & Herramientas** — Conocimientos técnicos con barras de progreso, herramientas de uso y habilidades blandas.
5. **Experiencia Laboral** — Línea de tiempo vertical con cargos, empresas y logros.
6. **Proyectos & Contacto** — Tarjetas de proyectos destacados, llamado a la acción de contacto y pie de página.

## Cómo verlo

Abre `index.html` directamente en el navegador, o sirve la carpeta con cualquier servidor estático:

```bash
npx serve .
```

## Personalización

- **Foto**: reemplaza `assets/avatar.svg` por tu foto (por ejemplo `assets/avatar.jpg`) y actualiza el `src` de la imagen en `index.html`.
- **CV**: coloca tu hoja de vida en `assets/cv.pdf` para que funcione el botón "Descargar CV".
- **Textos y datos**: todo el contenido (nombre, redes, estudios, experiencia, proyectos) está en `index.html` con datos de ejemplo listos para editar.
- **Colores**: la paleta se controla con variables CSS al inicio de `css/styles.css` (`--accent`, `--accent-2`, `--bg`, etc.).

## Estructura del proyecto

```
├── index.html        # Estructura y contenido de las 6 etapas
├── css/styles.css    # Estilos glassmorphism, animaciones y responsive
├── js/main.js        # Scroll reveal, dot-nav, contadores y typing effect
└── assets/           # Imágenes y archivos descargables
```

## Licencia

MIT — ver [LICENSE](LICENSE).
