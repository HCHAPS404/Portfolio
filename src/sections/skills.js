import { skills, experience, certificates, competitions } from '../data.js';
import { esc, pad2, sectionHead } from '../core/dom.js';
import { t } from '../i18n/index.js';

/** Código corto por categoría (identificador técnico, no se traduce). */
const CAT_CODE = {
  pcb: 'PCB',
  embedded: 'EMB',
  software: 'SW',
  data: 'AI',
  datastore: 'DB',
  ops: 'OPS',
  robotics: 'ROB',
};

/** Símbolo de dos letras por herramienta, al estilo de una tabla periódica. */
const SYMBOLS = {
  'Altium Designer': 'Ad', KiCAD: 'Ki', 'Cadence OrCAD': 'Oc', LTSpice: 'Lt', Multisim: 'Ms', Proteus: 'Pr',
  STM32CubeIDE: 'St', 'Keil MDK': 'Kl', 'ESP-IDF': 'Es', 'Arduino IDE': 'Ar', PlatformIO: 'Pi', 'Vivado / Quartus': 'Vq',
  'VS Code': 'Vc', 'Visual Studio': 'Vs', '.NET / C#': 'C#', Python: 'Py', TypeScript: 'Ts', 'Node.js': 'Nd', React: 'Re', 'Next.js': 'Nx',
  TensorFlow: 'Tf', PyTorch: 'Pt', OpenCV: 'Cv', MATLAB: 'Ml', Jupyter: 'Jp', R: 'R', 'Power BI': 'Bi', 'Apache Spark': 'Sp',
  'SQL Server': 'Sq', PostgreSQL: 'Pg', MongoDB: 'Mg', Redis: 'Rd', Grafana: 'Gf', 'Azure DevOps': 'Az',
  Git: 'Gt', Docker: 'Dk', Linux: 'Lx', Postman: 'Pm', Wireshark: 'Ws', 'MQTT / LoRaWAN': 'Lo',
  'ROS 2': 'R2', Gazebo: 'Gz', 'Fusion 360': 'F3', SolidWorks: 'Sw', Blender: 'Bl', Figma: 'Fg',
};

const symbolOf = (name) => SYMBOLS[name] ?? name.replace(/[^A-Za-z0-9#]/g, '').slice(0, 2);

function chips(list, cls = 'chip') {
  return list.map((item) => `<li class="${cls}">${esc(item)}</li>`).join('');
}

function domainDetail(d) {
  const techs = d.tech.split('·').map((s) => s.trim()).filter(Boolean);
  const cats = (d.categories ?? []).map((id) => skills.tools.find((c) => c.id === id)).filter(Boolean);
  const xp = (d.experience ?? []).map((id) => experience.find((e) => e.id === id)).filter(Boolean);
  const certs = (d.certificates ?? []).map((id) => certificates.find((c) => c.id === id)).filter(Boolean);
  const comps = (d.competitions ?? []).map((id) => competitions.find((c) => c.id === id)).filter(Boolean);

  const blocks = [];
  blocks.push(`
    <section class="dd__block">
      <h5 class="dd__label mono dim">${esc(t('skills.detail.tech'))}</h5>
      <ul class="dd__chips">${chips(techs)}</ul>
    </section>`);

  if (cats.length) {
    blocks.push(`
    <section class="dd__block">
      <h5 class="dd__label mono dim">${esc(t('skills.detail.tools'))}</h5>
      ${cats
        .map(
          (c) => `
        <p class="dd__cat">${esc(c.category)}</p>
        <ul class="dd__chips">${chips(c.items)}</ul>`,
        )
        .join('')}
    </section>`);
  }

  if (xp.length) {
    blocks.push(`
    <section class="dd__block">
      <h5 class="dd__label mono dim">${esc(t('skills.detail.applied'))}</h5>
      <ul class="dd__list">
        ${xp
          .map(
            (e) => `
          <li><a href="#xp-${esc(e.id)}" data-cursor><b>${esc(e.role)}</b><span>${esc(e.org)} · ${esc(e.period)}</span></a></li>`,
          )
          .join('')}
      </ul>
    </section>`);
  }

  if (certs.length) {
    blocks.push(`
    <section class="dd__block">
      <h5 class="dd__label mono dim">${esc(t('skills.detail.certs'))}</h5>
      <ul class="dd__list">
        ${certs.map((c) => `<li><a href="#formacion" data-cursor><b>${esc(c.name)}</b><span>${esc(c.issuer)}${c.date ? ` · ${esc(c.date)}` : ''}</span></a></li>`).join('')}
      </ul>
    </section>`);
  }

  if (comps.length) {
    blocks.push(`
    <section class="dd__block">
      <h5 class="dd__label mono dim">${esc(t('skills.detail.competitions'))}</h5>
      <ul class="dd__list">
        ${comps.map((c) => `<li><a href="#competencias" data-cursor><b>${esc(c.name)}</b><span>${esc(c.flag)} · ${esc(c.org)}</span></a></li>`).join('')}
      </ul>
    </section>`);
  }

  return blocks.join('');
}

function renderDomains() {
  return skills.domains
    .map(
      (d, i) => `
      <li class="domain" data-domain="${esc(d.no)}" data-index="${i}" data-reveal>
        <button class="domain__open" type="button" aria-expanded="false" aria-controls="domain-${esc(d.no)}" aria-label="${esc(t('skills.expand', { title: d.title }))}" data-cursor>
          <span class="domain__no" aria-hidden="true">${esc(d.no)}</span>
          <span class="domain__title">${esc(d.title)}</span>
          <span class="domain__tech">${esc(d.tech)}</span>
          <span class="domain__plus" aria-hidden="true"></span>
        </button>
        <div class="domain__detail" id="domain-${esc(d.no)}" role="region" aria-label="${esc(d.title)}" hidden>
          <header class="dd__head">
            <span class="dd__big" aria-hidden="true">${esc(d.no)}</span>
            <h4 class="dd__title">${esc(d.title)}</h4>
            <button class="domain__close" type="button" aria-label="${esc(t('skills.close'))}" data-cursor><i aria-hidden="true"></i></button>
          </header>
          <div class="dd__cols">${domainDetail(d)}</div>
        </div>
      </li>`,
    )
    .join('');
}

function renderTools() {
  const total = skills.tools.reduce((n, c) => n + c.items.length, 0);
  const biggest = Math.max(...skills.tools.map((c) => c.items.length));

  const cats = [
    `<li><button class="tools__cat is-active" type="button" data-filter="*" aria-pressed="true" data-cursor>
        <span class="tools__cat-name">${esc(t('skills.all'))}</span>
        <span class="tools__cat-n">${pad2(total)}</span>
        <span class="tools__cat-bar" aria-hidden="true"><i style="--w:100%"></i></span>
      </button></li>`,
    ...skills.tools.map(
      (c) => `<li><button class="tools__cat" type="button" data-filter="${esc(c.id)}" aria-pressed="false" data-cursor>
        <span class="tools__cat-name">${esc(c.category)}</span>
        <span class="tools__cat-n">${pad2(c.items.length)}</span>
        <span class="tools__cat-bar" aria-hidden="true"><i style="--w:${Math.round((c.items.length / biggest) * 100)}%"></i></span>
      </button></li>`,
    ),
  ].join('');

  let n = 0;
  const tiles = skills.tools
    .flatMap((c) => {
      const used = skills.domains.filter((d) => (d.categories ?? []).includes(c.id)).map((d) => d.no);
      return c.items.map((name) => {
        n += 1;
        return `
        <li class="tool" data-cat="${esc(c.id)}" data-name="${esc(name.toLowerCase())}">
          <button class="tool__btn" type="button" data-tool="${esc(name)}" data-cat-name="${esc(c.category)}" data-code="${esc(CAT_CODE[c.id] ?? '')}" data-domains="${esc(used.join(' · '))}" data-sym="${esc(symbolOf(name))}">
            <span class="tool__no">${pad2(n)}</span>
            <span class="tool__code">${esc(CAT_CODE[c.id] ?? '')}</span>
            <span class="tool__sym">${esc(symbolOf(name))}</span>
            <span class="tool__name">${esc(name)}</span>
          </button>
        </li>`;
      });
    })
    .join('');

  return `
  <div class="tools" data-tools data-total="${total}">
    <div class="tools__head" data-reveal>
      <h3 class="skills__sub mono dim">${esc(t('skills.sec_b'))}</h3>
      <p class="mono" aria-live="polite"><span data-tools-count>${total}</span> / ${total}</p>
    </div>

    <div class="tools__layout" data-reveal>
      <aside class="tools__side">
        <label class="tools__search">
          <span class="sr-only">${esc(t('skills.search'))}</span>
          <input type="search" placeholder="${esc(t('skills.search'))}" autocomplete="off" spellcheck="false" data-tools-search />
        </label>
        <ul class="tools__cats" role="group" aria-label="${esc(t('skills.filter_aria'))}">${cats}</ul>
      </aside>

      <div class="tools__main">
        <div class="tools__inspector" aria-live="polite" data-inspector data-hint="${esc(t('skills.inspect_hint'))}" data-label-cat="${esc(t('skills.inspect_cat'))}" data-label-domains="${esc(t('skills.inspect_domains'))}">
          <span class="tools__inspector-hint">${esc(t('skills.inspect_hint'))}</span>
        </div>
        <ul class="tools__board">${tiles}</ul>
        <p class="tools__empty" data-tools-empty hidden>${esc(t('skills.no_results'))}</p>
      </div>
    </div>
  </div>`;
}

export function renderSkills() {
  const total = skills.tools.reduce((n, c) => n + c.items.length, 0);
  const soft = skills.softSkills.map((s) => `${esc(s)}<i>✦</i>`).join(' ');

  return `
  <section class="section skills" id="habilidades" aria-labelledby="habilidades-title">
    <div class="wrap">
      ${sectionHead('04', t('nav.skills'), `${esc(t('skills.meta_a', { n: pad2(skills.domains.length) }))}<br>${esc(t('skills.meta_b', { n: total }))}`).replace('<h2 ', '<h2 id="habilidades-title" ')}

      <h3 class="skills__sub mono dim" data-reveal>${esc(t('skills.sec_a'))}</h3>
      <ul class="domains" data-domains>${renderDomains()}</ul>

      ${renderTools()}

      <h3 class="skills__sub mono dim" data-reveal>${esc(t('skills.sec_c'))}</h3>
    </div>

    <div class="marquee marquee--ghost" aria-hidden="true">
      <div class="marquee__track" style="--marquee-dur: 60s"><span>${soft} </span><span>${soft} </span></div>
    </div>
    <p class="sr-only">${skills.softSkills.map(esc).join(', ')}</p>
  </section>`;
}
