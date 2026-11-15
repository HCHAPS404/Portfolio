import { projects, profile } from '../data.js';
import { esc, pad2, sectionHead } from '../core/dom.js';
import { sigilSvg } from '../visuals/sigil.js';
import { t } from '../i18n/index.js';

export function renderProjects() {
  const cards = projects
    .map(
      (p, i) => `
      <li class="project" data-reveal>
        <a class="project__link" href="${esc(p.repo)}" target="_blank" rel="noopener" data-cursor data-scramble-hover aria-label="${esc(t('proj.open_aria', { name: p.name }))}">
          <span class="project__top mono">
            <span>${pad2(i + 1)}</span>
            <span class="project__status"><i class="pulse" aria-hidden="true"></i>${esc(p.status)}</span>
          </span>
          <span class="project__glyph">${sigilSvg(p.name)}</span>
          <span class="project__name" data-scramble-target>${esc(p.name)}</span>
          ${p.summary ? `<span class="project__desc">${esc(p.summary)}</span>` : ''}
          <span class="project__foot mono">
            <span>${esc(t('proj.path', { name: p.name }))}</span>
            <span class="project__arrow" aria-hidden="true">↗</span>
          </span>
        </a>
      </li>`,
    )
    .join('');

  // Celda de cierre: completa la retícula y lleva al perfil de GitHub
  const more = `
      <li class="project project--more" data-reveal>
        <a class="project__link" href="${esc(profile.links.github)}" target="_blank" rel="noopener" data-cursor aria-label="${esc(t('proj.more_aria'))}">
          <span class="project__top mono"><span>++</span><span>${esc(t('proj.github'))}</span></span>
          <span class="project__name">${esc(t('proj.more'))}</span>
          <span class="project__foot mono"><span>${esc(t('proj.handle'))}</span><span class="project__arrow" aria-hidden="true">↗</span></span>
        </a>
      </li>`;

  return `
  <section class="section projects" id="proyectos" aria-labelledby="proyectos-title">
    <div class="wrap">
      ${sectionHead('06', t('nav.projects'), `${esc(t('proj.meta_a', { n: pad2(projects.length) }))}<br>${esc(t('proj.meta_b'))}`).replace('<h2 ', '<h2 id="proyectos-title" ')}
      <ul class="projects__grid">${cards}${more}</ul>
    </div>
  </section>`;
}
