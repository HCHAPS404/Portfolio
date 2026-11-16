/**
 * Perfil: el bloque «En la práctica» va rotando escenarios de trabajo (un área y
 * lo que hago en ella). Avanza solo cada pocos segundos mientras está a la vista;
 * las marcas de abajo permiten saltar a uno concreto, y eso detiene el avance.
 */
import { $, $$, pad2, reduceMotion } from './dom.js';

const EVERY = 4600;

export function initAboutUi() {
  const root = $('[data-scenarios]');
  if (!root) return;
  const list = JSON.parse(root.dataset.scenarios);
  const area = $('[data-scn-area]', root);
  const text = $('[data-scn-text]', root);
  const no = $('[data-scn-no]', root);
  const ticks = $$('[data-scn-go]', root);
  let index = 0;
  let visible = false;
  let manual = false;

  function show(i) {
    index = (i + list.length) % list.length;
    const apply = () => {
      area.textContent = list[index].area;
      text.textContent = list[index].text;
      no.textContent = pad2(index + 1);
      ticks.forEach((tick, k) => {
        tick.classList.toggle('is-on', k === index);
        tick.setAttribute('aria-pressed', String(k === index));
      });
      root.classList.remove('is-swapping');
    };
    if (reduceMotion) {
      apply();
      return;
    }
    root.classList.add('is-swapping');
    setTimeout(apply, 260);
  }

  ticks.forEach((tick) =>
    tick.addEventListener('click', () => {
      manual = true;
      root.classList.add('is-manual');
      show(Number(tick.dataset.scnGo));
    }),
  );

  if (reduceMotion) return;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(root);
  setInterval(() => {
    if (visible && !manual && !document.hidden) show(index + 1);
  }, EVERY);
}
