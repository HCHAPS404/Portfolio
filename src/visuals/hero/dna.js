/**
 * Portada en inglés — bioingeniería.
 * Doble hélice de ADN que gira; una enzima (anillo rojo) la recorre y la abre a
 * su paso: las hebras se separan y los pares de bases se sueltan. Detrás corre
 * un electrocardiograma y alrededor flotan moléculas hexagonales.
 */
import { scene, camera, ink, red, bg, easeIn, TAU, path } from '../kit.js';
import { rng } from '../../core/dom.js';

const N = 92;          // pares de bases
const LENGTH = 6.4;    // largo de la hélice
const RADIUS = 0.82;
const TWIST = 0.36;    // giro por par
const GROOVE = 2.35;   // desfase entre hebras (surco mayor/menor)

export function create(canvas) {
  const R = rng(1953); // año de la doble hélice
  const kinds = Array.from({ length: N }, () => Math.floor(R() * 4));
  const molecules = Array.from({ length: 16 }, () => ({
    x: (R() - 0.5) * 7, y: (R() - 0.5) * 6, z: (R() - 0.5) * 4,
    r: 0.1 + R() * 0.14, sp: 0.2 + R() * 0.5, ph: R() * TAU, sides: R() > 0.5 ? 6 : 5,
  }));

  return scene(canvas, (ctx, W, H, t, ptr) => {
    const small = W < 640;
    const grow = easeIn(t, 0.1, 2.2);
    const unit = Math.min(W, H) * (small ? 0.16 : 0.135);
    const proj = camera({
      yaw: 0.5 + ptr.x * 0.35 + Math.sin(t * 0.13) * 0.12,
      pitch: 0.22 + ptr.y * 0.12,
      scale: unit,
      cx: W * 0.54,
      cy: H * 0.5,
      dist: 13,
    });
    // La hélice va inclinada sobre el plano de la pantalla
    const tilt = -0.62;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const place = (x, y, z) => proj(x * ct - y * st, x * st + y * ct, z);

    /* --- Electrocardiograma de fondo --- */
    const ecgY = H * 0.8;
    const beat = (u) => {
      const p = ((u % 1) + 1) % 1;
      if (p < 0.08) return Math.sin((p / 0.08) * Math.PI) * 0.12;
      if (p > 0.16 && p < 0.19) return -((p - 0.16) / 0.03) * 0.18;
      if (p >= 0.19 && p < 0.23) return -0.18 + ((p - 0.19) / 0.04) * 1.18;
      if (p >= 0.23 && p < 0.27) return 1 - ((p - 0.23) / 0.04) * 1.3;
      if (p >= 0.27 && p < 0.3) return -0.3 + ((p - 0.27) / 0.03) * 0.3;
      if (p > 0.4 && p < 0.56) return Math.sin(((p - 0.4) / 0.16) * Math.PI) * 0.22;
      return 0;
    };
    const head = (t * 0.22) % 1;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      const u = x / W;
      const y = ecgY - beat(u * 3.2 - t * 0.5) * H * 0.075;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = ink(0.22 * grow);
    ctx.stroke();
    const hx = head * W;
    ctx.fillStyle = red(0.9 * grow);
    ctx.fillRect(hx - 2.5, ecgY - beat((hx / W) * 3.2 - t * 0.5) * H * 0.075 - 2.5, 5, 5);

    /* --- Moléculas flotantes --- */
    for (const m of molecules) {
      const [x, y, d] = proj(m.x + Math.sin(t * m.sp + m.ph) * 0.3, m.y + Math.cos(t * m.sp * 0.8 + m.ph) * 0.3, m.z);
      const r = m.r * unit * (1 - d * 0.03);
      ctx.beginPath();
      for (let k = 0; k <= m.sides; k++) {
        const a = (k / m.sides) * TAU + t * m.sp * 0.4;
        const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
        if (k) ctx.lineTo(px, py);
        else ctx.moveTo(px, py);
      }
      ctx.strokeStyle = ink((0.16 + (d < 0 ? 0.2 : 0)) * grow);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* --- Hélice --- */
    const enzyme = ((t * 0.085) % 1.3) - 0.15; // posición normalizada de la enzima
    const spin = t * 0.5;
    const items = [];
    const shown = Math.floor(N * grow);

    for (let i = 0; i < shown; i++) {
      const u = i / (N - 1);
      const along = (u - 0.5) * LENGTH;
      const open = Math.exp(-(((u - enzyme) / 0.075) ** 2)); // 1 justo en la enzima
      const r = RADIUS * (1 + open * 0.75);
      const a = i * TWIST + spin;
      const A = [Math.cos(a) * r, Math.sin(a) * r];
      const B = [Math.cos(a + GROOVE) * r, Math.sin(a + GROOVE) * r];
      const pa = place(along, A[0], A[1]);
      const pb = place(along, B[0], B[1]);
      items.push({ d: (pa[2] + pb[2]) / 2, pa, pb, open, kind: kinds[i], i });
    }
    items.sort((p, q) => q.d - p.d);

    for (const it of items) {
      const { pa, pb, open } = it;
      const near = 1 - (it.d + 1.6) / 3.2; // 0 lejos → 1 cerca
      const alpha = 0.22 + 0.6 * Math.max(0, Math.min(1, near));

      // Par de bases: entero, o dos mitades que se sueltan cerca de la enzima
      const gap = open * 0.34;
      const mid = (f) => [pa[0] + (pb[0] - pa[0]) * f, pa[1] + (pb[1] - pa[1]) * f];
      const m1 = mid(0.5 - gap), m2 = mid(0.5 + gap);
      ctx.lineWidth = 1 + near * 0.8;
      ctx.strokeStyle = open > 0.35 ? red(alpha) : ink(alpha * 0.85);
      if (it.kind % 2) ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(m1[0], m1[1]);
      ctx.moveTo(m2[0], m2[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.stroke();
      ctx.setLineDash([]);
      // Marca central según el tipo de base
      if (open < 0.2 && it.kind > 1) {
        const c = mid(0.5);
        ctx.fillStyle = ink(alpha);
        ctx.fillRect(c[0] - 1.5, c[1] - 1.5, 3, 3);
      }

      // Nucleótidos de cada hebra
      for (const p of [pa, pb]) {
        const size = (2.2 + 3.4 * Math.max(0, near)) * (small ? 0.75 : 1);
        ctx.beginPath();
        ctx.arc(p[0], p[1], size, 0, TAU);
        ctx.fillStyle = bg(1);
        ctx.fill();
        ctx.strokeStyle = open > 0.35 ? red(alpha + 0.2) : ink(alpha + 0.15);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // Esqueleto de fosfatos: une los nucleótidos consecutivos de cada hebra
    for (const key of ['pa', 'pb']) {
      const ordered = items.slice().sort((p, q) => p.i - q.i);
      ctx.beginPath();
      ordered.forEach((it, k) => (k ? ctx.lineTo(it[key][0], it[key][1]) : ctx.moveTo(it[key][0], it[key][1])));
      ctx.strokeStyle = ink(0.3);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* --- Enzima: anillo que rodea la hélice --- */
    if (enzyme > -0.05 && enzyme < 1.05 && grow > 0.9) {
      const along = (enzyme - 0.5) * LENGTH;
      for (const [rr, a] of [[RADIUS * 2.05, 0.95], [RADIUS * 2.4, 0.4]]) {
        const ring = [];
        for (let k = 0; k <= 48; k++) {
          const ang = (k / 48) * TAU;
          ring.push(place(along, Math.cos(ang) * rr, Math.sin(ang) * rr));
        }
        path(ctx, ring);
        ctx.strokeStyle = red(a);
        ctx.lineWidth = a > 0.5 ? 1.6 : 1;
        if (a < 0.5) ctx.setLineDash([4, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  });
}
