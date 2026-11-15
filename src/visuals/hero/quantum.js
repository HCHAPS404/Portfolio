/**
 * Portada en ruso — computación cuántica.
 * Esfera de Bloch con el vector de estado de un cúbit en precesión (deja su
 * rastro sobre la superficie), y debajo un circuito cuántico de cuatro cúbits:
 * puertas, entrelazamientos y pulsos que lo recorren. A la derecha, las
 * probabilidades de medida oscilan como un histograma.
 */
import { scene, camera, ink, red, bg, easeIn, TAU, path } from '../kit.js';

// Circuito: columnas de puertas. [columna, cúbit, tipo, cúbit objetivo]
const GATES = [
  [0, 0, 'H'], [0, 2, 'H'], [1, 0, 'C', 1], [1, 3, 'X'], [2, 1, 'R'], [2, 2, 'C', 3],
  [3, 0, 'R'], [3, 1, 'C', 2], [4, 3, 'H'], [4, 0, 'X'], [5, 1, 'C', 0], [5, 2, 'R'],
  [6, 0, 'M'], [6, 1, 'M'], [6, 2, 'M'], [6, 3, 'M'],
];
const COLS = 7;
const QUBITS = 4;

export function create(canvas) {
  const trail = [];

  return scene(canvas, (ctx, W, H, t, ptr) => {
    const small = W < 640;
    const grow = easeIn(t, 0.1, 2);
    const R = Math.min(W, H) * (small ? 0.2 : 0.2);
    const cx = W * (small ? 0.6 : 0.52);
    const cy = H * (small ? 0.3 : 0.36);
    const proj = camera({
      yaw: 0.6 + t * 0.07 + ptr.x * 0.5,
      pitch: 0.34 + ptr.y * 0.2,
      scale: R,
      cx,
      cy,
    });

    /* ---------- Esfera de Bloch ---------- */
    const circle = (fn, alpha, dash) => {
      const front = [], back = [];
      let prev = null;
      ctx.lineWidth = 1;
      for (let k = 0; k <= 72; k++) {
        const p = proj(...fn((k / 72) * TAU));
        if (prev) (p[2] + prev[2] > 0 ? back : front).push([prev, p]);
        prev = p;
      }
      for (const [list, a, d] of [[back, alpha * 0.32, [2, 4]], [front, alpha, dash]]) {
        ctx.beginPath();
        for (const [p, q] of list) {
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(q[0], q[1]);
        }
        ctx.setLineDash(d ?? []);
        ctx.strokeStyle = ink(a * grow);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };

    // Meridianos y paralelos
    for (let m = 0; m < 6; m++) {
      const a = (m / 6) * Math.PI;
      circle((u) => [Math.cos(u) * Math.cos(a), Math.sin(u), Math.cos(u) * Math.sin(a)], 0.2);
    }
    for (const lat of [-0.66, -0.33, 0.33, 0.66]) {
      const r = Math.sqrt(1 - lat * lat);
      circle((u) => [Math.cos(u) * r, lat, Math.sin(u) * r], 0.2);
    }
    circle((u) => [Math.cos(u), 0, Math.sin(u)], 0.75); // ecuador

    // Ejes
    const axes = [[[1.28, 0, 0], [-1.28, 0, 0]], [[0, 1.34, 0], [0, -1.34, 0]], [[0, 0, 1.28], [0, 0, -1.28]]];
    ctx.lineWidth = 1;
    for (const [a, b] of axes) {
      const pa = proj(...a), pb = proj(...b);
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.strokeStyle = ink(0.4 * grow);
      ctx.setLineDash([1, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const p of [pa, pb]) {
        ctx.fillStyle = ink(0.8 * grow);
        ctx.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3);
      }
    }
    // Polos |0⟩ y |1⟩
    for (const y of [1, -1]) {
      const p = proj(0, y, 0);
      ctx.beginPath();
      ctx.arc(p[0], p[1], 4, 0, TAU);
      ctx.fillStyle = bg(1);
      ctx.fill();
      ctx.strokeStyle = ink(0.9 * grow);
      ctx.stroke();
    }

    // Vector de estado: precesión + nutación
    const theta = 0.95 + Math.sin(t * 0.43) * 0.62 + Math.sin(t * 1.9) * 0.08;
    const phi = t * 1.15;
    const state = [Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi)];
    trail.push(state);
    if (trail.length > 150) trail.shift();

    for (let i = 1; i < trail.length; i++) {
      const a = proj(...trail[i - 1]), b = proj(...trail[i]);
      const life = i / trail.length;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.strokeStyle = red(life * (a[2] > 0 ? 0.3 : 0.9) * grow);
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    const tip = proj(...state);
    const origin = proj(0, 0, 0);
    ctx.beginPath();
    ctx.moveTo(origin[0], origin[1]);
    ctx.lineTo(tip[0], tip[1]);
    ctx.strokeStyle = red(grow);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tip[0], tip[1], 5, 0, TAU);
    ctx.fillStyle = red(grow);
    ctx.fill();
    // Proyección del vector sobre el ecuador y su vertical
    const foot = proj(state[0], 0, state[2]);
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = ink(0.45 * grow);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(origin[0], origin[1]);
    ctx.lineTo(foot[0], foot[1]);
    ctx.lineTo(tip[0], tip[1]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* ---------- Circuito cuántico ---------- */
    const x0 = W * (small ? 0.12 : 0.1);
    const x1 = W * (small ? 0.96 : 0.74);
    const top = H * (small ? 0.58 : 0.66);
    const gapY = Math.min(H * 0.062, 44);
    const colX = (c) => x0 + ((c + 0.75) / (COLS + 0.4)) * (x1 - x0);
    const rowY = (q) => top + q * gapY;
    const box = Math.min(gapY * 0.56, 22);
    const wire = easeIn(t, 0.6, 1.8);

    ctx.lineWidth = 1;
    for (let q = 0; q < QUBITS; q++) {
      ctx.beginPath();
      ctx.moveTo(x0, rowY(q));
      ctx.lineTo(x0 + (x1 - x0) * wire, rowY(q));
      ctx.strokeStyle = ink(0.45);
      ctx.stroke();
      ctx.fillStyle = ink(0.85 * wire);
      ctx.fillRect(x0 - 3, rowY(q) - 3, 6, 6);
    }

    const sweep = (t * 0.16) % 1.15; // frente de ejecución
    for (const [c, q, type, target] of GATES) {
      const x = colX(c), y = rowY(q);
      if ((x - x0) / (x1 - x0) > wire) continue;
      const hot = Math.abs((x - x0) / (x1 - x0) - sweep) < 0.05;
      const line = hot ? red(1) : ink(0.9);
      ctx.strokeStyle = line;
      ctx.fillStyle = bg(1);
      ctx.lineWidth = hot ? 1.6 : 1.1;

      if (type === 'C') {
        const y2 = rowY(target);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 3.6, 0, TAU);
        ctx.fillStyle = line;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y2, box * 0.42, 0, TAU);
        ctx.fillStyle = bg(1);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - box * 0.42, y2);
        ctx.lineTo(x + box * 0.42, y2);
        ctx.moveTo(x, y2 - box * 0.42);
        ctx.lineTo(x, y2 + box * 0.42);
        ctx.stroke();
        continue;
      }

      ctx.fillRect(x - box / 2, y - box / 2, box, box);
      ctx.strokeRect(x - box / 2, y - box / 2, box, box);
      const s = box * 0.26;
      ctx.beginPath();
      if (type === 'H') {
        ctx.moveTo(x - s, y - s); ctx.lineTo(x - s, y + s);
        ctx.moveTo(x + s, y - s); ctx.lineTo(x + s, y + s);
        ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
      } else if (type === 'X') {
        ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s);
        ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s);
      } else if (type === 'R') {
        // Puerta de rotación: arco con una aguja que gira
        ctx.arc(x, y, s, 0, TAU);
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(t * 1.4 + c) * s, y + Math.sin(t * 1.4 + c) * s);
      } else {
        // Medida: semicírculo con aguja
        ctx.arc(x, y + s * 0.5, s, Math.PI, 0);
        ctx.moveTo(x, y + s * 0.5);
        ctx.lineTo(x + Math.cos(-1 + Math.sin(t * 2 + q) * 0.5) * s * 1.2, y + s * 0.5 + Math.sin(-1 + Math.sin(t * 2 + q) * 0.5) * s * 1.2);
      }
      ctx.stroke();
    }

    // Pulsos que avanzan por cada cable
    for (let q = 0; q < QUBITS; q++) {
      const u = (t * 0.16 + q * 0.07) % 1.15;
      if (u > wire || u > 1) continue;
      const x = x0 + (x1 - x0) * u;
      ctx.fillStyle = red(0.95);
      ctx.fillRect(x - 3, rowY(q) - 3, 6, 6);
      ctx.fillStyle = red(0.35);
      ctx.fillRect(x - 16, rowY(q) - 1, 12, 2);
    }

    /* ---------- Histograma de probabilidades ---------- */
    if (!small) {
      const bx = W * 0.8, bw = W * 0.14, by = rowY(QUBITS - 1) + box / 2, bh = gapY * (QUBITS - 1) + box;
      const bars = 8;
      let total = 0;
      const amps = [];
      for (let k = 0; k < bars; k++) {
        const v = Math.pow(0.5 + 0.5 * Math.sin(t * (0.6 + k * 0.13) + k * 1.7), 2) + 0.04;
        amps.push(v);
        total += v;
      }
      const maxIdx = amps.indexOf(Math.max(...amps));
      ctx.strokeStyle = ink(0.4);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + bw, by);
      ctx.stroke();
      amps.forEach((v, k) => {
        const h = (v / total) * bh * 2.6 * grow;
        const w = (bw / bars) * 0.62;
        const x = bx + (k + 0.19) * (bw / bars);
        ctx.fillStyle = k === maxIdx ? red(0.95) : ink(0.75);
        ctx.fillRect(x, by - h, w, h);
      });
    }
  });
}
