/**
 * Portada en chino — inteligencia artificial.
 * Red neuronal en 3D: capas de neuronas unidas por conexiones. Cada pocos
 * segundos entra una señal por la primera capa y se propaga hasta la salida;
 * las neuronas se encienden al recibirla y una de las salidas queda en rojo.
 */
import { scene, camera, ink, red, bg, easeIn, clamp01, TAU, path } from '../kit.js';
import { rng } from '../../core/dom.js';

const LAYERS = [[3, 3], [4, 4], [4, 4], [3, 3], [1, 3]]; // [filas, columnas] por capa
const GAP = 1.55;      // separación entre capas
const CYCLE = 4.2;     // segundos por inferencia
const TRAVEL = 0.62;   // segundos de capa a capa

export function create(canvas) {
  const R = rng(1986); // año de la retropropagación
  const nodes = [];
  LAYERS.forEach(([rows, cols], layer) => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        nodes.push({
          layer,
          pos: [(layer - (LAYERS.length - 1) / 2) * GAP, (r - (rows - 1) / 2) * 0.72, (c - (cols - 1) / 2) * 0.72],
          gain: 0.35 + R() * 0.65,
        });
      }
    }
  });
  const links = [];
  nodes.forEach((a, i) => {
    nodes.forEach((b, j) => {
      if (b.layer === a.layer + 1 && R() < 0.42) links.push({ a: i, b: j, w: R(), lag: R() * 0.25 });
    });
  });
  const outputs = nodes.filter((n) => n.layer === LAYERS.length - 1);

  return scene(canvas, (ctx, W, H, t, ptr) => {
    const small = W < 640;
    const grow = easeIn(t, 0.1, 2.4);
    const unit = Math.min(W, H) * (small ? 0.125 : 0.12);
    const proj = camera({
      yaw: 0.62 + ptr.x * 0.35 + Math.sin(t * 0.14) * 0.16,
      pitch: 0.2 + ptr.y * 0.14,
      scale: unit,
      cx: W * (small ? 0.5 : 0.53),
      cy: H * 0.5,
      dist: 12,
    });

    const run = Math.floor(t / CYCLE);
    const clock = t % CYCLE;
    const winner = outputs[(run * 7 + 1) % outputs.length];
    // Activación de una neurona: pico cuando le llega la señal, luego decae
    const pulse = (layer) => {
      const dt = clock - layer * TRAVEL;
      return dt < 0 ? 0 : Math.exp(-dt * 2.2);
    };
    const active = (n) => pulse(n.layer) * (n.layer === LAYERS.length - 1 ? (n === winner ? 1 : 0.25) : n.gain);

    const pts = nodes.map((n) => proj(...n.pos));

    /* --- Conexiones --- */
    const shownLinks = Math.floor(links.length * grow);
    for (let i = 0; i < shownLinks; i++) {
      const l = links[i];
      const a = pts[l.a], b = pts[l.b];
      path(ctx, [a, b]);
      ctx.strokeStyle = ink(0.05 + l.w * 0.13);
      ctx.lineWidth = 1;
      ctx.stroke();

      // Señal viajando por la conexión
      const u = (clock - nodes[l.a].layer * TRAVEL - l.lag) / TRAVEL;
      if (u > 0 && u < 1 && l.w > 0.3) {
        const toWinner = nodes[l.b] === winner;
        const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u;
        const tail = Math.max(0, u - 0.16);
        path(ctx, [[a[0] + (b[0] - a[0]) * tail, a[1] + (b[1] - a[1]) * tail], [x, y]]);
        ctx.strokeStyle = toWinner ? red(0.85) : ink(0.3 + l.w * 0.5);
        ctx.lineWidth = toWinner ? 1.8 : 1.2;
        ctx.stroke();
      }
    }

    /* --- Neuronas (de lejos a cerca) --- */
    const order = nodes.map((n, i) => i).sort((p, q) => pts[q][2] - pts[p][2]);
    for (const i of order) {
      const n = nodes[i];
      const [x, y, d] = pts[i];
      const near = clamp01(0.5 - d / 6);
      const a = active(n);
      const isOut = n.layer === LAYERS.length - 1;
      const r = (isOut ? 7 : 4.2) * (0.7 + near * 0.7) * (small ? 0.8 : 1) * grow;
      const hot = isOut && n === winner;

      if (a > 0.05) {
        ctx.beginPath();
        ctx.arc(x, y, r + 3 + a * 9, 0, TAU);
        ctx.strokeStyle = hot ? red(a * 0.5) : ink(a * 0.22);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = hot ? red(0.25 + a * 0.75) : a > 0.05 ? ink(0.12 + a * 0.85) : bg(1);
      ctx.fill();
      ctx.strokeStyle = hot ? red(0.9) : ink(0.35 + near * 0.4);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    /* --- Marco de cada capa --- */
    LAYERS.forEach(([rows, cols], layer) => {
      const x = (layer - (LAYERS.length - 1) / 2) * GAP;
      const hy = (rows - 1) * 0.36 + 0.4, hz = (cols - 1) * 0.36 + 0.4;
      path(ctx, [proj(x, -hy, -hz), proj(x, hy, -hz), proj(x, hy, hz), proj(x, -hy, hz)], true);
      ctx.strokeStyle = ink((0.07 + pulse(layer) * 0.2) * grow);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  });
}
