import { profile } from '../data.js';
import { esc } from '../core/dom.js';

const CHANNELS = [
  ['web', 'Web', 'helmutchs.com'],
  ['linkedin', 'LinkedIn', 'helmut-chaparro-sandoval'],
  ['github', 'GitHub', '@HCHAPS404'],
  ['instagram', 'Instagram', '@divisum.hell'],
  ['tiktok', 'TikTok', '@imhell.12'],
  ['x', 'X', '@HCHAPS404'],
];

export function renderContact() {
  const email = profile.links.email;
  const channels = CHANNELS.filter(([key]) => profile.links[key])
    .map(
      ([key, label, handle]) => `
      <li>
        <a class="channel" href="${esc(profile.links[key])}" target="_blank" rel="noopener" data-cursor>
          <span class="channel__label">${esc(label)}</span>
          <span class="channel__handle">${esc(handle)}</span>
          <span class="channel__arrow" aria-hidden="true">↗</span>
        </a>
      </li>`,
    )
    .join('');

  return `
  <section class="contact" id="contacto" aria-labelledby="contacto-title">
    <div class="wrap contact__inner">
      <p class="contact__kicker mono"><span>08 — Contacto</span><span>${esc(profile.availability)} para nuevos proyectos</span></p>

      <h2 class="contact__title" id="contacto-title" data-glitch="Hablemos">Hablemos</h2>

      <div class="contact__grid">
        <div class="contact__mail">
          <p class="mono">Correo directo</p>
          <a class="contact__email" href="mailto:${esc(email)}" data-cursor>${esc(email)}</a>
          <div class="contact__actions">
            <a class="btn btn--ink" href="mailto:${esc(email)}" data-cursor data-magnetic>Escribir correo <span class="btn__arrow" aria-hidden="true">↗</span></a>
            <button class="btn btn--line" type="button" data-copy="${esc(email)}" data-cursor>
              <span data-copy-label>Copiar dirección</span>
            </button>
          </div>
          <p class="sr-only" role="status" data-copy-status></p>
        </div>

        <ul class="contact__channels">${channels}</ul>
      </div>
    </div>
  </section>`;
}

export function renderFooter() {
  // Marca gigante del pie: cada letra sube por separado al entrar en vista
  const mark = profile.shortName
    .toUpperCase()
    .split('')
    .map((ch) => (ch === ' ' ? '<span class="footer__gap"></span>' : `<span data-mark-letter>${esc(ch)}</span>`))
    .join('');

  return `
  <footer class="footer">
    <p class="footer__mark" aria-hidden="true">${mark}</p>
    <div class="wrap footer__inner mono">
      <span>© ${new Date().getFullYear()} ${esc(profile.name)}</span>
      <span class="dim">Bogotá <span data-clock>--:--:--</span> COT</span>
      <span class="dim">Diseñado y construido con ASCII, luz y código</span>
      <a href="#inicio" data-cursor>Volver arriba ↑</a>
    </div>
  </footer>`;
}
