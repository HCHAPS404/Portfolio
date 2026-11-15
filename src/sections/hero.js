import { profile, asset } from '../data.js';
import { esc } from '../core/dom.js';

export function renderHero() {
  const nameLines = profile.name.split(' ');
  const stats = profile.stats
    .map((s) => {
      const value = s.text
        ? `<dd class="stat__value stat__value--text">${esc(s.text)}</dd>`
        : `<dd class="stat__value"><span data-count="${s.value}">${s.value}</span>${esc(s.suffix ?? '')}</dd>`;
      return `<div class="stat${s.accent ? ' stat--accent' : ''}" data-hero-fade><dt class="stat__label">${esc(s.label)}</dt>${value}</div>`;
    })
    .join('');

  return `
  <section class="hero" id="inicio" aria-labelledby="hero-title">
    <canvas class="hero__canvas" role="img" aria-label="Placa electrónica de tres capas en vista explosionada, con pistas, vías y componentes, por la que viajan pulsos de señal"></canvas>
    <div class="hero__veil" aria-hidden="true"></div>

    <div class="wrap hero__inner">
      <p class="hero__top mono">
        <span class="hero__status"><i class="pulse" aria-hidden="true"></i>${esc(profile.availability)}</span>
        <span class="dim">${esc(profile.location)}</span>
      </p>

      <h1 class="hero__title" id="hero-title" aria-label="${esc(profile.name)}">
        ${nameLines
          .map(
            (line, i) =>
              `<span class="hero__line" aria-hidden="true"><span class="hero__word" data-hero-word style="--i:${i}">${esc(line)}</span></span>`,
          )
          .join('')}
      </h1>

      <div class="hero__bottom">
        <div class="hero__intro">
          <p class="hero__role" aria-label="${esc(profile.roles.slice(0, 3).join(', '))}">
            <span class="red" aria-hidden="true">&gt;</span>
            <span data-roles aria-hidden="true">${esc(profile.roles[0])}</span><span class="caret" aria-hidden="true">_</span>
          </p>
          <p class="hero__summary" data-hero-fade>${esc(profile.summary)}</p>
          <div class="hero__cta" data-hero-fade>
            <a class="btn btn--accent" href="#proyectos" data-cursor data-magnetic>Ver proyectos <span class="btn__arrow" aria-hidden="true">↗</span></a>
            <a class="btn" href="${asset(profile.cv)}" download data-cursor data-magnetic>Descargar CV <span class="btn__arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>

        <dl class="hero__stats">${stats}</dl>
      </div>
    </div>
  </section>`;
}
