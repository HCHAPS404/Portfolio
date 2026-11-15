import { profile } from '../data.js';
import { esc, sectionHead } from '../core/dom.js';

const LINK_LABELS = {
  web: 'helmutchs.com',
  github: 'GitHub',
  linkedin: 'LinkedIn',
};

export function renderAbout() {
  const tags = profile.tags.map((t) => `<li class="tag">${esc(t)}</li>`).join('');

  const languages = profile.languages
    .map(
      (l) => `
      <li class="lang" data-reveal>
        <span class="lang__name">${esc(l.name)}</span>
        <span class="lang__bar" aria-hidden="true"><i data-fill="${l.fill}"></i></span>
        <span class="lang__level">${esc(l.level)}</span>
      </li>`,
    )
    .join('');

  const links = Object.entries(LINK_LABELS)
    .map(
      ([key, label]) =>
        `<a class="about__link" href="${esc(profile.links[key])}" target="_blank" rel="noopener" data-cursor>${esc(label)} <span aria-hidden="true">↗</span></a>`,
    )
    .join('');

  return `
  <section class="section about" id="perfil" aria-labelledby="perfil-title">
    <div class="wrap">
      ${sectionHead('01', 'Perfil', 'Quién soy<br>Hardware · Software · Datos').replace('<h2 ', '<h2 id="perfil-title" ')}

      <div class="about__grid">
        <figure class="about__figure corners" data-reveal>
          <div class="about__frame">
            <canvas class="about__canvas" role="img" aria-label="Retrato de ${esc(profile.name)} dibujado con caracteres ASCII"></canvas>
            <span class="about__scanline" aria-hidden="true"></span>
          </div>
          <figcaption class="mono dim">
            <span>FIG. 01 — Retrato ASCII</span>
            <span>ID: ${esc(profile.shortName)}</span>
          </figcaption>
        </figure>

        <div class="about__body">
          <p class="about__lead" data-split>${esc(profile.about)}</p>
          <ul class="about__tags" data-reveal>${tags}</ul>

          <div class="about__langs">
            <h3 class="mono dim" data-reveal>Idiomas / ${String(profile.languages.length).padStart(2, '0')}</h3>
            <ul>${languages}</ul>
          </div>

          <div class="about__links" data-reveal>${links}</div>
        </div>
      </div>
    </div>
  </section>`;
}
