/**
 * Motor 3D mínimo sobre Canvas 2D para las escenas con volumen (portadas y
 * competencias): sólidos de caras planas con sombreado, ocultación de caras
 * traseras y orden de pintado por profundidad. Sin dependencias.
 *
 * Convención: X a la derecha, Y hacia arriba, Z alejándose del observador.
 * Una transformación es una función punto → punto; `chain(a, b, c)` aplica
 * primero `c`, luego `b` y al final `a` (como una jerarquía padre → hijo).
 */
import { INK, RED, TAU } from './kit.js';

export const translate = (tx, ty, tz) => (p) => [p[0] + tx, p[1] + ty, p[2] + tz];
export const rotX = (a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return (p) => [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
};
export const rotY = (a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return (p) => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
};
export const rotZ = (a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return (p) => [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
};
export const scale = (k) => (p) => [p[0] * k, p[1] * k, p[2] * k];
export const identity = (p) => p;
export const chain = (...fns) => (p) => {
  let q = p;
  for (let i = fns.length - 1; i >= 0; i--) q = fns[i](q);
  return q;
};

const LIGHT = (() => {
  const l = [-0.5, 0.72, -0.48];
  const n = Math.hypot(...l);
  return l.map((c) => c / n);
})();

/** Cámara orbital con perspectiva. `view` lleva un punto al espacio de cámara. */
export function orbit({ yaw = 0, pitch = 0, scale: s = 100, cx = 0, cy = 0, dist = 14, target = [0, 0, 0] }) {
  const cyw = Math.cos(yaw), syw = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const rot = (x, y, z) => {
    const x1 = x * cyw + z * syw;
    const z1 = -x * syw + z * cyw;
    return [x1, y * cp + z1 * sp, -y * sp + z1 * cp]; // inclinación positiva: cámara por encima
  };
  const view = (p) => rot(p[0] - target[0], p[1] - target[1], p[2] - target[2]);
  const screen = (v) => {
    const k = dist / (dist + v[2]);
    return [cx + v[0] * s * k, cy - v[1] * s * k];
  };
  return { rot, view, screen, dist, project: (p) => screen(view(p)) };
}

export class Scene3D {
  constructor() {
    this.items = [];
  }

  reset() {
    this.items.length = 0;
  }

  /**
   * Cara plana. `inside` es un punto del interior del sólido: fija hacia dónde
   * mira la cara. Opciones: tone (0–1.6, brillo), a (alfa del trazo), lw,
   * red (cara de acento), glow (0–1, relleno rojo), layer (orden forzado),
   * both (visible por los dos lados), bare (sin relleno).
   */
  face(pts, inside, o = {}) {
    const [a, b, c] = pts;
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    let n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const len = Math.hypot(n[0], n[1], n[2]) || 1;
    n = [n[0] / len, n[1] / len, n[2] / len];
    if (inside && (a[0] - inside[0]) * n[0] + (a[1] - inside[1]) * n[1] + (a[2] - inside[2]) * n[2] < 0) n = [-n[0], -n[1], -n[2]];
    this.items.push({ pts, n, o });
  }

  line(a, b, o = {}) {
    this.items.push({ line: [a, b], o });
  }

  /** Polilínea como tramos sueltos (cada uno se ordena por su profundidad). */
  polyline(pts, o = {}, close = false) {
    for (let i = 1; i < pts.length; i++) this.line(pts[i - 1], pts[i], o);
    if (close) this.line(pts[pts.length - 1], pts[0], o);
  }

  dot(p, o = {}) {
    this.items.push({ dot: p, o });
  }

  box(tf, x, y, z, o = {}) {
    const c = [[x[0], y[0], z[0]], [x[1], y[0], z[0]], [x[1], y[1], z[0]], [x[0], y[1], z[0]], [x[0], y[0], z[1]], [x[1], y[0], z[1]], [x[1], y[1], z[1]], [x[0], y[1], z[1]]].map(tf);
    const mid = tf([(x[0] + x[1]) / 2, (y[0] + y[1]) / 2, (z[0] + z[1]) / 2]);
    for (const f of [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [3, 2, 6, 7], [0, 3, 7, 4], [1, 2, 6, 5]]) this.face(f.map((i) => c[i]), mid, o);
  }

  /**
   * Sólido de revolución alrededor del eje Y local. `profile` es una lista de
   * [radio, altura]. Los lados van con trazo tenue (`side`), las tapas con `o`.
   */
  lathe(tf, profile, seg = 16, o = {}, side = {}) {
    const so = { ...o, a: (o.a ?? 0.7) * 0.3, ...side };
    const ring = (r, y) => Array.from({ length: seg }, (_, k) => tf([Math.cos((k / seg) * TAU) * r, y, Math.sin((k / seg) * TAU) * r]));
    const rings = profile.map(([r, y]) => ring(r, y));
    const yMid = (profile[0][1] + profile[profile.length - 1][1]) / 2;
    const core = tf([0, yMid, 0]);
    for (let i = 1; i < profile.length; i++) {
      const axis = tf([0, (profile[i - 1][1] + profile[i][1]) / 2, 0]);
      const flat = Math.abs(profile[i - 1][1] - profile[i][1]) < 1e-6; // anillo plano: es una tapa
      for (let k = 0; k < seg; k++) {
        const k2 = (k + 1) % seg;
        this.face([rings[i - 1][k], rings[i - 1][k2], rings[i][k2], rings[i][k]], flat ? core : axis, flat ? o : so);
      }
    }
    for (const end of [0, profile.length - 1]) {
      if (profile[end][0] > 1e-6) this.face(rings[end], core, o);
    }
  }

  /** Prisma: polígono 2D (plano XY local) extruido entre z0 y z1. Admite polígonos cóncavos. */
  extrude(tf, poly, z0, z1, o = {}, side = {}) {
    const so = { ...o, ...side };
    let area = 0;
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
      area += x1 * y2 - x2 * y1;
    }
    const sign = area > 0 ? 1 : -1;
    const zm = (z0 + z1) / 2;
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
      const nx = (y2 - y1) * sign, ny = -(x2 - x1) * sign; // normal exterior de la arista
      const len = Math.hypot(nx, ny) || 1;
      const inside = tf([(x1 + x2) / 2 - (nx / len) * 0.01, (y1 + y2) / 2 - (ny / len) * 0.01, zm]);
      this.face([tf([x1, y1, z0]), tf([x2, y2, z0]), tf([x2, y2, z1]), tf([x1, y1, z1])], inside, so);
    }
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    const mid = tf([cx, cy, zm]);
    // Las tapas se pintan después de los lados de su mismo sólido (bias de profundidad)
    this.face(poly.map(([x, y]) => tf([x, y, z0])), mid, { ...o, cap: true });
    this.face(poly.map(([x, y]) => tf([x, y, z1])), mid, { ...o, cap: true });
  }

  render(ctx, cam, { alpha = 1 } = {}) {
    const out = [];
    for (const it of this.items) {
      const o = it.o;
      if (it.pts) {
        const vs = it.pts.map(cam.view);
        let cxv = 0, cyv = 0, czv = 0;
        for (const v of vs) {
          cxv += v[0];
          cyv += v[1];
          czv += v[2];
        }
        cxv /= vs.length;
        cyv /= vs.length;
        czv /= vs.length;
        const n = cam.rot(it.n[0], it.n[1], it.n[2]);
        const facing = n[0] * cxv + n[1] * cyv + n[2] * (czv + cam.dist);
        if (facing >= 0 && !o.both) continue;
        const nn = facing >= 0 ? [-n[0], -n[1], -n[2]] : n;
        const lambert = Math.max(0, nn[0] * LIGHT[0] + nn[1] * LIGHT[1] + nn[2] * LIGHT[2]);
        out.push({ k: 0, s: vs.map(cam.screen), d: czv - (o.cap ? 0.02 : 0) + (o.bias ?? 0), lambert, o });
      } else if (it.line) {
        const a = cam.view(it.line[0]), b = cam.view(it.line[1]);
        out.push({ k: 1, s: [cam.screen(a), cam.screen(b)], d: (a[2] + b[2]) / 2 + (o.bias ?? -0.03), o });
      } else {
        const v = cam.view(it.dot);
        out.push({ k: 2, s: cam.screen(v), d: v[2] + (o.bias ?? -0.03), o });
      }
    }
    out.sort((p, q) => (p.o.layer ?? 0) - (q.o.layer ?? 0) || q.d - p.d);

    for (const it of out) {
      const o = it.o;
      const a = (o.a ?? 0.7) * alpha;
      if (it.k === 0) {
        ctx.beginPath();
        ctx.moveTo(it.s[0][0], it.s[0][1]);
        for (let i = 1; i < it.s.length; i++) ctx.lineTo(it.s[i][0], it.s[i][1]);
        ctx.closePath();
        if (!o.bare) {
          if (o.glow) {
            ctx.fillStyle = `rgba(${RED},${(o.glow * alpha).toFixed(3)})`;
            ctx.fillStyle = mix(it.lambert, o.tone ?? 1, o.glow);
          } else ctx.fillStyle = mix(it.lambert, o.tone ?? 1, 0);
          ctx.globalAlpha = (o.fa ?? 1) * Math.min(1, alpha * 1.4);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        if (a > 0.004) {
          ctx.strokeStyle = o.red ? `rgba(${RED},${a.toFixed(3)})` : `rgba(${INK},${a.toFixed(3)})`;
          ctx.lineWidth = o.lw ?? 1;
          ctx.stroke();
        }
      } else if (it.k === 1) {
        ctx.beginPath();
        ctx.moveTo(it.s[0][0], it.s[0][1]);
        ctx.lineTo(it.s[1][0], it.s[1][1]);
        ctx.strokeStyle = o.red ? `rgba(${RED},${a.toFixed(3)})` : `rgba(${INK},${a.toFixed(3)})`;
        ctx.lineWidth = o.lw ?? 1;
        if (o.dash) ctx.setLineDash(o.dash);
        ctx.stroke();
        if (o.dash) ctx.setLineDash([]);
      } else {
        const r = o.r ?? 2;
        ctx.fillStyle = o.red ? `rgba(${RED},${a.toFixed(3)})` : `rgba(${INK},${a.toFixed(3)})`;
        if (o.round) {
          ctx.beginPath();
          ctx.arc(it.s[0], it.s[1], r, 0, TAU);
          ctx.fill();
        } else ctx.fillRect(it.s[0] - r, it.s[1] - r, r * 2, r * 2);
      }
    }
  }
}

/** Color de relleno: gris según la luz, virando a rojo con `glow`. */
function mix(lambert, tone, glow) {
  const g = (9 + 46 * Math.pow(lambert, 0.85)) * tone;
  const r = g + (238 - g) * glow, gg = g + (46 - g) * glow * 0.9, b = g + 3 + (51 - g) * glow * 0.9;
  return `rgb(${Math.min(255, r) | 0},${Math.min(255, gg) | 0},${Math.min(255, b) | 0})`;
}

/** Perfil de un engranaje: `n` dientes, módulo `m`. Devuelve un polígono 2D. */
export function gearProfile(n, m = 1) {
  const rp = (n * m) / 2, rt = rp + m, rr = rp - 1.2 * m;
  const pitch = TAU / n;
  const pts = [];
  for (let k = 0; k < n; k++) {
    const a = k * pitch;
    for (const [r, f] of [[rr, -0.3], [rp, -0.2], [rt, -0.1], [rt, 0.1], [rp, 0.2], [rr, 0.3]]) pts.push([Math.cos(a + f * pitch) * r, Math.sin(a + f * pitch) * r]);
  }
  return pts;
}

/** Polígono regular (para cilindros facetados y tuercas). */
export const ngon = (n, r, phase = 0) => Array.from({ length: n }, (_, k) => [Math.cos((k / n) * TAU + phase) * r, Math.sin((k / n) * TAU + phase) * r]);
