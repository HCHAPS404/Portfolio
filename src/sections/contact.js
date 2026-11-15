import { profile } from '../data.js';
import { esc } from '../core/dom.js';
import { t } from '../i18n/index.js';

// Iconos de marca (trazados de simple-icons, dominio público CC0), incrustados para no
// depender del paquete. LinkedIn ya no está en esa colección y el globo es propio.
const ICONS = {
  web: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 1.8c.9 0 2.3 1.9 2.9 5.3H9.1C9.7 5.7 11.1 3.8 12 3.8zM8.6 4.5C7.8 5.6 7.2 7.2 7 9.1H4.3a8.2 8.2 0 0 1 4.3-4.6zm6.8 0a8.2 8.2 0 0 1 4.3 4.6H17c-.2-1.9-.8-3.5-1.6-4.6zM4 11h3c-.1.6-.1 1.3-.1 2s0 1.4.1 2H4.1a8.1 8.1 0 0 1-.1-4zm5 0h6c.1.6.1 1.3.1 2s0 1.4-.1 2H9c-.1-.6-.1-1.3-.1-2s0-1.4.1-2zm8 0h3a8.1 8.1 0 0 1-.1 4H17c.1-.6.1-1.3.1-2s0-1.4-.1-2zM4.3 17H7c.2 1.9.8 3.5 1.6 4.6A8.2 8.2 0 0 1 4.3 17zm4.8 0h5.8c-.6 3.4-2 5.3-2.9 5.3S9.7 20.4 9.1 17zm7.9 0h2.7a8.2 8.2 0 0 1-4.3 4.6c.8-1.1 1.4-2.7 1.6-4.6z',
  linkedin:
    'M3 2h18a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm3.5 3.3a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zM5 10v9h3v-9H5zm5 0v9h3v-4.6c0-1.2.5-2 1.6-2s1.4.8 1.4 2V19h3v-5.2c0-2.6-1.4-4-3.4-4-1.3 0-2.2.6-2.6 1.3V10H10z',
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  instagram:
    'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077',
  tiktok:
    'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  x:
    'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z',
};

// Nombres propios y usuarios no se traducen; "Sitio web" sí (clave ch.web).
const CHANNELS = [
  ['web', null, 'helmutchs.com'],
  ['linkedin', 'LinkedIn', 'Helmut Chaparro Sandoval'],
  ['github', 'GitHub', '@HCHAPS404'],
  ['instagram', 'Instagram', '@divisum.hell'],
  ['tiktok', 'TikTok', '@imhell.12'],
  ['x', 'X', '@HCHAPS404'],
];

/** Largo visual del titular: los caracteres CJK y cirílicos ocupan más que los latinos. */
function visualLength(text) {
  let n = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    n += code >= 0x2e80 ? 1.75 : code >= 0x400 && code <= 0x4ff ? 1.3 : 1; // CJK, cirilico, latino
  }
  return Math.max(8, n);
}

export function renderContact() {
  const email = profile.links.email;
  const title = t('contact.title');
  const channels = CHANNELS.filter(([key]) => profile.links[key])
    .map(([key, name, handle]) => {
      const label = name ?? t('ch.web');
      return `
      <li>
        <a class="channel" href="${esc(profile.links[key])}" target="_blank" rel="noopener" data-cursor aria-label="${esc(label)}: ${esc(handle)}">
          <span class="channel__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false"><path d="${ICONS[key]}" fill-rule="evenodd"/></svg>
          </span>
          <span class="channel__text">
            <span class="channel__label">${esc(label)}</span>
            <span class="channel__handle">${esc(handle)}</span>
          </span>
          <span class="channel__arrow" aria-hidden="true">↗</span>
        </a>
      </li>`;
    })
    .join('');

  return `
  <section class="contact" id="contacto" aria-labelledby="contacto-title">
    <div class="wrap contact__inner">
      <p class="contact__kicker mono"><span>08 / ${esc(t('nav.contact'))}</span><span>${esc(t('contact.availability'))}</span></p>

      <h2 class="contact__title" id="contacto-title" data-glitch="${esc(title)}" style="--chars:${visualLength(title).toFixed(2)}">${esc(title)}</h2>

      <div class="contact__grid">
        <div class="contact__mail">
          <p class="mono">${esc(t('contact.mail'))}</p>
          <a class="contact__email" href="mailto:${esc(email)}" data-cursor>${esc(email)}</a>
          <div class="contact__actions">
            <a class="btn btn--ink" href="mailto:${esc(email)}" data-cursor data-magnetic>${esc(t('contact.write'))} <span class="btn__arrow" aria-hidden="true">↗</span></a>
            <button class="btn btn--line" type="button" data-copy="${esc(email)}" data-cursor>
              <span data-copy-label>${esc(t('contact.copy'))}</span>
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
      <a href="#inicio" data-cursor>${esc(t('footer.top'))}</a>
    </div>
  </footer>`;
}
