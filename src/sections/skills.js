import { skills } from '../data.js';
import { esc, pad2, sectionHead } from '../core/dom.js';

export function renderSkills() {
  const domains = skills.domains
    .map(
      (d) => `
      <li class="domain" data-reveal data-cursor>
        <span class="domain__no" aria-hidden="true">${esc(d.no)}</span>
        <h4 class="domain__title">${esc(d.title)}</h4>
        <p class="domain__tech">${esc(d.tech)}</p>
      </li>`,
    )
    .join('');

  const tabs = [{ category: 'Todas' }, ...skills.tools]
    .map(
      (c, i) =>
        `<button class="tools__tab${i === 0 ? ' is-active' : ''}" type="button" data-filter="${i === 0 ? '*' : esc(c.category)}" aria-pressed="${i === 0}" data-cursor>${esc(c.category)}</button>`,
    )
    .join('');

  const total = skills.tools.reduce((n, c) => n + c.items.length, 0);
  const chips = skills.tools
    .flatMap((c) => c.items.map((item) => `<li class="chip" data-cat="${esc(c.category)}">${esc(item)}</li>`))
    .join('');

  const soft = skills.softSkills.map((s) => `${esc(s)}<i>✦</i>`).join(' ');

  return `
  <section class="section skills" id="habilidades" aria-labelledby="habilidades-title">
    <div class="wrap">
      ${sectionHead('04', 'Habilidades', `${pad2(skills.domains.length)} dominios<br>${total} herramientas`).replace('<h2 ', '<h2 id="habilidades-title" ')}

      <h3 class="skills__sub mono dim" data-reveal>A — Dominios de afinidad</h3>
      <ul class="domains">${domains}</ul>

      <div class="tools">
        <div class="tools__head" data-reveal>
          <h3 class="skills__sub mono dim">B — Herramientas</h3>
          <p class="mono" aria-live="polite"><span data-tools-count>${total}</span> / ${total}</p>
        </div>
        <div class="tools__tabs" role="group" aria-label="Filtrar herramientas por categoría" data-reveal>${tabs}</div>
        <ul class="tools__chips" data-reveal>${chips}</ul>
      </div>

      <h3 class="skills__sub mono dim" data-reveal>C — Habilidades blandas</h3>
    </div>

    <div class="marquee marquee--ghost" aria-hidden="true">
      <div class="marquee__track" style="--marquee-dur: 60s"><span>${soft} </span><span>${soft} </span></div>
    </div>
    <p class="sr-only">${skills.softSkills.map(esc).join(', ')}</p>
  </section>`;
}
