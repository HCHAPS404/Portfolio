import { profile } from '../data.js';
import { esc, pad2, sectionHead } from '../core/dom.js';
import { t } from '../i18n/index.js';
import { ICONS } from './contact.js';

// Canales que se muestran como iconos al pie del perfil (los mismos del contacto, más el correo)
const CHANNELS = ['web', 'linkedin', 'github', 'instagram', 'tiktok', 'x', 'email'];
const LEVELS = 6; // A1 · A2 · B1 · B2 · C1 · nativo

export function renderAbout() {
  const emphasis = profile.emphasis
    .map((e, i) => `<li><span class="mono" aria-hidden="true">${pad2(i + 1)}</span>${esc(e)}</li>`)
    .join('');

  // «Cargo · Organización» se pinta en dos líneas; el resto son áreas de práctica
  const roles = profile.tags.filter((tag) => tag.includes(' · '));
  const areas = profile.tags.filter((tag) => !tag.includes(' · '));
  const roleItems = roles
    .map((tag) => {
      const [role, org] = tag.split(' · ');
      return `<li class="rtag"><b>${esc(role)}</b><span>${esc(org)}</span></li>`;
    })
    .join('');
  const areaItems = areas.map((tag) => `<li class="tag">${esc(tag)}</li>`).join('');

  const first = profile.scenarios[0];
  const ticks = profile.scenarios
    .map(
      (s, i) =>
        `<button type="button" data-scn-go="${i}" class="${i ? '' : 'is-on'}" aria-pressed="${i === 0}" aria-label="${esc(s.area)}" data-cursor><i></i></button>`,
    )
    .join('');

  const languages = profile.languages
    .map((l) => {
      const scale = Array.from({ length: LEVELS }, (_, k) => `<i class="${k < l.steps ? 'is-on' : ''}"></i>`).join('');
      return `
      <li class="lng" data-reveal>
        <span class="lng__glyph" aria-hidden="true">${esc(l.glyph)}</span>
        <span class="lng__name">${esc(l.name)}</span>
        <span class="lng__level">${esc(l.level)}</span>
        <span class="lng__scale" aria-hidden="true">${scale}</span>
      </li>`;
    })
    .join('');

  const channels = CHANNELS.filter((key) => profile.links[key])
    .map((key) => {
      const href = key === 'email' ? `mailto:${profile.links.email}` : profile.links[key];
      const external = key === 'email' ? '' : ' target="_blank" rel="noopener"';
      return `
      <li><a class="ico" href="${esc(href)}"${external} aria-label="${esc(t(`ch.${key}`))}" title="${esc(t(`ch.${key}`))}" data-cursor>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${ICONS[key]}" fill-rule="evenodd"/></svg>
      </a></li>`;
    })
    .join('');

  return `
  <section class="section about" id="perfil" aria-labelledby="perfil-title">
    <div class="wrap">
      ${sectionHead('01', t('nav.profile'), '').replace('<h2 ', '<h2 id="perfil-title" ')}

      <div class="about__grid">
        <figure class="about__figure corners" data-reveal>
          <div class="about__frame">
            <canvas class="about__canvas" role="img" aria-label="${esc(t('about.portrait_alt', { name: profile.name }))}"></canvas>
            <span class="about__scanline" aria-hidden="true"></span>
          </div>
        </figure>

        <div class="about__body">
          <p class="about__title" data-reveal>${esc(profile.title)}</p>
          <div class="about__emph" data-reveal>
            <h3 class="mono dim">${esc(t('about.emphasis'))}</h3>
            <ol>${emphasis}</ol>
          </div>

          <p class="about__lead" data-split>${esc(profile.about)}</p>

          <div class="scn" data-scenarios="${esc(JSON.stringify(profile.scenarios))}" data-reveal>
            <p class="scn__head mono">
              <span class="dim">${esc(t('about.scenarios'))}</span>
              <span class="scn__count" aria-hidden="true"><b data-scn-no>01</b> / ${pad2(profile.scenarios.length)}</span>
            </p>
            <div class="scn__body" aria-live="polite">
              <p class="scn__area" data-scn-area>${esc(first.area)}</p>
              <p class="scn__text" data-scn-text>${esc(first.text)}</p>
            </div>
            <div class="scn__ticks">${ticks}</div>
          </div>
        </div>
      </div>

      <div class="about__lower">
        <div class="about__roles" data-reveal>
          <h3 class="mono dim">${esc(t('about.roles'))}</h3>
          <ul class="rtags">${roleItems}</ul>
          <ul class="about__tags">${areaItems}</ul>
        </div>

        <div class="about__langs">
          <h3 class="mono dim" data-reveal>${esc(t('about.langs'))} / ${pad2(profile.languages.length)}</h3>
          <ul class="lngs">${languages}</ul>
        </div>
      </div>

      <ul class="about__channels" aria-label="${esc(t('about.channels'))}" data-reveal>${channels}</ul>
    </div>
  </section>`;
}
