/**
 * Sigilo generativo: un instrumento de líneas (anillos, polígonos, marcas y
 * órbitas) único para cada proyecto, derivado de su nombre. SVG inline animado
 * con CSS: los anillos giran despacio y aceleran al pasar el cursor.
 */
import { hash, rng } from '../core/dom.js';

const C = 50; // centro del lienzo 100 × 100

function polygon(sides, radius, rotation = 0) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = rotation + (i / sides) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(C + Math.cos(a) * radius).toFixed(2)},${(C + Math.sin(a) * radius).toFixed(2)}`);
  }
  return pts.join(' ');
}

function ticks(count, r1, r2, every = 0) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const inner = every && i % every === 0 ? r1 - 3 : r1;
    d += `M${(C + Math.cos(a) * inner).toFixed(2)} ${(C + Math.sin(a) * inner).toFixed(2)}L${(C + Math.cos(a) * r2).toFixed(2)} ${(C + Math.sin(a) * r2).toFixed(2)}`;
  }
  return d;
}

export function sigilSvg(name) {
  const rand = rng(hash(name));
  const pick = (list) => list[Math.floor(rand() * list.length)];

  const sides = pick([3, 4, 5, 6, 8]);
  const innerKind = pick(['polygon', 'star', 'rings', 'cross']);
  const tickCount = pick([12, 24, 36, 48, 60]);
  const dash = pick(['1 3', '2 4', '6 3', '10 4 2 4', '1 6', '14 6']);
  const arcLen = 40 + Math.floor(rand() * 120);
  const orbitR = pick([44, 31, 22]);
  const spin = (20 + Math.floor(rand() * 26)).toFixed(0);
  const dir = rand() > 0.5 ? 'normal' : 'reverse';
  const starSkip = sides > 4 ? 2 : 1;

  let inner = '';
  if (innerKind === 'polygon') {
    inner = `<polygon points="${polygon(sides, 15, Math.PI / sides)}"/>`;
  } else if (innerKind === 'star') {
    // Estrella: une cada vértice con el que está `starSkip` posiciones adelante
    const order = [];
    for (let i = 0, k = 0; i < sides; i++, k = (k + starSkip) % sides) order.push(k);
    const pts = polygon(sides, 30).split(' ');
    inner = `<polygon points="${order.map((k) => pts[k]).join(' ')}"/>`;
  } else if (innerKind === 'rings') {
    inner = `<circle cx="50" cy="50" r="15"/><circle cx="50" cy="50" r="8"/>`;
  } else {
    inner = `<path d="M50 30V70M30 50H70"/><rect x="42" y="42" width="16" height="16" transform="rotate(45 50 50)"/>`;
  }

  return `
  <svg class="sigil" viewBox="0 0 100 100" aria-hidden="true" focusable="false" style="--spin:${spin}s;--dir:${dir}">
    <g class="sigil__ring sigil__ring--a">
      <circle cx="50" cy="50" r="46" stroke-dasharray="${dash}"/>
    </g>
    <g class="sigil__ring sigil__ring--b">
      <path d="${ticks(tickCount, 39, 42, tickCount / 12)}"/>
      <circle class="sigil__arc" cx="50" cy="50" r="36" stroke-dasharray="${arcLen} 400" />
    </g>
    <g class="sigil__ring sigil__ring--c">
      <polygon points="${polygon(sides, 30)}"/>
    </g>
    <g class="sigil__core">${inner}</g>
    <path class="sigil__axis" d="M50 0V8M50 92V100M0 50H8M92 50H100"/>
    <g class="sigil__ring sigil__ring--orbit">
      <rect class="sigil__dot" x="${C + orbitR - 2}" y="48" width="4" height="4"/>
    </g>
    <rect class="sigil__center" x="48.5" y="48.5" width="3" height="3"/>
  </svg>`;
}
