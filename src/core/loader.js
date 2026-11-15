/**
 * Pantalla de carga. Aparece al abrir el sitio y al cambiar de idioma.
 *
 * Cada vez se elige una de diez animaciones (nunca la misma dos veces seguidas).
 * Todas tienen dos etapas: en la primera la figura se construye al ritmo del
 * progreso; en la segunda se resuelve (se pliega, estalla o se expande) y la
 * cortina se levanta. Ninguna repite un motivo de las portadas.
 */
import { fitCanvas, reduceMotion, rng } from './dom.js';
import { ink, red, clamp01, TAU } from '../visuals/kit.js';
import { Scene3D, orbit, chain, translate, rotX, rotY, rotZ, ngon } from '../visuals/kit3d.js';

const LAST_KEY = 'portfolio-loader';
const ease = (v) => 1 - Math.pow(1 - clamp01(v), 3);
const easeIo = (v) => (v < 0.5 ? 4 * v ** 3 : 1 - Math.pow(-2 * v + 2, 3) / 2);

/** Curva de Hilbert: posición (x, y) del paso `d` en una rejilla de lado `n`. */
function hilbert(n, d) {
  let x = 0, y = 0, t = d;
  for (let s = 1; s < n; s *= 2) {
    const rx = 1 & (t / 2), ry = 1 & (t ^ rx);
    if (ry === 0) {
      if (rx === 1) (x = s - 1 - x), (y = s - 1 - y);
      [x, y] = [y, x];
    }
    x += s * rx;
    y += s * ry;
    t = Math.floor(t / 4);
  }
  return [x, y];
}

/** Puntos que dibujan un texto, muestreados de un lienzo auxiliar. */
function textPoints(text, step = 5) {
  const c = document.createElement('canvas');
  c.width = 420;
  c.height = 150;
  const g = c.getContext('2d');
  g.font = '700 140px "Space Grotesk", "Arial Black", Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  // Emblema: hexágono con núcleo y tres barras de señal
  g.lineWidth = 15;
  g.beginPath();
  for (let k = 0; k < 6; k++) g.lineTo(120 + Math.cos((k / 6) * Math.PI * 2) * 58, 75 + Math.sin((k / 6) * Math.PI * 2) * 58);
  g.closePath();
  g.stroke();
  g.fillRect(104, 59, 32, 32);
  for (let k = 0; k < 3; k++) g.fillRect(215 + k * 46, 105 - k * 30, 28, 30 + k * 30);
  void text;
  const { data } = g.getImageData(0, 0, 420, 150);
  const pts = [];
  for (let y = 0; y < 150; y += step) {
    for (let x = 0; x < 420; x += step) {
      if (data[(y * 420 + x) * 4 + 3] > 128) pts.push([(x - 210) / 210, (y - 75) / 210]);
    }
  }
  return pts;
}

/**
 * Marco común de todas las variantes: corona segmentada que marca el progreso,
 * aro graduado que gira, ejes con reglas, escuadras e indicador de etapa.
 */
function drawFrame(ctx, { cx, cy, S, p, o, t }, W, H) {
  const fade = 1 - ease(o);
  const R = S * 1.52 * (1 + easeIo(o) * 0.5);
  ctx.lineWidth = 1;
  // Ejes hasta los bordes, con marcas
  ctx.strokeStyle = ink(0.09 * fade);
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(cx - R - 14, cy);
  ctx.moveTo(cx + R + 14, cy);
  ctx.lineTo(W, cy);
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, cy - R - 14);
  ctx.moveTo(cx, cy + R + 14);
  ctx.lineTo(cx, H);
  ctx.stroke();
  ctx.strokeStyle = ink(0.22 * fade);
  ctx.beginPath();
  for (let x = cx % 40; x < W; x += 40) {
    if (Math.abs(x - cx) < R + 14) continue;
    ctx.moveTo(x, cy - 4);
    ctx.lineTo(x, cy + 4);
  }
  ctx.stroke();
  // Corona de 72 segmentos: se enciende con el progreso
  const SEG = 72;
  for (let k = 0; k < SEG; k++) {
    const a0 = -Math.PI / 2 + (k / SEG) * TAU + 0.012, a1 = -Math.PI / 2 + ((k + 1) / SEG) * TAU - 0.012;
    const on = k / SEG < p;
    ctx.beginPath();
    ctx.arc(cx, cy, R, a0, a1);
    ctx.strokeStyle = on ? (k === Math.floor(p * SEG) - 1 && o === 0 ? red(1) : ink(0.85 * fade)) : ink(0.14 * fade);
    ctx.lineWidth = on ? 3 : 2;
    ctx.stroke();
  }
  // Aro graduado interior que gira en sentido contrario
  ctx.lineWidth = 1;
  ctx.strokeStyle = ink(0.28 * fade);
  ctx.beginPath();
  for (let k = 0; k < 120; k++) {
    const a = (k / 120) * TAU - t * 0.25;
    const len = k % 10 === 0 ? 9 : k % 5 === 0 ? 6 : 3;
    ctx.moveTo(cx + Math.cos(a) * (R - 9), cy + Math.sin(a) * (R - 9));
    ctx.lineTo(cx + Math.cos(a) * (R - 9 - len), cy + Math.sin(a) * (R - 9 - len));
  }
  ctx.stroke();
  // Dos marcadores que orbitan por fuera
  for (const [speed, off] of [[0.9, 0], [-0.6, 2]]) {
    const a = t * speed + off;
    const x = cx + Math.cos(a) * (R + 12), y = cy + Math.sin(a) * (R + 12);
    ctx.fillStyle = off ? ink(0.8 * fade) : red(fade);
    ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
  }
  // Escuadras
  const Q = R + 30, L = 16;
  ctx.strokeStyle = ink(0.5 * fade);
  ctx.beginPath();
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    ctx.moveTo(cx + sx * Q, cy + sy * (Q - L));
    ctx.lineTo(cx + sx * Q, cy + sy * Q);
    ctx.lineTo(cx + sx * (Q - L), cy + sy * Q);
  }
  ctx.stroke();
  // Indicador de etapa: dos bloques bajo la figura
  for (let k = 0; k < 2; k++) {
    const active = k === 0 ? o === 0 : o > 0;
    const done = k === 0 && o > 0;
    ctx.fillStyle = active ? red(1) : done ? ink(0.85) : ink(0.2);
    ctx.fillRect(cx - 21 + k * 24, cy + Q + 14, 18, 4);
  }
}

/**
 * Las diez animaciones. Cada una devuelve `draw(ctx, f)` con
 * f = { cx, cy, S (radio útil), p (progreso 0–1), o (salida 0–1), t (segundos) }.
 */
const VARIANTS = [
  /* 0 — Nudo de Lissajous en 3D: la curva se traza en el espacio y proyecta su sombra en tres planos */
  function lissajous() {
    const pt = (a) => [Math.sin(3 * a), Math.sin(2 * a + 0.6), Math.cos(5 * a)];
    return (ctx, { cx, cy, S, p, o, t }) => {
      const k = easeIo(o);
      const cam = orbit({ yaw: t * 0.5 + k * 2, pitch: 0.4, scale: S * 0.62 * (1 + k * 2.4), cx, cy, dist: 7 });
      const sc = new Scene3D();
      const fade = 1 - k;
      // Caja de referencia y sombras sobre el suelo y dos paredes
      const B = 1.25;
      for (const s of [-1, 1]) {
        sc.polyline([[-B, s * B, -B], [B, s * B, -B], [B, s * B, B], [-B, s * B, B]], { a: 0.16 * fade }, true);
        for (const q of [-1, 1]) sc.line([s * B, -B, q * B], [s * B, B, q * B], { a: 0.16 * fade });
      }
      const end = ease(p) * TAU;
      const N = Math.max(2, Math.floor((end / TAU) * 360));
      let prev = pt(0);
      for (let i = 1; i <= N; i++) {
        const cur = pt((i / 360) * TAU);
        sc.line(prev, cur, { a: 0.95 * fade, lw: 1.8 });
        if (i % 2 === 0) {
          sc.line([prev[0], -B, prev[2]], [cur[0], -B, cur[2]], { a: 0.22 * fade });
          sc.line([prev[0], prev[1], B], [cur[0], cur[1], B], { a: 0.14 * fade });
        }
        prev = cur;
      }
      sc.dot(prev, { red: true, a: 1, r: 4.5, round: true, bias: -1 });
      sc.line(prev, [prev[0], -B, prev[2]], { red: true, a: 0.5 * fade, dash: [2, 4] });
      sc.render(ctx, cam);
    };
  },

  /* 1 — Radar: el barrido descubre ecos; al final los anillos se abren */
  function radar() {
    const R = rng(11);
    const blips = Array.from({ length: 14 }, () => ({ a: R() * TAU, r: 0.2 + R() * 0.75 }));
    return (ctx, { cx, cy, S, p, o, t }) => {
      const open = 1 + easeIo(o) * 3;
      const fade = 1 - ease(o);
      ctx.lineWidth = 1;
      for (let k = 1; k <= 4; k++) {
        ctx.beginPath();
        ctx.arc(cx, cy, ((S * k) / 4) * open, 0, TAU);
        ctx.strokeStyle = ink((k === 4 ? 0.5 : 0.16) * fade);
        ctx.stroke();
      }
      for (let k = 0; k < 72; k++) {
        const a = (k / 72) * TAU, len = k % 6 ? 5 : 11;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * S * open, cy + Math.sin(a) * S * open);
        ctx.lineTo(cx + Math.cos(a) * (S * open + len), cy + Math.sin(a) * (S * open + len));
        ctx.strokeStyle = ink(0.3 * fade);
        ctx.stroke();
      }
      const sweep = t * 2.6;
      for (let k = 0; k < 40; k++) {
        const a = sweep - k * 0.02;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * S * open, cy + Math.sin(a) * S * open);
        ctx.strokeStyle = red((1 - k / 40) * 0.5 * fade);
        ctx.stroke();
      }
      blips.slice(0, Math.ceil(p * blips.length)).forEach((b) => {
        const since = (((sweep - b.a) % TAU) + TAU) % TAU; // ángulo desde que pasó el barrido
        const glow = Math.exp(-since * 0.9);
        const x = cx + Math.cos(b.a) * b.r * S * open, y = cy + Math.sin(b.a) * b.r * S * open;
        ctx.fillStyle = ink((0.25 + glow * 0.75) * fade);
        ctx.fillRect(x - 3, y - 3, 6, 6);
        ctx.strokeStyle = ink(glow * 0.5 * fade);
        ctx.strokeRect(x - 7, y - 7, 14, 14);
      });
    };
  },

  /* 2 — Instrumento de aguja: la escala se llena; al final la aguja da la vuelta completa */
  function gauge() {
    const A0 = Math.PI * 0.8, SPAN = Math.PI * 1.4;
    return (ctx, { cx, cy, S, p, o, t }) => {
      const fade = 1 - ease(o);
      const value = ease(p) + Math.sin(t * 9) * 0.006 * (1 - o);
      for (let k = 0; k <= 50; k++) {
        const a = A0 + (k / 50) * SPAN;
        const major = k % 5 === 0;
        const lit = k / 50 <= value;
        const r0 = S * (major ? 0.8 : 0.87) - ease(o) * S * 0.3, r1 = S + ease(o) * S * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.strokeStyle = lit ? ink((major ? 0.95 : 0.6) * fade) : ink(0.18 * fade);
        ctx.lineWidth = major ? 2 : 1;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, S * 0.72, A0, A0 + SPAN * value);
      ctx.strokeStyle = red(0.9 * fade);
      ctx.lineWidth = 3;
      ctx.stroke();
      const a = A0 + SPAN * value + easeIo(o) * TAU;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(a) * S * 0.14, cy - Math.sin(a) * S * 0.14);
      ctx.lineTo(cx + Math.cos(a) * S * 0.92, cy + Math.sin(a) * S * 0.92);
      ctx.strokeStyle = red(1);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, S * 0.06, 0, TAU);
      ctx.fillStyle = ink(0.95);
      ctx.fill();
    };
  },

  /* 3 — Espectrograma en cascada: filas de barras que retroceden en profundidad; al final se aplanan */
  function spectrum() {
    const N = 26, ROWS = 9;
    const R = rng(23);
    const seeds = Array.from({ length: N }, () => [R() * TAU, 1.2 + R() * 3.4]);
    return (ctx, { cx, cy, S, p, o, t }) => {
      const k = easeIo(o);
      const cam = orbit({ yaw: -0.55 + Math.sin(t * 0.4) * 0.08, pitch: 0.5, scale: S * 0.6, cx, cy: cy + S * 0.25, dist: 9 });
      const sc = new Scene3D();
      const lit = ease(p) * ROWS;
      for (let r = 0; r < ROWS; r++) {
        const on = r < lit;
        const z = (r - (ROWS - 1) / 2) * 0.36;
        const tt = t - r * 0.16; // cada fila es un instante anterior
        for (let i = 0; i < N; i++) {
          const u = i / (N - 1);
          const env = Math.exp(-((u - 0.36) ** 2) * 7) * 0.8 + 0.2;
          const h = on ? Math.max(0.02, env * (0.35 + 0.65 * Math.abs(Math.sin(tt * seeds[i][1] + seeds[i][0]))) * 1.25 * (1 - k)) : 0.015;
          const x = (u - 0.5) * 3.3;
          const head = on && r === Math.floor(lit);
          sc.box(translate(x, 0, z), [-0.045, 0.045], [0, h], [-0.12, 0.12], { a: on ? 0.75 : 0.2, tone: 0.9 + h, red: head, glow: head ? 0.7 : 0 });
        }
      }
      sc.polyline([[-1.9, 0, -1.9], [1.9, 0, -1.9], [1.9, 0, 1.9], [-1.9, 0, 1.9]], { a: 0.3, layer: -1 }, true);
      if (o > 0) sc.line([-1.9 - k * 5, 0.01, 0], [1.9 + k * 5, 0.01, 0], { red: true, a: 1, lw: 2 });
      sc.render(ctx, cam);
    };
  },

  /* 4 — Panal en relieve: prismas hexagonales que se levantan en espiral; al final se hunden */
  function honeycomb() {
    const cells = [[0, 0]];
    const dirs = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
    for (let ring = 1; ring <= 4; ring++) {
      let q = 0, r = -ring;
      for (let side = 0; side < 6; side++) {
        for (let k = 0; k < ring; k++) {
          cells.push([q, r]);
          q += dirs[side][0];
          r += dirs[side][1];
        }
      }
    }
    const R = rng(61);
    const tall = cells.map((c, i) => 0.25 + R() * 0.9 + (i < 7 ? 0.5 : 0));
    const hex = ngon(6, 0.2);
    return (ctx, { cx, cy, S, p, o, t }) => {
      const cam = orbit({ yaw: t * 0.25, pitch: 0.62, scale: S * 0.52, cx, cy: cy + S * 0.12, dist: 9 });
      const sc = new Scene3D();
      const lit = ease(p) * cells.length;
      cells.forEach(([q, r], i) => {
        const x = 0.36 * 1.5 * q * 0.62, z = 0.36 * Math.sqrt(3) * (r + q / 2) * 0.62;
        const rise = ease(lit - i) * (1 - ease(o * 1.7 - (i / cells.length) * 0.7));
        const h = 0.03 + tall[i] * rise;
        const newest = i < lit && i >= lit - 1.5 && o === 0;
        const T = chain(translate(x, 0, z), rotX(-Math.PI / 2));
        sc.extrude(T, hex, 0, h, { a: rise > 0.05 ? 0.85 : 0.22, tone: 0.8 + rise * 0.7, red: newest, glow: newest ? 0.8 : 0 }, { a: rise > 0.05 ? 0.4 : 0.12 });
      });
      sc.render(ctx, cam);
    };
  },

  /* 5 — Curva de Hilbert: una sola línea llena el cuadrado; al final el cuadrado gira y crece */
  function hilbertCurve() {
    const N = 32;
    const pts = Array.from({ length: N * N }, (_, d) => hilbert(N, d));
    return (ctx, { cx, cy, S, p, o }) => {
      const k = easeIo(o);
      const side = S * 1.7 * (1 + k * 5);
      const cell = side / (N - 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(k * 0.8);
      const count = Math.max(2, Math.floor(ease(p) * pts.length));
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const x = -side / 2 + pts[i][0] * cell, y = -side / 2 + pts[i][1] * cell;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.strokeStyle = ink(0.85 * (1 - k * 0.8));
      ctx.lineWidth = 1.3;
      ctx.lineJoin = 'miter';
      ctx.stroke();
      const head = pts[count - 1];
      ctx.fillStyle = red(1 - k);
      ctx.fillRect(-side / 2 + head[0] * cell - 4, -side / 2 + head[1] * cell - 4, 8, 8);
      ctx.strokeStyle = ink(0.25 * (1 - k));
      ctx.strokeRect(-side / 2 - 10, -side / 2 - 10, side + 20, side + 20);
      ctx.restore();
    };
  },

  /* 6 — Giroscopio: tres aros en cardán sobre ejes distintos que se alinean; al final colapsan */
  function gyro() {
    const ring = (r, n = 56) => Array.from({ length: n }, (_, k) => [Math.cos((k / n) * TAU) * r, 0, Math.sin((k / n) * TAU) * r]);
    return (ctx, { cx, cy, S, p, o, t }) => {
      const lock = ease(p);
      const k = easeIo(o);
      const cam = orbit({ yaw: 0.5 + t * 0.2, pitch: 0.35, scale: S * 0.78 * (1 - k * 0.92), cx, cy, dist: 8 });
      const sc = new Scene3D();
      const free = 1 - lock;
      const T1 = rotZ(free * (1.2 + t * 1.3));
      const T2 = chain(T1, rotX(free * (2.1 + t * 1.7) + lock * Math.PI / 2));
      const T3 = chain(T2, rotZ(free * (0.7 + t * 2.3) + lock * Math.PI / 2));
      [[T1, 1.25, false], [T2, 1.02, false], [T3, 0.8, true]].forEach(([T, r, red], i) => {
        // Cada aro es una banda con espesor
        const a = ring(r).map(T), b = ring(r - 0.09).map(T);
        for (let s = 0; s < a.length; s++) {
          const s2 = (s + 1) % a.length;
          sc.face([a[s], a[s2], b[s2], b[s]], null, { both: true, a: 0.5, tone: 1.2 + i * 0.3, red, glow: red ? 0.75 : 0 });
        }
        // Pivotes
        for (const side of [-1, 1]) sc.dot(T([side * r, 0, 0]), { a: 0.95, r: 3 });
      });
      // Rotor
      const TR = chain(T3, rotY(t * 9));
      sc.lathe(TR, [[0.04, -0.6], [0.04, -0.12], [0.5, -0.08], [0.5, 0.08], [0.04, 0.12], [0.04, 0.6]], 16, { a: 0.85, tone: 1.4 });
      sc.line(TR([0.5, 0, 0]), TR([0.2, 0, 0]), { red: true, a: 1, lw: 2, bias: -0.5 });
      // Base
      sc.polyline(ring(1.45, 40).map(([x, , z]) => [x, -1.5, z]), { a: 0.3 * (1 - k), dash: [3, 5] }, true);
      sc.line([0, -1.5, 0], [0, -1.25, 0], { a: 0.5 * (1 - k) });
      sc.render(ctx, cam);
      if (o > 0) {
        const core = S * 0.05 * (1 + k * 3);
        ctx.fillStyle = red(1);
        ctx.fillRect(cx - core, cy - core, core * 2, core * 2);
      }
    };
  },

  /* 7 — Enjambre: partículas dispersas que forman un emblema; al final estallan */
  function swarm() {
    const R = rng(37);
    const targets = textPoints('HCS');
    const parts = targets.map(([tx, ty]) => {
      const a = R() * TAU, d = 1.2 + R() * 2.2;
      return { tx, ty, sx: Math.cos(a) * d, sy: Math.sin(a) * d, delay: R() * 0.45, hot: R() < 0.06, spin: (R() - 0.5) * 3 };
    });
    return (ctx, { cx, cy, S, p, o }) => {
      const scale = S * 1.55;
      const burst = easeIo(o);
      for (const q of parts) {
        const k = ease((p - q.delay) / (1 - q.delay * 0.9));
        const a = (1 - k) * q.spin; // llegan describiendo un arco
        const dx = q.sx * (1 - k), dy = q.sy * (1 - k);
        let x = q.tx + dx * Math.cos(a) - dy * Math.sin(a);
        let y = q.ty + dx * Math.sin(a) + dy * Math.cos(a);
        x += q.sx * burst * 1.6;
        y += q.sy * burst * 1.6;
        const size = q.hot ? 4 : 2.6;
        ctx.fillStyle = q.hot ? red(1 - burst) : ink((0.25 + k * 0.7) * (1 - burst));
        ctx.fillRect(cx + x * scale - size / 2, cy + y * scale - size / 2, size, size);
      }
    };
  },

  /* 8 — Esfera de Fibonacci: los puntos se ordenan en espiral áurea sobre una esfera; al final se dispersa */
  function phyllotaxis() {
    const N = 520;
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));
    const pts = Array.from({ length: N }, (_, i) => {
      const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), a = i * GOLDEN;
      return [Math.cos(a) * r, y, Math.sin(a) * r];
    });
    return (ctx, { cx, cy, S, p, o, t }) => {
      const k = easeIo(o);
      const cam = orbit({ yaw: t * 0.45, pitch: 0.3, scale: S * 0.95, cx, cy, dist: 6 });
      const count = Math.floor(ease(p) * N);
      const spread = 1 + k * 3.5;
      // Meridianos y paralelos de guía
      ctx.lineWidth = 1;
      for (let m = 0; m < 6; m++) {
        ctx.beginPath();
        for (let s = 0; s <= 48; s++) {
          const a = (s / 48) * TAU, b = (m / 6) * Math.PI;
          const q = cam.project([Math.cos(a) * Math.cos(b) * 1.04, Math.sin(a) * 1.04, Math.cos(a) * Math.sin(b) * 1.04]);
          if (s) ctx.lineTo(q[0], q[1]);
          else ctx.moveTo(q[0], q[1]);
        }
        ctx.strokeStyle = ink(0.1 * (1 - k));
        ctx.stroke();
      }
      const items = [];
      for (let i = 0; i < count; i++) {
        const v = cam.view([pts[i][0] * spread, pts[i][1] * spread, pts[i][2] * spread]);
        items.push([v, i]);
      }
      items.sort((a, b) => b[0][2] - a[0][2]);
      for (const [v, i] of items) {
        const s = cam.screen(v);
        const near = clamp01(0.5 - v[2] * 0.5);
        const size = 1.2 + near * 3.2;
        ctx.fillStyle = i > count - 10 ? red(1 - k) : ink((0.18 + near * 0.8) * (1 - k));
        ctx.fillRect(s[0] - size / 2, s[1] - size / 2, size, size);
        // Enlace con el punto anterior de la espiral: dibuja el hilo que la recorre
        if (i > 0 && i > count - 60 && k === 0) {
          const q = cam.project(pts[i - 1]);
          ctx.beginPath();
          ctx.moveTo(s[0], s[1]);
          ctx.lineTo(q[0], q[1]);
          ctx.strokeStyle = red(0.5 * (1 - (count - i) / 60));
          ctx.stroke();
        }
      }
    };
  },

  /* 9 — Interferencia: dos emisores sobre una superficie; sus ondas se cruzan en relieve; al final se calma */
  function interference() {
    const N = 30;
    const SRC = [[-0.62, 0], [0.62, 0]];
    return (ctx, { cx, cy, S, p, o, t }) => {
      const reach = ease(p) * 3.2;
      const calm = 1 - easeIo(o);
      const cam = orbit({ yaw: 0.6 + Math.sin(t * 0.3) * 0.15, pitch: 0.7, scale: S * 0.6, cx, cy: cy + S * 0.05, dist: 9 });
      const sc = new Scene3D();
      const h = (x, z) => {
        let v = 0;
        for (const [sx, sz] of SRC) {
          const d = Math.hypot(x - sx, z - sz);
          if (d < reach) v += (Math.sin(d * 7.5 - t * 6) * 0.13 * calm) / (1 + d * 0.5);
        }
        return v;
      };
      const span = 3.6, d = span / N;
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const x = -span / 2 + i * d, z = -span / 2 + j * d;
          const pts = [[x, h(x, z), z], [x + d, h(x + d, z), z], [x + d, h(x + d, z + d), z + d], [x, h(x, z + d), z + d]];
          const crest = Math.max(0, pts[0][1]) * 6;
          sc.face(pts, [x, -9, z], { a: 0.1 + crest * 0.55, tone: 0.7 + crest * 1.6 });
        }
      }
      for (const [sx, sz] of SRC) {
        sc.lathe(translate(sx, h(sx, sz), sz), [[0.07, 0], [0.07, 0.3], [0.02, 0.36]], 8, { a: 0.9, red: true, glow: 0.8 });
        const u = (t * 0.9) % 1;
        sc.polyline(ngon(24, 0.12 + u * 0.4).map(([a, b]) => [sx + a, 0.34, sz + b]), { red: true, a: (1 - u) * calm, bias: -0.4 }, true);
      }
      sc.render(ctx, cam);
    };
  },

];

export const LOADER_COUNT = VARIANTS.length;

/** Elige la animación: `?loader=n` para probar una concreta; si no, al azar sin repetir la anterior. */
function pickVariant() {
  const forced = Number(new URLSearchParams(location.search).get('loader'));
  if (Number.isInteger(forced) && forced >= 1 && forced <= VARIANTS.length) return forced - 1;
  let last = -1;
  try {
    last = Number(localStorage.getItem(LAST_KEY) ?? -1);
  } catch {
    /* sin almacenamiento */
  }
  let index = Math.floor(Math.random() * VARIANTS.length);
  if (index === last) index = (index + 1 + Math.floor(Math.random() * (VARIANTS.length - 1))) % VARIANTS.length;
  try {
    localStorage.setItem(LAST_KEY, String(index));
  } catch {
    /* sin almacenamiento */
  }
  return index;
}

/**
 * Muestra la pantalla de carga de inmediato. Devuelve:
 * - `label(lines)`: textos (nombre, lema) en cuanto se conoce el idioma.
 * - `finish()`: promesa que se resuelve cuando la cortina empieza a levantarse.
 */
export function startLoader({ switching = false } = {}) {
  if (reduceMotion) return { label() {}, finish: () => Promise.resolve() };

  const el = document.createElement('div');
  el.className = 'boot';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <canvas class="boot__canvas"></canvas>
    <pre class="boot__log"></pre>
    <p class="boot__count"><span data-boot-count>000</span><i>%</i></p>
    <span class="boot__bar"><i></i></span>`;
  document.body.append(el);

  const canvas = el.querySelector('.boot__canvas');
  const log = el.querySelector('.boot__log');
  const count = el.querySelector('[data-boot-count]');
  const bar = el.querySelector('.boot__bar i');
  const index = pickVariant();
  el.dataset.variant = String(index + 1);
  const draw = VARIANTS[index]();

  let { ctx, width: W, height: H } = fitCanvas(canvas);
  const onResize = () => ({ ctx, width: W, height: H } = fitCanvas(canvas));
  window.addEventListener('resize', onResize);

  const BUILD = switching ? 1500 : 2500; // etapa 1 (ms)
  const RESOLVE = 760;                   // etapa 2 (ms)
  const t0 = performance.now();
  let lines = [];
  let ready = false;
  let outStart = 0;
  let resolveDone;
  const done = new Promise((r) => (resolveDone = r));

  const frame = (now) => {
    const elapsed = now - t0;
    // El progreso espera en 92 % hasta que el sitio esté listo de verdad
    const p = Math.min(elapsed / BUILD, ready ? 1 : 0.92);
    if (p >= 1 && !outStart) outStart = now;
    const o = outStart ? Math.min(1, (now - outStart) / RESOLVE) : 0;

    log.textContent = lines.slice(0, Math.ceil(Math.min(1, p * 2.5) * lines.length)).join('\n');
    count.textContent = String(Math.round(p * 100)).padStart(3, '0');
    bar.style.transform = `scaleX(${p})`;

    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'round';
    const small = W < 640;
    const f = {
      cx: W / 2,
      cy: H * (small ? 0.4 : 0.45),
      S: Math.min(W * (small ? 0.27 : 0.2), H * 0.22),
      p,
      o,
      t: elapsed / 1000,
    };
    drawFrame(ctx, f, W, H);
    draw(ctx, f);

    if (o < 1) {
      requestAnimationFrame(frame);
      return;
    }
    el.classList.add('is-done');
    window.removeEventListener('resize', onResize);
    resolveDone();
    setTimeout(() => el.remove(), 950);
  };
  requestAnimationFrame(frame);

  return {
    label(next) {
      lines = next;
    },
    finish() {
      ready = true;
      return done;
    },
  };
}
