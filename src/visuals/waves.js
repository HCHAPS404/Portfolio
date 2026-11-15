/**
 * Hackatón GDG Cartagena — la ciudad amurallada en 3D, vista desde la bahía.
 *
 * Maqueta sólida de Cartagena de Indias: la Torre del Reloj con sus tres arcos
 * y la esfera en marcha, la muralla almenada con garitas, casas coloniales, la
 * cúpula y el campanario. Delante, un mar de malla que ondula y refleja el
 * sol; un velero de vela roja cruza la bahía. En el cielo flotan, en volumen,
 * los corchetes «< >» de Google Developer Groups, que giran sobre la ciudad.
 */
import { scene, TAU } from './kit.js';
import { Scene3D, orbit, chain, translate, rotY, rotX, rotZ, ngon } from './kit3d.js';
import { rng } from '../core/dom.js';

const CHEVRON = [[0.5, 0.66], [0.2, 0.66], [-0.52, 0], [0.2, -0.66], [0.5, -0.66], [-0.08, 0]];
const HOUSES = [
  [-6.0, 1.0, 1.5], [-5.0, 1.1, 1.9], [-3.85, 0.9, 1.6], [-2.9, 1.0, 2.1], [-1.8, 0.9, 1.7],
  [1.75, 0.9, 1.8], [2.75, 1.0, 2.2], [5.9, 1.0, 1.7],
];

/** Arco de medio punto (polígono) para puertas y vanos. */
function arch(w, h, seg = 8) {
  const pts = [[-w / 2, 0], [w / 2, 0], [w / 2, h - w / 2]];
  for (let k = 1; k < seg; k++) pts.push([Math.cos((k / seg) * Math.PI) * (w / 2), h - w / 2 + Math.sin((k / seg) * Math.PI) * (w / 2)]);
  pts.push([-w / 2, h - w / 2]);
  return pts;
}

export function createWaves(canvas) {
  const S = new Scene3D();
  const R = rng(1533); // año de fundación de Cartagena
  const stars = Array.from({ length: 60 }, () => ({ x: (R() - 0.5) * 26, y: 3.5 + R() * 7, p: R() * TAU, f: 0.6 + R() * 1.8 }));
  const palms = [[-4.4, 0.75, 1.5], [-2.3, 0.7, 1.25], [2.3, 0.75, 1.4], [5.0, 0.7, 1.2], [3.4, -0.1, 1.0]];
  const gulls = Array.from({ length: 5 }, (_, i) => ({ x: R(), y: 4.2 + R() * 1.6, z: -1 - R() * 3, v: 0.02 + R() * 0.02, p: R() * TAU + i }));

  return scene(canvas, (ctx, W, H, t, ptr) => {
    const cam = orbit({
      yaw: Math.sin(t * 0.08) * 0.26 + ptr.x * 0.2,
      pitch: 0.17 + ptr.y * 0.05,
      scale: Math.min(W * 0.066, H * 0.098),
      cx: W * 0.5,
      cy: H * 0.63,
      dist: 30,
      target: [0, 1.9, 0],
    });
    S.reset();

    /* --- Cielo: estrellas y sol de franjas tras la ciudad --- */
    for (const s of stars) S.dot([s.x, s.y, 12], { a: 0.25 + 0.4 * (0.5 + 0.5 * Math.sin(t * s.f + s.p)), r: 0.8, layer: -9 });
    const SUN = [2.6, 1.3, 11], SR = 3.3;
    for (let k = 0; k < 26; k++) {
      const y = -SR + ((k + 0.5) / 26) * SR * 2;
      if (SUN[1] + y < 0.2) continue;
      const half = Math.sqrt(SR * SR - y * y);
      const gap = y < 0.6 ? 0.55 : 1;
      S.line([SUN[0] - half, SUN[1] + y, SUN[2]], [SUN[0] + half, SUN[1] + y, SUN[2]], { a: 0.5 * gap, lw: 2.2, red: k % 5 === 2, layer: -8 });
    }

    /* --- Mar --- */
    const wave = (x, z) => 0.07 * Math.sin(x * 1.25 + t * 1.3) + 0.05 * Math.sin(z * 2.1 + x * 0.6 - t * 1.1) + 0.03 * Math.sin(x * 3.1 - z * 1.3 + t * 2);
    const MX = 30, MZ = 13, sx0 = -8.2, sx1 = 8.2, sz0 = -6.4, sz1 = -0.6;
    const ddx = (sx1 - sx0) / MX, ddz = (sz1 - sz0) / MZ;
    for (let j = 0; j < MZ; j++) {
      for (let i = 0; i < MX; i++) {
        const x = sx0 + i * ddx, z = sz0 + j * ddz;
        const pts = [[x, wave(x, z), z], [x + ddx, wave(x + ddx, z), z], [x + ddx, wave(x + ddx, z + ddz), z + ddz], [x, wave(x, z + ddz), z + ddz]];
        // Reflejo del sol: una franja que titila hacia el observador
        const glint = Math.exp(-(((x - SUN[0] * 0.55) / 1.1) ** 2)) * (0.5 + 0.5 * Math.sin(z * 5 + t * 3 + i));
        S.face(pts, [x, -9, z], { a: 0.1 + glint * 0.3, tone: 0.5 + glint * 1.3, layer: -4 });
      }
    }

    /* --- Muelle y muralla --- */
    S.box(translate(0, 0, 0), [-8.2, 8.2], [-0.3, 0.22], [-0.6, 3.4], { a: 0.5, tone: 0.6, layer: -3 });
    for (const [a, b] of [[-7.4, -1.35], [1.35, 7.4]]) {
      S.box(translate(0, 0, 0), [a, b], [0.22, 1.12], [-0.22, 0.34], { a: 0.75, tone: 0.95, bias: 0.6 });
      S.box(translate(0, 0, 0), [a, b], [0.22, 0.42], [-0.34, -0.22], { a: 0.4, tone: 0.8, bias: 0.5 });
      for (let x = a + 0.12; x < b - 0.2; x += 0.5) S.box(translate(0, 0, 0), [x, x + 0.26], [1.12, 1.32], [-0.22, -0.04], { a: 0.7, tone: 1.15 });
      // Troneras
      for (let x = a + 0.7; x < b - 0.4; x += 1.5) S.face([[x, 0.62, -0.224], [x + 0.2, 0.62, -0.224], [x + 0.16, 0.84, -0.224], [x + 0.04, 0.84, -0.224]], [x, 0.7, 1], { a: 0.5, tone: 0.12, bias: 0.3 });
    }
    // Baluartes con garita en los extremos
    for (const x of [-7.4, 7.4]) {
      S.lathe(translate(x, 0.22, -0.1), [[0.62, 0], [0.55, 1.05], [0.6, 1.1], [0.6, 1.2]], 10, { a: 0.75, tone: 1.0, bias: 0.3 });
      S.lathe(translate(x, 1.2, -0.3), [[0.17, 0], [0.17, 0.4], [0.23, 0.44], [0.12, 0.62], [0, 0.74]], 8, { a: 0.8, tone: 1.3 });
      S.dot([x, 2.0, -0.3], { a: 0.9, r: 1.4 });
    }

    /* --- Torre del Reloj --- */
    S.box(translate(0, 0, 0), [-1.35, 1.35], [0.22, 1.75], [-0.4, 0.5], { a: 0.85, tone: 1.1, bias: 0.4 });
    S.box(translate(0, 0, 0), [-1.43, 1.43], [1.75, 1.87], [-0.47, 0.57], { a: 0.8, tone: 1.3 });
    for (const [x, w, h] of [[-0.85, 0.44, 0.95], [0, 0.6, 1.2], [0.85, 0.44, 0.95]]) {
      S.face(arch(w, h).map(([a, b]) => [x + a, 0.24 + b, -0.404]), [x, 0.5, 1], { a: 0.75, tone: 0.1, bias: -0.05 });
    }
    // Pilastras
    for (const x of [-1.3, -0.45, 0.45, 1.3]) S.box(translate(0, 0, 0), [x - 0.07, x + 0.07], [0.22, 1.75], [-0.46, -0.4], { a: 0.6, tone: 1.4 });
    // Fuste
    S.box(translate(0, 0, 0), [-0.46, 0.46], [1.87, 3.2], [-0.36, 0.36], { a: 0.85, tone: 1.15 });
    S.box(translate(0, 0, 0), [-0.54, 0.54], [3.2, 3.32], [-0.44, 0.44], { a: 0.8, tone: 1.35 });
    S.face(arch(0.26, 0.5).map(([a, b]) => [a, 2.02 + b, -0.364]), [0, 2.2, 1], { a: 0.6, tone: 0.12, bias: -0.05 });
    // Esfera del reloj: marcas horarias y manecillas en marcha
    const CY = 2.86;
    S.face(ngon(28, 0.3).map(([a, b]) => [a, CY + b, -0.366]), [0, CY, 1], { a: 0.95, tone: 1.9, bias: -0.06 });
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * TAU;
      S.line([Math.cos(a) * 0.24, CY + Math.sin(a) * 0.24, -0.37], [Math.cos(a) * 0.29, CY + Math.sin(a) * 0.29, -0.37], { a: 0.9, bias: -0.2 });
    }
    const mh = -t * 0.9, hh = -t * 0.075;
    S.line([0, CY, -0.372], [Math.sin(-mh) * 0.25, CY + Math.cos(mh) * 0.25, -0.372], { red: true, a: 1, lw: 1.8, bias: -0.3 });
    S.line([0, CY, -0.372], [Math.sin(-hh) * 0.16, CY + Math.cos(hh) * 0.16, -0.372], { a: 1, lw: 2.2, bias: -0.3 });
    // Campanario octogonal, chapitel y veleta
    S.lathe(translate(0, 3.32, 0), [[0.36, 0], [0.36, 0.56], [0.42, 0.6], [0.42, 0.68]], 8, { a: 0.85, tone: 1.2 }, { a: 0.55 });
    for (let k = 0; k < 8; k++) {
      const a = ((k + 0.5) / 8) * TAU, r = 0.337;
      const T = chain(translate(Math.cos(a) * r, 3.38, Math.sin(a) * r), rotY(-a + Math.PI / 2));
      S.face(arch(0.15, 0.4, 5).map(([x, y]) => T([x, y, 0])), [0, 3.5, 0], { a: 0.5, tone: 0.1, bias: -0.04 });
    }
    S.lathe(translate(0, 4.0, 0), [[0.4, 0], [0.22, 0.5], [0.1, 0.95], [0.02, 1.3]], 8, { a: 0.85, tone: 1.25 }, { a: 0.5 });
    S.line([0, 5.3, 0], [0, 5.62, 0], { a: 0.9 });
    S.dot([0, 5.64, 0], { red: true, a: 1, r: 2.2, round: true });

    /* --- Casas coloniales tras la muralla --- */
    HOUSES.forEach(([x, w, h], k) => {
      S.box(translate(x, 0, 0), [-w / 2, w / 2], [0.22, h], [1.0, 2.3], { a: 0.55, tone: 0.8 + (k % 3) * 0.12, bias: 0.8 });
      S.extrude(chain(translate(x, 0, 1.65), rotY(Math.PI / 2)), [[-0.72, h], [0.72, h], [0, h + 0.32]], -w / 2 - 0.04, w / 2 + 0.04, { a: 0.55, tone: 0.65, bias: 0.8 });
      for (let i = 0; i < 2; i++) {
        const wx = x - w / 4 + i * (w / 2);
        S.face([[wx - 0.07, h - 0.42, 0.996], [wx + 0.07, h - 0.42, 0.996], [wx + 0.07, h - 0.16, 0.996], [wx - 0.07, h - 0.16, 0.996]], [wx, h, 2], { a: 0.5, tone: (k + i) % 3 === 0 ? 2.4 : 0.15, bias: 0.6 });
      }
    });
    // Cúpula y campanario
    const DX = 3.9;
    S.lathe(translate(DX, 0.22, 1.7), [[0.72, 0], [0.72, 1.75], [0.78, 1.8], [0.78, 1.9]], 12, { a: 0.6, tone: 0.9, bias: 0.6 });
    S.lathe(translate(DX, 2.12, 1.7), [[0.72, 0], [0.68, 0.3], [0.55, 0.56], [0.36, 0.74], [0.14, 0.84], [0.12, 1.05], [0.02, 1.12]], 14, { a: 0.7, tone: 1.2 }, { a: 0.4 });
    S.line([DX, 3.24, 1.7], [DX, 3.5, 1.7], { a: 0.9 });
    S.line([DX - 0.08, 3.4, 1.7], [DX + 0.08, 3.4, 1.7], { a: 0.9 });
    S.box(translate(5.0, 0, 1.6), [-0.3, 0.3], [0.22, 3.0], [-0.3, 0.3], { a: 0.6, tone: 1.0, bias: 0.6 });
    S.lathe(translate(5.0, 3.0, 1.6), [[0.36, 0], [0.36, 0.08], [0.26, 0.08], [0.26, 0.5], [0.3, 0.54], [0.02, 1.1]], 4, { a: 0.7, tone: 1.2 }, { a: 0.5 });

    /* --- Palmeras --- */
    palms.forEach(([x, z, hgt], k) => {
      const lean = Math.sin(t * 0.7 + k) * 0.05;
      const trunk = [];
      for (let s = 0; s <= 6; s++) trunk.push([x + Math.sin((s / 6) * 1.1) * (0.18 + lean), (z < 0 ? 0.22 : 1.12) + (s / 6) * hgt, z + 0.6]);
      S.polyline(trunk, { a: 0.8, lw: 1.6 });
      const top = trunk[6];
      for (let f = 0; f < 8; f++) {
        const a = (f / 8) * TAU + k;
        const frond = [];
        for (let s = 0; s <= 4; s++) {
          const r = (s / 4) * 0.55;
          frond.push([top[0] + Math.cos(a) * r, top[1] + Math.sin((s / 4) * Math.PI) * 0.16 - (s / 4) ** 2 * 0.3 + Math.sin(t * 1.6 + f) * 0.02 * s, top[2] + Math.sin(a) * r]);
        }
        S.polyline(frond, { a: 0.75 });
      }
    });

    /* --- Velero --- */
    const bx = ((t * 0.22 + 4) % 19) - 9.5, bz = -3.1;
    const B = chain(translate(bx, wave(bx, bz) + 0.05, bz), rotZ(Math.sin(t * 1.3) * 0.05), rotX(Math.sin(t * 0.9) * 0.04));
    S.extrude(B, [[-0.75, 0.2], [0.85, 0.2], [0.55, -0.12], [-0.6, -0.12]], -0.2, 0.2, { a: 0.9, tone: 1.4 }, { a: 0.6 });
    S.line(B([0.05, 0.2, 0]), B([0.05, 2.0, 0]), { a: 0.95, lw: 1.5 });
    S.face([[0.1, 0.36, 0], [0.1, 1.95, 0], [0.95, 0.36, 0]].map(B), null, { both: true, red: true, glow: 0.8, a: 0.9 });
    S.face([[-0.02, 0.4, 0], [-0.02, 1.7, 0], [-0.7, 0.4, 0]].map(B), null, { both: true, a: 0.9, tone: 2.2 });
    S.line(B([0.05, 2.0, 0]), B([-0.28, 1.92, 0]), { red: true, a: 0.9, lw: 2 });
    for (let k = 1; k < 9; k++) S.line([bx - 0.8 - k * 0.3, wave(bx - k * 0.3, bz) + 0.02, bz - 0.06 * k], [bx - 0.8 - k * 0.3, wave(bx - k * 0.3, bz) + 0.02, bz + 0.06 * k], { a: 0.4 * (1 - k / 9) });

    /* --- Gaviotas --- */
    for (const g of gulls) {
      const x = ((g.x + t * g.v) % 1) * 20 - 10;
      const flap = Math.sin(t * 5 + g.p) * 0.12;
      S.polyline([[x - 0.26, g.y + flap, g.z], [x, g.y, g.z], [x + 0.26, g.y + flap, g.z]], { a: 0.7 });
    }

    /* --- Corchetes de GDG en volumen, girando sobre la ciudad --- */
    const G = chain(translate(-3.3, 5.9 + Math.sin(t * 0.8) * 0.12, 1.2), rotY(t * 0.5), rotX(0.12));
    S.extrude(chain(G, translate(-0.95, 0, 0)), CHEVRON, -0.17, 0.17, { a: 0.95, tone: 1.7 }, { a: 0.6, tone: 1.2 });
    S.extrude(chain(G, translate(0.95, 0, 0), rotZ(Math.PI)), CHEVRON, -0.17, 0.17, { a: 0.95, tone: 1.7 }, { a: 0.6, tone: 1.2 });
    S.lathe(G, [[0.02, -0.2], [0.15, -0.14], [0.2, 0], [0.15, 0.14], [0.02, 0.2]], 10, { a: 0.9, red: true, glow: 0.85 });
    // Órbitas de datos alrededor del emblema
    for (let k = 0; k < 2; k++) {
      const O = chain(translate(-3.3, 5.9, 1.2), rotZ(k ? 0.5 : -0.4), rotX(k ? 0.3 : -0.2));
      S.polyline(ngon(40, 1.85).map(([a, b]) => O([a, 0, b])), { a: 0.22, dash: [2, 5] }, true);
      const a = t * (k ? 0.9 : -0.7) + k * 2;
      S.dot(O([Math.cos(a) * 1.85, 0, Math.sin(a) * 1.85]), { a: 0.95, r: 2.2, red: k === 0 });
    }

    S.render(ctx, cam);
  }, { fps: 40, still: 6 });
}
