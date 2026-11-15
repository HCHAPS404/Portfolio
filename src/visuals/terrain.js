/**
 * NAVIRA-SATViRe — sistema de alerta temprana de deslizamientos, en 3D.
 *
 * Una montaña modelada como malla sólida, con un pueblo en el valle. Sobre la
 * ladera hay nodos de sensores (mástil, caja y panel solar) que miden la
 * humedad del suelo; una torre pasarela en la cresta enlaza con un satélite.
 * Un ciclo de 18 s cuenta la historia completa:
 *   calma → arrecia la lluvia y suben las lecturas → se cruza el umbral: los
 *   nodos avisan a la pasarela, esta al satélite, suenan las sirenas y la
 *   gente evacúa por la ruta marcada → la ladera cede de verdad (la malla se
 *   deforma y bajan escombros) → pasa la tormenta y la escena se restablece.
 */
import { scene, clamp01, TAU } from './kit.js';
import { Scene3D, orbit, chain, translate, rotY, rotX, ngon } from './kit3d.js';
import { rng } from '../core/dom.js';

const CYCLE = 18;
const NX = 30, NZ = 24;
const X0 = -5.2, X1 = 5.2, Z0 = -4.2, Z1 = 4.4;
const SLIP = [1.0, 1.1];      // centro de la masa inestable
const NODES = [[0.5, 1.3], [1.7, 1.0], [1.1, 2.2], [-0.9, 1.6], [2.6, 2.0]];
const GATEWAY = [-0.3, 3.5];
const HOUSES = [[-2.6, -2.6, 0.3], [-1.7, -3.0, 1.1], [-0.9, -2.5, 0.2], [0.1, -3.1, 0.8], [0.9, -2.6, 1.3], [1.9, -3.2, 0.4], [-0.3, -3.7, 0.6], [1.3, -3.7, 1.0], [-1.9, -3.8, 0.1]];
const SAFE = [-4.1, -1.2];    // punto de encuentro, fuera de la trayectoria

const smooth = (a, b, v) => {
  const k = clamp01((v - a) / (b - a));
  return k * k * (3 - 2 * k);
};
const bump = (x, z, cx, cz, r) => Math.exp(-(((x - cx) ** 2 + (z - cz) ** 2) / (r * r)));

/** Relieve en reposo: valle plano, ladera y cresta, con una vaguada. */
function rest(x, z) {
  const rise = smooth(-1.9, 3.4, z);
  return (
    rise * (3.1 + 0.55 * Math.sin(x * 0.7 + 0.6) + 0.3 * Math.sin(x * 1.9 - 1)) +
    rise * 0.22 * Math.sin(x * 2.6 + z * 1.7) -
    rise * 0.5 * bump(x, z, -2.4, 1.6, 1.3) +
    0.05 * Math.sin(x * 3 + z * 2)
  );
}

export function createTerrain(canvas) {
  const S = new Scene3D();
  const R = rng(2026);
  const drops = Array.from({ length: 150 }, () => ({ x: X0 + R() * (X1 - X0), z: Z0 + R() * (Z1 - Z0), ph: R(), v: 0.8 + R() * 0.5 }));
  const debris = Array.from({ length: 34 }, () => ({ dx: (R() - 0.5) * 1.6, lag: R() * 0.5, v: 0.6 + R() * 0.7, r: 1 + R() * 2 }));
  const people = Array.from({ length: 12 }, (_, i) => ({ from: HOUSES[i % HOUSES.length], lag: R() * 0.35 }));
  const houseSeed = HOUSES.map(() => 0.34 + R() * 0.22);

  return scene(canvas, (ctx, W, H, t, ptr) => {
    const tau = t % CYCLE;
    const rain = smooth(1.5, 6, tau) * (1 - smooth(13.5, 16, tau));
    const level = smooth(2.5, 8, tau) * (1 - smooth(15.5, 17.5, tau));   // lectura de los sensores
    const alert = smooth(7.8, 8.3, tau) * (1 - smooth(15, 17, tau));
    const slip = smooth(10.3, 13, tau) * (1 - smooth(16.6, 17.9, tau));

    const ground = (x, z) => {
      const scar = bump(x, z, SLIP[0], SLIP[1] + 0.5, 1.15);
      const fan = bump(x, z, SLIP[0] + 0.1, SLIP[1] - 1.5, 1.25);
      return rest(x, z) - slip * 0.75 * scar + slip * 0.5 * fan * smooth(-2.4, -0.4, z);
    };

    const cam = orbit({
      yaw: 0.42 + Math.sin(t * 0.09) * 0.22 + ptr.x * 0.2,
      pitch: 0.5 + ptr.y * 0.06,
      scale: Math.min(W * 0.066, H * 0.094),
      cx: W * 0.5,
      cy: H * 0.56,
      dist: 28,
      target: [0, 1.25, 0],
    });
    S.reset();

    /* --- Montaña --- */
    const dx = (X1 - X0) / NX, dz = (Z1 - Z0) / NZ;
    const hs = [];
    for (let j = 0; j <= NZ; j++) {
      hs.push([]);
      for (let i = 0; i <= NX; i++) hs[j].push(ground(X0 + i * dx, Z0 + j * dz));
    }
    for (let j = 0; j < NZ; j++) {
      for (let i = 0; i < NX; i++) {
        const x = X0 + i * dx, z = Z0 + j * dz;
        const zone = bump(x + dx / 2, z + dz / 2, SLIP[0], SLIP[1] - 0.3 * slip, 1.5);
        const hot = zone * Math.max(alert * 0.25, slip * 0.7);
        const high = hs[j][i] / 3.4;
        S.face(
          [[x, hs[j][i], z], [x + dx, hs[j][i + 1], z], [x + dx, hs[j + 1][i + 1], z + dz], [x, hs[j + 1][i], z + dz]],
          [x, -20, z],
          { a: 0.1 + high * 0.22 + hot * 0.4, tone: 0.7 + high * 0.75, glow: hot * 0.55, red: hot > 0.25, layer: -2 },
        );
      }
    }
    // Zócalo: el corte del bloque de terreno
    for (let i = 0; i < NX; i++) {
      const x = X0 + i * dx;
      S.face([[x, -0.6, Z0], [x + dx, -0.6, Z0], [x + dx, hs[0][i + 1], Z0], [x, hs[0][i], Z0]], [x, 0, 0], { a: 0.12, tone: 0.45, layer: -2 });
    }
    for (let j = 0; j < NZ; j++) {
      const z = Z0 + j * dz;
      for (const [x, i] of [[X0, 0], [X1, NX]]) S.face([[x, -0.6, z], [x, -0.6, z + dz], [x, hs[j + 1][i], z + dz], [x, hs[j][i], z]], [0, 0, z], { a: 0.12, tone: 0.45, layer: -2 });
    }

    /* --- Pueblo --- */
    HOUSES.forEach(([x, z, turn], k) => {
      const y = ground(x, z);
      const T = chain(translate(x, y, z), rotY(turn));
      const w = houseSeed[k], hh = 0.26 + (k % 3) * 0.06;
      S.box(T, [-w / 2, w / 2], [0, hh], [-0.2, 0.2], { a: 0.75, tone: 1.2 });
      S.extrude(chain(T, rotY(Math.PI / 2)), [[-0.24, hh], [0.24, hh], [0, hh + 0.2]], -w / 2 - 0.03, w / 2 + 0.03, { a: 0.8, tone: 0.8, glow: alert * 0.25 * (0.5 + 0.5 * Math.sin(t * 9)) });
      S.dot(T([0, hh * 0.55, -0.205]), { a: 0.9, r: 1.3, red: alert > 0.5, bias: -0.2 });
    });
    // Sirena en la plaza
    const sx = -0.5, sz = -3.1, sy = ground(sx, sz);
    S.lathe(translate(sx, sy, sz), [[0.03, 0], [0.03, 0.75], [0.09, 0.78], [0.05, 0.9]], 6, { a: 0.8, tone: 1.5 });
    if (alert > 0.02) {
      for (let k = 0; k < 3; k++) {
        const u = (t * 0.9 + k / 3) % 1;
        S.polyline(ngon(30, 0.2 + u * 1.9).map(([a, b]) => [sx + a, sy + 0.85, sz + b]), { red: true, a: (1 - u) * 0.8 * alert, bias: -0.3 }, true);
      }
    }

    /* --- Ruta de evacuación y punto de encuentro --- */
    const route = (u) => {
      const x = -0.9 + (SAFE[0] + 0.9) * u, z = -3.0 + (SAFE[1] + 3.0) * u + Math.sin(u * Math.PI) * -0.5;
      return [x, ground(x, z) + 0.04, z];
    };
    for (let k = 0; k < 22; k += 2) S.line(route(k / 22), route((k + 1) / 22), { a: 0.25 + alert * 0.6, red: alert > 0.5, bias: -0.2 });
    const safe = route(1);
    S.line(safe, [safe[0], safe[1] + 0.8, safe[2]], { a: 0.85 });
    S.face([[safe[0], safe[1] + 0.8, safe[2]], [safe[0] + 0.36, safe[1] + 0.7, safe[2]], [safe[0], safe[1] + 0.58, safe[2]]], null, { both: true, a: 0.9, tone: 1.6 });
    S.polyline(ngon(20, 0.5).map(([a, b]) => [safe[0] + a, safe[1], safe[2] + b]), { a: 0.5, dash: [3, 4], bias: -0.2 }, true);
    if (alert > 0.3) {
      for (const p of people) {
        const u = clamp01((tau - 8.6 - p.lag * 3) / 4.2);
        if (u <= 0) continue;
        const start = [p.from[0], 0, p.from[1]];
        const mid = route(Math.min(1, u * 1.15));
        const k = clamp01(u * 5);
        S.dot([start[0] + (mid[0] - start[0]) * k, ground(start[0] + (mid[0] - start[0]) * k, start[2] + (mid[2] - start[2]) * k) + 0.07, start[2] + (mid[2] - start[2]) * k], { a: 0.95, r: 1.7, round: true, bias: -0.4 });
      }
    }

    /* --- Torre pasarela en la cresta --- */
    const gy = ground(GATEWAY[0], GATEWAY[1]);
    const gtop = [GATEWAY[0], gy + 1.5, GATEWAY[1]];
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      S.line([GATEWAY[0] + a * 0.22, gy, GATEWAY[1] + b * 0.22], [GATEWAY[0] + a * 0.05, gy + 1.4, GATEWAY[1] + b * 0.05], { a: 0.85 });
    }
    for (let k = 1; k <= 4; k++) {
      const y = gy + k * 0.3, w = 0.22 - k * 0.036;
      S.polyline([[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [GATEWAY[0] + a * w, y, GATEWAY[1] + b * w]), { a: 0.5 }, true);
    }
    S.lathe(chain(translate(gtop[0], gtop[1] - 0.25, gtop[2]), rotX(-0.9)), [[0.02, 0], [0.2, 0.1], [0.22, 0.13]], 10, { a: 0.8, tone: 1.5, both: true });
    S.dot(gtop, { red: true, a: 0.5 + 0.5 * Math.sin(t * (alert > 0.5 ? 14 : 3)), r: 2.4, bias: -0.4 });

    /* --- Satélite y enlace --- */
    const sat = [3.6 + Math.sin(t * 0.12) * 0.8, 6.3, 2.2 + Math.cos(t * 0.12) * 0.6];
    const ST = chain(translate(...sat), rotY(t * 0.2), rotX(0.4));
    S.box(ST, [-0.16, 0.16], [-0.13, 0.13], [-0.13, 0.13], { a: 0.9, tone: 1.4 });
    for (const s of [-1, 1]) {
      S.face([[s * 0.2, -0.12, 0], [s * 0.85, -0.12, 0], [s * 0.85, 0.12, 0], [s * 0.2, 0.12, 0]].map(ST), null, { both: true, a: 0.8, tone: 1.1 });
      for (let k = 1; k < 4; k++) S.line(ST([s * (0.2 + k * 0.163), -0.12, 0]), ST([s * (0.2 + k * 0.163), 0.12, 0]), { a: 0.5, bias: -0.1 });
    }
    S.lathe(chain(ST, translate(0, -0.13, 0), rotX(Math.PI)), [[0.02, 0], [0.13, 0.08]], 8, { a: 0.7, both: true, tone: 1.5 });
    S.line(gtop, sat, { a: 0.12 + alert * 0.6, red: alert > 0.4, dash: [3, 6] });
    if (alert > 0.3) {
      for (let k = 0; k < 3; k++) {
        const u = (t * 0.7 + k / 3) % 1;
        S.dot([gtop[0] + (sat[0] - gtop[0]) * u, gtop[1] + (sat[1] - gtop[1]) * u, gtop[2] + (sat[2] - gtop[2]) * u], { red: true, a: alert, r: 2.2, bias: -0.3 });
      }
    }

    /* --- Nodos de sensores --- */
    NODES.forEach(([x, z], k) => {
      const inSlide = bump(x, z, SLIP[0], SLIP[1], 1.2);
      const y = ground(x, z);
      const lean = slip * inSlide * 0.55;
      const T = chain(translate(x, y, z - slip * inSlide * 0.5), rotX(lean));
      const local = clamp01(level * (0.75 + inSlide * 0.6) + 0.04 * Math.sin(t * 3 + k));
      const hot = alert * (inSlide > 0.25 ? 1 : 0.55);
      S.lathe(T, [[0.035, 0], [0.035, 0.62]], 6, { a: 0.8, tone: 1.4 });
      S.box(T, [-0.09, 0.09], [0.36, 0.56], [-0.07, 0.07], { a: 0.9, tone: 1.3, glow: hot * 0.6, red: hot > 0.5 });
      S.face([[-0.2, 0.66, -0.12], [0.2, 0.66, -0.12], [0.2, 0.78, 0.12], [-0.2, 0.78, 0.12]].map(T), null, { both: true, a: 0.8, tone: 1.0 });
      S.line(T([0, 0.62, 0]), T([0, 0.92, 0]), { a: 0.8 });
      // Lectura de humedad: columna que crece sobre el nodo
      const top = T([0, 0.92, 0]);
      S.line(top, [top[0], top[1] + 0.9, top[2]], { a: 0.22 });
      S.line(top, [top[0], top[1] + 0.9 * local, top[2]], { a: 0.95, lw: 3, red: local > 0.72 });
      S.line([top[0] - 0.08, top[1] + 0.9 * 0.72, top[2]], [top[0] + 0.08, top[1] + 0.9 * 0.72, top[2]], { a: 0.7, red: true });
      // Radio hacia la pasarela
      const u = (t * (0.35 + hot * 1.1) + k * 0.23) % 1;
      S.line(top, gtop, { a: 0.07 + hot * 0.35, red: hot > 0.5, dash: [2, 6] });
      S.dot([top[0] + (gtop[0] - top[0]) * u, top[1] + (gtop[1] - top[1]) * u, top[2] + (gtop[2] - top[2]) * u], { a: 0.5 + hot * 0.5, red: hot > 0.5, r: 1.8, bias: -0.3 });
      if (hot > 0.1) {
        const ring = (t * 1.3 + k * 0.4) % 1;
        S.polyline(ngon(18, 0.15 + ring * 0.6).map(([a, b]) => [top[0] + a, top[1] - 0.3, top[2] + b]), { red: true, a: (1 - ring) * hot * 0.8, bias: -0.3 }, true);
      }
    });

    /* --- Escombros --- */
    if (slip > 0.02 && tau < 16.6) {
      for (const d of debris) {
        const u = clamp01((tau - 10.4 - d.lag * 2) / (2.6 / d.v));
        if (u <= 0) continue;
        const z = SLIP[1] + 0.9 - u * 3.3;
        const x = SLIP[0] + d.dx * (0.4 + u * 0.8);
        S.dot([x, ground(x, z) + 0.06 + Math.abs(Math.sin(u * 14 + d.dx * 9)) * 0.14 * (1 - u), z], { red: u < 0.9, a: 0.95, r: d.r, bias: -0.3 });
      }
    }

    /* --- Lluvia --- */
    if (rain > 0.02) {
      const n = Math.floor(drops.length * rain);
      for (let k = 0; k < n; k++) {
        const d = drops[k];
        const y = 6.2 - ((t * 5.5 * d.v + d.ph * 7) % 6.6);
        if (y < ground(d.x, d.z)) continue;
        S.line([d.x, y, d.z], [d.x - 0.05, y + 0.3, d.z], { a: 0.32 * rain });
      }
    }

    S.render(ctx, cam);
  }, { fps: 40, still: 9.4 });
}
