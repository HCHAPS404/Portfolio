/**
 * Placa electrónica multicapa en vista explosionada (hero).
 *
 * Todo es procedural: un microcontrolador central con 40 pines, buses enrutados
 * a 45° con separación constante, vías que atraviesan las tres capas, plano de
 * tierra tramado, componentes extruidos y pulsos rojos que recorren las pistas.
 * Proyección ortográfica inclinada; la placa oscila despacio y sigue al cursor.
 */
import { fitCanvas, visibleLoop, reduceMotion, rng } from '../core/dom.js';

const INK = '237,235,230';
const BG = '8,8,10';
const RED = '#ee2e33';

const BW = 72;       // ancho de la placa (unidades)
const BH = 48;       // alto de la placa
const PITCH = 1.2;   // paso entre pines
const K = Math.SQRT2 - 1; // 0.414: desfase que mantiene la separación en un quiebre a 45°
const TILT = 1.02;   // inclinación de la vista (rad desde la vertical)

/* ---------------------------------------------------------------------------
   Geometría (se construye una sola vez)
   ------------------------------------------------------------------------- */

/**
 * Enruta un bus de pistas paralelas con un quiebre a 45°.
 *  d: dirección de salida · n: lado hacia el que gira
 *  mode 'same': tras el quiebre sigue en la dirección d hasta `target` (coordenada sobre d)
 *  mode 'turn': tras el quiebre sigue en la dirección n hasta `target` (coordenada sobre n)
 */
function bundle(pins, d, n, { l1, diag, extent, mode, target }) {
  const along = (p, v) => p[0] * v[0] + p[1] * v[1];
  const offsets = pins.map((p) => along(p, n));
  const min = Math.min(...offsets);

  return pins.map((pin, i) => {
    const o = offsets[i] - min; // 0 = pista exterior, mayor = más cerca del giro
    const a = l1 - K * o;
    const p1 = [pin[0] + d[0] * a, pin[1] + d[1] * a];
    const dg = mode === 'same' ? diag : extent - o - a;
    const p2 = [p1[0] + (d[0] + n[0]) * dg, p1[1] + (d[1] + n[1]) * dg];
    const axis = mode === 'same' ? d : n;
    const rest = target * 1 - along(p2, axis);
    const p3 = [p2[0] + axis[0] * rest, p2[1] + axis[1] * rest];
    return [pin, p1, p2, p3];
  });
}

/** Ruta en L con chaflán a 45° entre dos puntos (capa inferior). */
function chamfer(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const c = Math.min(Math.abs(dx), Math.abs(dy), 3);
  const sx = Math.sign(dx) || 1;
  const sy = Math.sign(dy) || 1;
  return [a, [b[0] - sx * c, a[1]], [b[0], a[1] + sy * c], b];
}

function withLength(pts, extra = {}) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return { pts, cum, len: cum[cum.length - 1], ...extra };
}

function buildBoard() {
  const rand = rng(404);
  const top = [];     // pistas de la capa superior
  const bottom = [];  // pistas de la capa inferior
  const pads = [];    // [x, y, w, h]
  const vias = [];    // [x, y]
  const comps = [];   // componentes extruidos
  const silk = [];    // textos de serigrafía

  /* --- U1: microcontrolador, 10 pines por lado --- */
  const mx = -2, my = 1, half = 7, tip = half + 0.9;
  const offs = Array.from({ length: 10 }, (_, k) => (k - 4.5) * PITCH);
  const side = {
    west: offs.map((o) => [mx - tip, my + o]),
    east: offs.map((o) => [mx + tip, my + o]),
    north: offs.map((o) => [mx + o, my + tip]),
    south: offs.map((o) => [mx + o, my - tip]),
  };
  comps.push({ kind: 'chip', x: mx, y: my, w: half * 2, h: half * 2, z: 1.3, label: 'U1' });

  const add = (list, routes, extra) => routes.forEach((r) => list.push(withLength(r, extra)));

  // A · oeste → conector de depuración J1
  add(top, bundle(side.west, [-1, 0], [0, 1], { l1: 6, diag: 5, mode: 'same', target: 31 }));
  // B · norte (mitad izquierda) → módulo de radio U3
  add(top, bundle(side.north.slice(0, 5), [0, 1], [-1, 0], { l1: 5, extent: 11, mode: 'turn', target: 22 }));
  // C · norte (mitad derecha) → memoria U2
  add(top, bundle(side.north.slice(5), [0, 1], [1, 0], { l1: 5, extent: 11, mode: 'turn', target: 16 }));
  // D · este → conector de expansión J2
  add(top, bundle(side.east, [1, 0], [0, -1], { l1: 7, diag: 6, mode: 'same', target: 30 }));
  // E · sur (mitad izquierda) → sensor U4
  add(top, bundle(side.south.slice(0, 5), [0, -1], [-1, 0], { l1: 4, extent: 9, mode: 'turn', target: 20 }));
  // F · sur (mitad derecha) → etapa de potencia
  const powerBus = bundle(side.south.slice(5), [0, -1], [1, 0], { l1: 4, extent: 9, mode: 'turn', target: 14 });
  add(top, powerBus);
  powerBus.forEach((r) => vias.push(r[3]));

  // Patas del microcontrolador (del cuerpo al inicio de cada pista)
  Object.entries(side).forEach(([name, pins]) => {
    pins.forEach((p) => {
      const inward = { west: [0.9, 0], east: [-0.9, 0], north: [0, -0.9], south: [0, 0.9] }[name];
      pads.push([p[0] + inward[0] / 2, p[1] + inward[1] / 2, name === 'west' || name === 'east' ? 0.9 : 0.5, name === 'west' || name === 'east' ? 0.5 : 0.9]);
    });
  });

  /* --- Componentes principales --- */
  comps.push({ kind: 'header', x: -32.6, y: 6, w: 2.2, h: 13, z: 1, pins: 10, label: 'J1' });
  comps.push({ kind: 'header', x: 31.6, y: -5, w: 2.2, h: 13, z: 1, pins: 10, label: 'J2' });
  comps.push({ kind: 'can', x: -27, y: 16.5, w: 9, h: 10, z: 2.1, label: 'U3' });
  comps.push({ kind: 'chip', x: 21, y: 17.5, w: 9, h: 8, z: 1, label: 'U2' });
  comps.push({ kind: 'chip', x: -25, y: -13.5, w: 9, h: 7, z: 0.9, label: 'U4' });
  comps.push({ kind: 'chip', x: 19, y: -18.5, w: 4.4, h: 4.4, z: 2.2, label: 'L1' });
  comps.push({ kind: 'cyl', x: 26, y: -16.5, r: 2.5, z: 5.2, label: 'C1' });
  comps.push({ kind: 'cyl', x: 26.5, y: 9.5, r: 1.5, z: 3.4, label: 'C2' });
  comps.push({ kind: 'chip', x: -13, y: -6.6, w: 3.4, h: 1.6, z: 0.9, label: 'Y1' });

  // Pasivos: condensadores de desacople, resistencias y LED
  const passives = [
    [7.4, 10.2, 1], [9.8, 10.2, 1], [-11.2, 10.4, 0], [7.4, -8.6, 0], [9.8, -8.6, 0],
    [17, 22.7, 1], [20, 22.7, 1], [23, 22.7, 1], [26, 22.7, 1],
    [-28, -19.4, 1], [-25, -19.4, 1], [-22, -19.4, 1],
    [1, -20.6, 1], [4, -20.6, 1], [7, -20.6, 1], [10, -20.6, 1],
    [-17, -3.2, 0], [-19.6, -3.2, 0], [12.5, 9.4, 0], [15, 9.4, 0],
    [29, 14, 0], [29, 17, 0], [29, 20, 0], [-8, 21.6, 1], [-12, 21.6, 1],
  ];
  passives.forEach(([x, y, horizontal]) => {
    comps.push({ kind: 'cap', x, y, w: horizontal ? 1.7 : 0.9, h: horizontal ? 0.9 : 1.7, z: 0.6 });
  });

  // Cristal: dos pistas cortas al microcontrolador
  add(top, [
    [[-11.3, -6.2], [-10.4, -6.2], [-9.6, -5.4]],
    [[-11.3, -7], [-9.2, -7], [-8.4, -6.2]],
  ]);

  // Antena en meandro del módulo de radio
  const antenna = [[-29, 21.5], [-29, 22.3]];
  for (let i = 0; i < 9; i++) {
    const x = -29 - i * 0.55;
    antenna.push([x - 0.55, i % 2 ? 22.3 : 23.3], [x - 0.55, i % 2 ? 23.3 : 22.3]);
  }
  add(top, [antenna], { antenna: true });

  /* --- Vías adicionales --- */
  [[9, 12.4], [12.4, 11.6], [20, 9.6], [24, 11], [-18, -5.6], [-22, -5], [-30, -6],
   [-33, -12], [-9, 19.6], [-14, 20], [8, -17.6], [-4, -21], [-12, -21], [28, -11.6],
   [31, -20], [18, -13], [-16, 13.4], [-32, 20.6], [2, 21.6], [12, 21.6], [-6, -18],
   [33, 8], [-20, 8.6], [22, 4.4]].forEach((v) => vias.push(v));

  /* --- Capa inferior: conexiones entre vías y un bus largo --- */
  const order = vias.map((_, i) => i).sort((a, b) => vias[a][0] - vias[b][0]);
  for (let i = 0; i + 3 < order.length; i += 2) {
    if (rand() < 0.2) continue;
    add(bottom, [chamfer(vias[order[i]], vias[order[i + 3]])]);
  }
  const busPins = Array.from({ length: 8 }, (_, k) => [-30, -21 + k * PITCH]);
  add(bottom, bundle(busPins, [1, 0], [0, 1], { l1: 20, diag: 16, mode: 'same', target: 31 }));
  const busPins2 = Array.from({ length: 6 }, (_, k) => [-30 + k * PITCH, 21]);
  add(bottom, bundle(busPins2, [0, -1], [1, 0], { l1: 9, extent: 22, mode: 'turn', target: 8 }));

  /* --- Plano intermedio: trama diagonal recortada a la placa --- */
  const hatch = [];
  const hx = BW / 2 - 1.5, hy = BH / 2 - 1.5;
  for (let c = -(hx + hy); c <= hx + hy; c += 2.2) {
    // Recta y = x + c recortada al rectángulo
    const x0 = Math.max(-hx, -hy - c);
    const x1 = Math.min(hx, hy - c);
    if (x1 > x0) hatch.push([[x0, x0 + c], [x1, x1 + c]]);
  }
  // Frontera que divide el plano en dos zonas (GND / 3V3)
  const split = [[-hx, -4], [-14, -4], [-10, 0], [-10, 9], [-5, 14], [12, 14], [16, 10], [hx, 10]];

  /* --- Serigrafía --- */
  silk.push({ text: 'HCS-01', x: -33.5, y: -22.6, size: 2.6, alpha: 0.9 });
  silk.push({ text: 'REV A · 3 CAPAS', x: -22.5, y: -22.4, size: 1.15, alpha: 0.55 });
  silk.push({ text: 'DISEÑADO EN BOGOTÁ', x: 13, y: -22.4, size: 1.15, alpha: 0.55 });
  comps.forEach((c) => {
    if (!c.label || c.kind === 'cap') return;
    const w = c.kind === 'cyl' ? c.r : c.w / 2;
    const h = c.kind === 'cyl' ? c.r : c.h / 2;
    silk.push({ text: c.label, x: c.x - w, y: c.y + h + 0.6, size: 1.1, alpha: 0.6 });
  });

  // Contorno redondeado y perforaciones de montaje
  const outline = [];
  const R = 2.4;
  [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(([sx, sy], q) => {
    for (let s = 0; s <= 5; s++) {
      const a = (q * Math.PI) / 2 + (s / 5) * (Math.PI / 2);
      outline.push([sx * (BW / 2 - R) + Math.cos(a) * R, sy * (BH / 2 - R) + Math.sin(a) * R]);
    }
  });
  const holes = [[-33, 21.2], [33, 21.2], [33, -21.2], [-33.6, -19]];

  return { top, bottom, pads, vias, comps, silk, hatch, split, outline, holes };
}

/* ---------------------------------------------------------------------------
   Render
   ------------------------------------------------------------------------- */
export function createPcb(canvas) {
  const B = buildBoard();
  const seeds = rng(77);
  const pulse = (list) => list.map(() => ({ period: 2.4 + seeds() * 3.6, phase: seeds() * 6, on: seeds() < 0.62 }));
  const pulseTop = pulse(B.top);
  const pulseBottom = pulse(B.bottom);
  const pulseVia = pulse(B.vias);

  let ctx, W, H, dpr;
  let start = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const cosT = Math.cos(TILT);
  const sinT = Math.sin(TILT);

  // Estado de cámara, recalculado en cada frame
  let cy = 1, sn = 0, S = 8, CX = 0, CY = 0;

  const px = (x, y) => CX + (x * cy - y * sn) * S;
  const py = (x, y, z) => CY - (x * sn + y * cy) * cosT * S - z * sinT * S;
  const depth = (x, y) => x * sn + y * cy; // mayor = más lejos

  function resize() {
    ({ ctx, width: W, height: H, dpr } = fitCanvas(canvas));
  }

  function poly(pts, z, close) {
    ctx.beginPath();
    ctx.moveTo(px(pts[0][0], pts[0][1]), py(pts[0][0], pts[0][1], z));
    for (let i = 1; i < pts.length; i++) ctx.lineTo(px(pts[i][0], pts[i][1]), py(pts[i][0], pts[i][1], z));
    if (close) ctx.closePath();
  }

  /** Dibuja una pista hasta la fracción `frac` de su longitud. */
  function trace(tr, z, frac) {
    const limit = tr.len * frac;
    const { pts, cum } = tr;
    ctx.moveTo(px(pts[0][0], pts[0][1]), py(pts[0][0], pts[0][1], z));
    for (let i = 1; i < pts.length; i++) {
      if (cum[i] <= limit) {
        ctx.lineTo(px(pts[i][0], pts[i][1]), py(pts[i][0], pts[i][1], z));
      } else {
        const f = (limit - cum[i - 1]) / (cum[i] - cum[i - 1]);
        if (f > 0) {
          const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f;
          const y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f;
          ctx.lineTo(px(x, y), py(x, y, z));
        }
        break;
      }
    }
  }

  function pointAt(tr, s) {
    const { pts, cum } = tr;
    for (let i = 1; i < pts.length; i++) {
      if (s <= cum[i]) {
        const f = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
        return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
      }
    }
    return pts[pts.length - 1];
  }

  function ring(x, y, z, r) {
    ctx.moveTo(px(x, y) + r * S, py(x, y, z));
    ctx.ellipse(px(x, y), py(x, y, z), r * S, r * S * cosT, 0, 0, Math.PI * 2);
  }

  /** Texto apoyado sobre el plano de la placa (serigrafía). */
  function planeText(text, x, y, z, size, alpha) {
    const k = (size * S) / 10;
    ctx.setTransform(
      cy * k * dpr, -sn * cosT * k * dpr,
      sn * k * dpr, cy * cosT * k * dpr,
      px(x, y) * dpr, py(x, y, z) * dpr,
    );
    ctx.font = '500 10px "JetBrains Mono", ui-monospace, Consolas, monospace';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = `rgba(${INK},${alpha})`;
    ctx.fillText(text, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function box(c, z0, alpha) {
    const hw = c.w / 2, hh = c.h / 2;
    const corners = [[c.x - hw, c.y - hh], [c.x + hw, c.y - hh], [c.x + hw, c.y + hh], [c.x - hw, c.y + hh]];
    const z1 = z0 + c.z;
    const faces = corners
      .map((a, i) => ({ a, b: corners[(i + 1) % 4], d: depth((a[0] + corners[(i + 1) % 4][0]) / 2, (a[1] + corners[(i + 1) % 4][1]) / 2) }))
      .sort((f, g) => g.d - f.d);

    ctx.fillStyle = `rgba(${BG},0.94)`;
    ctx.strokeStyle = `rgba(${INK},${alpha})`;
    faces.forEach(({ a, b }) => {
      ctx.beginPath();
      ctx.moveTo(px(a[0], a[1]), py(a[0], a[1], z0));
      ctx.lineTo(px(b[0], b[1]), py(b[0], b[1], z0));
      ctx.lineTo(px(b[0], b[1]), py(b[0], b[1], z1));
      ctx.lineTo(px(a[0], a[1]), py(a[0], a[1], z1));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    poly(corners, z1, true);
    ctx.fill();
    ctx.stroke();
    return { corners, z1 };
  }

  function drawComponent(c, z0, t) {
    ctx.lineWidth = 1;
    if (c.kind === 'cap') {
      box(c, z0, 0.6);
      return;
    }

    if (c.kind === 'cyl') {
      const x = px(c.x, c.y);
      const yb = py(c.x, c.y, z0);
      const yt = py(c.x, c.y, z0 + c.z);
      const rx = c.r * S, ry = c.r * S * cosT;
      ctx.fillStyle = `rgba(${BG},0.94)`;
      ctx.strokeStyle = `rgba(${INK},0.85)`;
      ctx.beginPath();
      ctx.ellipse(x, yb, rx, ry, 0, 0, Math.PI);
      ctx.lineTo(x - rx, yt);
      ctx.lineTo(x + rx, yt);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, yt, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Marca de polaridad y cruz de seguridad en la tapa
      ctx.beginPath();
      ctx.ellipse(x, yt, rx * 0.62, ry * 0.62, 0, 0, Math.PI * 2);
      ctx.moveTo(x - rx * 0.5, yt);
      ctx.lineTo(x + rx * 0.5, yt);
      ctx.strokeStyle = `rgba(${INK},0.4)`;
      ctx.stroke();
      return;
    }

    const { corners, z1 } = box(c, z0, c.kind === 'chip' && c.label === 'U1' ? 1 : 0.85);

    if (c.kind === 'header') {
      // Postes del conector
      const vertical = c.h > c.w;
      ctx.strokeStyle = `rgba(${INK},0.9)`;
      ctx.fillStyle = `rgba(${INK},0.9)`;
      for (let i = 0; i < c.pins; i++) {
        const o = (i - (c.pins - 1) / 2) * PITCH;
        const x = c.x + (vertical ? 0 : o);
        const y = c.y + (vertical ? o : 0);
        ctx.beginPath();
        ctx.moveTo(px(x, y), py(x, y, z1));
        ctx.lineTo(px(x, y), py(x, y, z1 + 2.6));
        ctx.stroke();
        ctx.fillRect(px(x, y) - 1.2, py(x, y, z1 + 2.6) - 1.2, 2.4, 2.4);
      }
      return;
    }

    if (c.kind === 'can') {
      // Blindaje de radiofrecuencia: diagonales y perforaciones
      ctx.strokeStyle = `rgba(${INK},0.3)`;
      ctx.beginPath();
      ctx.moveTo(px(corners[0][0], corners[0][1]), py(corners[0][0], corners[0][1], z1));
      ctx.lineTo(px(corners[2][0], corners[2][1]), py(corners[2][0], corners[2][1], z1));
      ctx.moveTo(px(corners[1][0], corners[1][1]), py(corners[1][0], corners[1][1], z1));
      ctx.lineTo(px(corners[3][0], corners[3][1]), py(corners[3][0], corners[3][1], z1));
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) ring(c.x + i * 2.6, c.y + j * 3, z1, 0.32);
      ctx.stroke();
      return;
    }

    // Circuito integrado: marco interior, punto del pin 1 y texto en la tapa
    const inset = Math.min(c.w, c.h) * 0.12;
    ctx.strokeStyle = `rgba(${INK},0.35)`;
    poly(
      [[c.x - c.w / 2 + inset, c.y - c.h / 2 + inset], [c.x + c.w / 2 - inset, c.y - c.h / 2 + inset],
       [c.x + c.w / 2 - inset, c.y + c.h / 2 - inset], [c.x - c.w / 2 + inset, c.y + c.h / 2 - inset]],
      z1, true,
    );
    ctx.stroke();
    if (c.w > 6) {
      ctx.beginPath();
      ring(c.x - c.w / 2 + inset * 2.1, c.y + c.h / 2 - inset * 2.1, z1, 0.45);
      ctx.fillStyle = c.label === 'U1' ? RED : `rgba(${INK},0.8)`;
      ctx.fill();
    }
    if (c.label === 'U1') {
      planeText('HCS', c.x - 4.4, c.y - 0.2, z1, 3.3, 0.95);
      planeText('32-BIT · MCU', c.x - 4.4, c.y - 2.5, z1, 0.95, 0.55);
      // Núcleo "latiendo": un cuadro que pulsa al ritmo del reloj
      const beat = 0.5 + 0.5 * Math.sin(t * 0.004);
      ctx.strokeStyle = `rgba(238,46,51,${(0.25 + beat * 0.6).toFixed(2)})`;
      const r = 1 + beat * 0.35;
      poly([[c.x + 3 - r, c.y + 3.4 - r], [c.x + 3 + r, c.y + 3.4 - r], [c.x + 3 + r, c.y + 3.4 + r], [c.x + 3 - r, c.y + 3.4 + r]], z1, true);
      ctx.stroke();
    }
  }

  function drawSignals(list, state, z, t, alpha) {
    list.forEach((tr, i) => {
      const s = state[i];
      if (!s.on || tr.antenna) return;
      const u = ((t * 0.001 + s.phase) % s.period) / s.period;
      if (u > 0.42) return;
      const head = (u / 0.42) * tr.len;
      for (let k = 0; k < 5; k++) {
        const d = head - k * 0.85;
        if (d < 0) break;
        const [x, y] = pointAt(tr, d);
        const size = k === 0 ? 3.4 : 2.2;
        ctx.fillStyle = `rgba(238,46,51,${((1 - k / 5) * alpha).toFixed(2)})`;
        ctx.fillRect(px(x, y) - size / 2, py(x, y, z) - size / 2, size, size);
      }
    });
  }

  function label(text, x, y, z, dx, dy, alpha, accent) {
    const ax = px(x, y), ay = py(x, y, z);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = accent ? RED : `rgba(${INK},0.6)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax + dx, ay + dy);
    ctx.lineTo(ax + dx + Math.sign(dx || 1) * 12, ay + dy);
    ctx.stroke();
    ctx.fillStyle = accent ? RED : `rgba(${INK},0.95)`;
    ctx.fillRect(ax - 2, ay - 2, 4, 4);

    ctx.font = '500 10px "JetBrains Mono", ui-monospace, Consolas, monospace';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(text).width;
    const left = dx < 0;
    const tx = ax + dx + (left ? -16 - tw : 16);
    ctx.fillStyle = `rgba(${BG},0.86)`;
    ctx.fillRect(tx - 4, ay + dy - 8, tw + 8, 16);
    ctx.fillStyle = accent ? RED : `rgba(${INK},0.94)`;
    ctx.fillText(text, tx, ay + dy);
    ctx.globalAlpha = 1;
  }

  function draw(now) {
    if (!start) start = now;
    const t = reduceMotion ? 9000 : now - start;
    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;

    const small = W < 640;
    const yaw = -0.6 + Math.sin(t * 0.00019) * 0.2 + pointer.x * 0.22;
    cy = Math.cos(yaw);
    sn = Math.sin(yaw);
    S = Math.min(W / 92, H / 68);
    CX = W * 0.5;
    CY = H * 0.53;

    // Entrada: las capas se separan y las pistas se trazan
    const ease = (v) => 1 - Math.pow(1 - Math.min(1, Math.max(0, v)), 3);
    const explode = ease((t - 500) / 2200);
    const gap = explode * (9.5 + Math.sin(t * 0.0006) * 0.9 - pointer.y * 2.2);
    const drawn = ease(t / 2600);
    const zTop = gap, zMid = 0, zBot = -gap;

    ctx.clearRect(0, 0, W, H);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const boardBase = (z, alpha) => {
      poly(B.outline, z, true);
      ctx.fillStyle = `rgba(${BG},0.8)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${INK},${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      B.holes.forEach((h) => ring(h[0], h[1], z, 1.25));
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    /* ----- Capa inferior ----- */
    boardBase(zBot, 0.45);
    ctx.beginPath();
    B.bottom.forEach((tr) => trace(tr, zBot, drawn));
    ctx.strokeStyle = `rgba(${INK},0.58)`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    B.vias.forEach((v) => ring(v[0], v[1], zBot, 0.42));
    ctx.stroke();
    drawSignals(B.bottom, pulseBottom, zBot, t, 0.75);

    /* ----- Plano intermedio (tierra / alimentación) ----- */
    boardBase(zMid, 0.4);
    ctx.beginPath();
    B.hatch.forEach((seg) => {
      ctx.moveTo(px(seg[0][0], seg[0][1]), py(seg[0][0], seg[0][1], zMid));
      ctx.lineTo(px(seg[1][0], seg[1][1]), py(seg[1][0], seg[1][1], zMid));
    });
    ctx.strokeStyle = `rgba(${INK},${(0.2 * drawn).toFixed(3)})`;
    ctx.stroke();
    poly(B.split, zMid, false);
    ctx.strokeStyle = `rgba(${INK},0.55)`;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    B.vias.forEach((v) => ring(v[0], v[1], zMid, 0.75));
    ctx.fillStyle = `rgba(${BG},1)`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${INK},0.35)`;
    ctx.stroke();
    planeText('GND', -33, 14, zMid, 2.2, 0.32);
    planeText('3V3', 20, 1, zMid, 2.2, 0.32);

    /* ----- Capa superior ----- */
    boardBase(zTop, 0.95);

    // Líneas guía de la vista explosionada y fustes de las vías
    if (gap > 0.4) {
      ctx.beginPath();
      [[-BW / 2 + 0.6, -BH / 2 + 0.6], [BW / 2 - 0.6, -BH / 2 + 0.6], [BW / 2 - 0.6, BH / 2 - 0.6], [-BW / 2 + 0.6, BH / 2 - 0.6]].forEach(([x, y]) => {
        ctx.moveTo(px(x, y), py(x, y, zBot));
        ctx.lineTo(px(x, y), py(x, y, zTop));
      });
      ctx.strokeStyle = `rgba(${INK},0.3)`;
      ctx.setLineDash([2, 5]);
      ctx.stroke();
      ctx.beginPath();
      B.vias.forEach((v) => {
        ctx.moveTo(px(v[0], v[1]), py(v[0], v[1], zBot));
        ctx.lineTo(px(v[0], v[1]), py(v[0], v[1], zTop));
      });
      ctx.strokeStyle = `rgba(${INK},0.26)`;
      ctx.setLineDash([1.5, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pulsos que bajan por las vías
      B.vias.forEach((v, i) => {
        const s = pulseVia[i];
        if (!s.on) return;
        const u = ((t * 0.001 + s.phase) % s.period) / s.period;
        if (u > 0.3) return;
        const z = zTop - (u / 0.3) * (zTop - zBot);
        ctx.fillStyle = RED;
        ctx.fillRect(px(v[0], v[1]) - 1.6, py(v[0], v[1], z) - 1.6, 3.2, 3.2);
      });
    }

    ctx.beginPath();
    B.top.forEach((tr) => trace(tr, zTop, drawn));
    ctx.strokeStyle = `rgba(${INK},0.88)`;
    ctx.lineWidth = small ? 0.9 : 1.15;
    ctx.stroke();

    // Almohadillas y vías
    ctx.fillStyle = `rgba(${INK},0.9)`;
    B.pads.forEach(([x, y, w, h]) => {
      poly([[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]], zTop, true);
      ctx.fill();
    });
    ctx.beginPath();
    B.vias.forEach((v) => ring(v[0], v[1], zTop, 0.5));
    ctx.fillStyle = `rgba(${BG},1)`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${INK},0.9)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    if (!small) B.silk.forEach((s) => planeText(s.text, s.x, s.y, zTop, s.size, s.alpha * drawn));
    drawSignals(B.top, pulseTop, zTop, t, 1);

    // Componentes, de lejos a cerca
    const compAlpha = ease((t - 900) / 1200);
    if (compAlpha > 0) {
      ctx.globalAlpha = compAlpha;
      B.comps
        .slice()
        .sort((a, b) => depth(b.x, b.y) - depth(a.x, a.y))
        .forEach((c) => drawComponent(c, zTop, t));
      ctx.globalAlpha = 1;
    }

    /* ----- Rótulos ----- */
    const la = ease((t - 2300) / 900);
    if (la > 0 && !small) {
      label('U1 · MICROCONTROLADOR 32 BIT', -2, 8, zTop + 1.3, 26, -92, la, true);
      label('U3 · RADIO 2,4 GHz + ANTENA', -31, 22.5, zTop, -18, -46, la);
      label('J2 · EXPANSIÓN', 31.6, -11, zTop + 3.6, 22, -30, la);
      label('L1 · SEÑAL', BW / 2, -BH / 2 + 3, zTop, 30, 26, la);
      label('L2 · PLANO GND / 3V3', BW / 2, -BH / 2 + 3, zMid, 30, 26, la);
      label('L3 · SEÑAL', BW / 2, -BH / 2 + 3, zBot, 30, 26, la);
    }
  }

  function onPointer(e) {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }

  resize();
  window.addEventListener('resize', resize);
  if (!reduceMotion) window.addEventListener('pointermove', onPointer, { passive: true });
  const stop = visibleLoop(canvas, draw);
  return stop;
}

/** Datos reales del modelo generado, para la leyenda. */
export const pcbInfo = (() => {
  const b = buildBoard();
  return { traces: b.top.length + b.bottom.length, vias: b.vias.length, parts: b.comps.length };
})();
