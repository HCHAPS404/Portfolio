# Portfolio — Helmut Chaparro Sandoval

Personal portfolio / interactive CV. Electronics engineering, embedded systems, PCB design, full-stack development and applied AI.

Built with plain HTML, CSS and JavaScript — no frameworks, no build step.

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Structure

```
├── index.html      # Content and structure
├── css/styles.css  # Design system and layout
├── js/main.js      # i18n, scroll reveals, nav state, counters
└── assets/         # Photo, CV
```

## Notes

- **Language**: the site follows the browser language (Spanish → ES, anything else → EN). A manual EN/ES switch in the header persists the choice. Translations live in the `translations` object in `js/main.js`.
- **CV download**: place the file at `assets/cv.pdf`.
- **Palette and type**: design tokens are defined as CSS custom properties at the top of `css/styles.css`.

## License

MIT — see [LICENSE](LICENSE).
