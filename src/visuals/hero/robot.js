/**
 * Portada en alemán — robótica industrial.
 * Celda de soldadura con un brazo de seis ejes modelado en sólidos: base
 * atornillada, torreta, carcasas de motor, brazo, antebrazo, muñeca y antorcha.
 * La cinemática inversa mantiene la antorcha vertical mientras recorre el
 * contorno de la pieza; deja el cordón en rojo y suelta chispas. Al fondo, el
 * armario de control y la manguera de cables.
 */
import { scene, easeIn, TAU } from '../kit.js';
import { Scene3D, orbit, chain, translate, rotX, rotY, rotZ, ngon } from '../kit3d.js';
import { rng } from '../../core/dom.js';

const HS = 1.3;      // altura del hombro
const L1 = 2.35;     // brazo
const L2 = 2.05;     // antebrazo
const TOOL = 0.95;   // de la muñeca a la punta
const TOP = 1.02;    // cara superior de la pieza
const AXZ = rotX(Math.PI / 2); // lleva el eje de revolución (Y) al eje Z local

/** Contorno que sigue la antorcha: rectángulo de esquinas redondeadas sobre la pieza. */
function seam(u) {
  const a = (((u % 1) + 1) % 1) * TAU;
  const sq = (v) => Math.sign(v) * Math.pow(Math.abs(v), 0.5);
  return [2.75 + sq(Math.cos(a)) * 0.78, TOP, sq(Math.sin(a)) * 1.12];
}

/** Eslabón plano con extremos redondos (perfil en XY, a lo largo de +Y). */
function link(r0, r1, len, seg = 7) {
  const pts = [];
  for (let k = 0; k <= seg; k++) pts.push([Math.cos(Math.PI + (k / seg) * Math.PI) * r0, Math.sin(Math.PI + (k / seg) * Math.PI) * r0]);
  for (let k = 0; k <= seg; k++) pts.push([Math.cos((k / seg) * Math.PI) * r1, len + Math.sin((k / seg) * Math.PI) * r1]);
  return pts;
}

export function create(canvas) {
  const S = new Scene3D();
  const R = rng(1973);
  const sparks = Array.from({ length: 26 }, () => ({ a: R() * TAU, v: 0.5 + R() * 1.2, up: 0.6 + R() * 1.6, ph: R() }));
  const upper = link(0.4, 0.3, L1);
  const rib = link(0.2, 0.14, L1 - 0.5).map(([x, y]) => [x, y + 0.25]);

  return scene(canvas, (ctx, W, H, t, ptr) => {
    const small = W < 640;
    const grow = easeIn(t, 0.1, 1.8);
    const cam = orbit({
      yaw: -0.62 + ptr.x * 0.28 + Math.sin(t * 0.1) * 0.12,
      pitch: 0.36 + ptr.y * 0.08,
      scale: Math.min(W, H) * (small ? 0.105 : 0.118),
      cx: W * 0.5,
      cy: H * (small ? 0.5 : 0.52),
      dist: 22,
      target: [1.45, 1.35, 0],
    });
    S.reset();

    /* --- Suelo: retícula y zona de seguridad --- */
    for (let i = -7; i <= 7; i++) {
      const a = i % 2 === 0 ? 0.13 : 0.06;
      S.line([i, 0, -6], [i, 0, 6], { a, layer: -3 });
      S.line([-7, 0, (i * 6) / 7], [7, 0, (i * 6) / 7], { a, layer: -3 });
    }
    S.polyline(ngon(48, 4.9).map(([x, z]) => [x, 0.005, z]), { a: 0.3, dash: [8, 6], red: true, layer: -2 }, true);

    /* --- Armario de control y manguera --- */
    S.box(translate(-2.4, 0, 2.9), [-0.55, 0.55], [0, 2.1], [-0.4, 0.4], { a: 0.5, tone: 0.8, layer: -1 });
    S.box(translate(-2.4, 0, 2.9), [-0.4, 0.4], [1.2, 1.85], [-0.43, -0.4], { a: 0.5, tone: 1.3, layer: -1 });
    for (let k = 0; k < 3; k++) S.dot([-2.65 + k * 0.25, 1.0, 2.47], { r: 1.6, a: 0.9, red: k === Math.floor(t * 1.5) % 3 });
    const hose = [];
    for (let k = 0; k <= 12; k++) {
      const u = k / 12;
      hose.push([-2.4 + u * 1.8, 0.03, 2.5 - u * 2.0 + Math.sin(u * 5) * 0.12]);
    }
    S.polyline(hose, { a: 0.55, lw: 2.2, layer: -1 });

    /* --- Mesa y pieza --- */
    const tb = translate(2.75, 0, 0);
    S.box(tb, [-1.25, 1.25], [0.72, 0.84], [-1.6, 1.6], { a: 0.6, tone: 0.9, bias: 1.6 });
    for (const [x, z] of [[-1.1, -1.45], [1.1, -1.45], [1.1, 1.45], [-1.1, 1.45]]) S.box(tb, [x - 0.07, x + 0.07], [0, 0.72], [z - 0.07, z + 0.07], { a: 0.45, tone: 0.7, bias: 2 });
    S.box(tb, [-1.1, 1.1], [0.12, 0.18], [-1.45, 1.45], { a: 0.25, tone: 0.6, bias: 2.4 });
    // Pieza: bandeja de chapa con nervios y dos casquillos
    S.box(tb, [-0.95, 0.95], [0.84, TOP], [-1.3, 1.3], { a: 0.85, tone: 1.15, bias: 1.2 });
    for (const z of [-0.6, 0, 0.6]) S.box(tb, [-0.55, 0.55], [TOP, TOP + 0.1], [z - 0.05, z + 0.05], { a: 0.6, tone: 1.3 });
    for (const z of [-0.3, 0.3]) S.lathe(chain(tb, translate(0, TOP, z)), [[0.16, 0], [0.16, 0.2], [0.09, 0.2]], 10, { a: 0.7, tone: 1.3 });
    // Mordazas
    for (const [x, z] of [[-1.05, -1.0], [-1.05, 1.0], [1.05, -1.0], [1.05, 1.0]]) S.box(tb, [x - 0.1, x + 0.1], [0.84, TOP + 0.12], [z - 0.14, z + 0.14], { a: 0.6, tone: 0.75 });

    /* --- Cinemática inversa: la antorcha baja vertical sobre el cordón --- */
    const u = t * 0.065;
    const tip = seam(u);
    const wc = [tip[0], tip[1] + TOOL + 0.03, tip[2]];
    const q1 = Math.atan2(-wc[2], wc[0]);
    const r = Math.hypot(wc[0], wc[2]), h = wc[1] - HS;
    const D = Math.min(L1 + L2 - 0.01, Math.hypot(r, h));
    const phi1 = Math.atan2(h, r) + Math.acos((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D));
    const phi2 = Math.atan2(h - L1 * Math.sin(phi1), r - L1 * Math.cos(phi1));
    const th1 = phi1 - Math.PI / 2, th2 = phi2 - Math.PI / 2;

    const T1 = rotY(q1);
    const Ts = chain(T1, translate(0, HS, 0));
    const Tu = chain(Ts, rotZ(th1));
    const Te = chain(Tu, translate(0, L1, 0), rotZ(th2 - th1));
    const Tw = chain(Te, translate(0, L2, 0), rotZ(Math.PI - th2));

    /* --- Base y torreta (eje 1) --- */
    S.box(translate(0, 0, 0), [-1.15, 1.15], [0, 0.14], [-1.15, 1.15], { a: 0.8, tone: 0.9, bias: 2.5 });
    for (const [x, z] of [[-0.95, -0.95], [0.95, -0.95], [0.95, 0.95], [-0.95, 0.95]]) S.lathe(translate(x, 0.14, z), [[0.09, 0], [0.09, 0.07]], 6, { a: 0.7, tone: 1.4 });
    S.lathe(translate(0, 0.14, 0), [[0.92, 0], [0.92, 0.2], [0.78, 0.32], [0.78, 0.5]], 20, { a: 0.8, bias: 1.2 });
    S.lathe(T1, [[0.74, 0.5], [0.74, 0.62], [0.6, 0.72], [0.6, 0.95]], 20, { a: 0.8, tone: 1.1 });
    // Horquilla del hombro y motor del eje 1
    S.box(T1, [-0.5, 0.5], [0.9, HS + 0.1], [-0.6, -0.42], { a: 0.75 });
    S.box(T1, [-0.5, 0.5], [0.9, HS + 0.1], [0.5, 0.62], { a: 0.75 });
    S.lathe(chain(T1, translate(-0.62, 0.62, 0), rotZ(Math.PI / 2)), [[0.24, -0.3], [0.24, 0.25], [0.18, 0.3]], 12, { a: 0.6, tone: 0.8 });

    /* --- Hombro (eje 2): carcasa de motor a los dos lados --- */
    S.lathe(chain(Ts, AXZ), [[0.3, -0.98], [0.36, -0.9], [0.36, -0.62], [0.46, -0.62], [0.46, 0.66], [0.3, 0.66], [0.3, 0.8]], 18, { a: 0.8, tone: 1.1 });
    S.lathe(chain(Ts, AXZ), [[0.12, 0.8], [0.12, 0.84]], 8, { a: 0.9, red: true, glow: 0.7 });

    /* --- Brazo (entre hombro y codo) --- */
    S.extrude(Tu, upper, 0.1, 0.44, { a: 0.85, tone: 1.1 }, { a: 0.3 });
    S.extrude(Tu, rib, 0.44, 0.5, { a: 0.4, tone: 1.35 }, { a: 0.15 });
    // Cilindro de compensación paralelo al brazo
    S.lathe(chain(Tu, translate(-0.34, 0.25, -0.2)), [[0.11, 0], [0.11, 1.15], [0.05, 1.15], [0.05, 1.75]], 10, { a: 0.6, tone: 0.9 });

    /* --- Codo (eje 3) y antebrazo --- */
    S.lathe(chain(Te, AXZ), [[0.34, -0.36], [0.34, 0.5], [0.24, 0.5], [0.24, 0.62]], 16, { a: 0.8, tone: 1.1 });
    S.box(Te, [-0.3, 0.3], [-0.5, 0.4], [-0.3, 0.08], { a: 0.8 });
    S.lathe(chain(Te, translate(0, -0.5, -0.11), rotX(Math.PI)), [[0.2, 0], [0.2, 0.42], [0.14, 0.48]], 12, { a: 0.6, tone: 0.8 });
    S.lathe(chain(Te, translate(0, 0, -0.11)), [[0.27, 0.4], [0.27, 0.52], [0.2, 0.62], [0.2, L2 - 0.42], [0.25, L2 - 0.36], [0.25, L2 - 0.2]], 16, { a: 0.8, tone: 1.15 });
    S.lathe(chain(Te, translate(0, 0, -0.11)), [[0.205, 1.0], [0.205, 1.06]], 16, { a: 0.9, red: true, glow: 0.6 });

    /* --- Muñeca (ejes 4–6), brida y antorcha --- */
    const Twz = chain(Te, translate(0, L2, -0.11));
    S.lathe(chain(Twz, AXZ), [[0.2, -0.26], [0.26, -0.2], [0.26, 0.2], [0.2, 0.26]], 14, { a: 0.8, tone: 1.2 });
    const Tt = chain(Tw, translate(0, 0, -0.11), rotY(t * 0.9));
    S.lathe(Tt, [[0.15, 0.12], [0.15, 0.26], [0.22, 0.26], [0.22, 0.33]], 14, { a: 0.85, tone: 1.2 });
    S.box(Tt, [-0.12, 0.12], [0.33, 0.52], [-0.12, 0.12], { a: 0.7 });
    S.lathe(Tt, [[0.085, 0.52], [0.085, 0.76], [0.055, 0.86], [0.03, TOOL]], 10, { a: 0.85, tone: 1.4 });
    // Carrete de hilo sobre el antebrazo
    S.lathe(chain(Te, translate(0, 0.95, 0.2), AXZ), [[0.2, 0], [0.2, 0.04], [0.09, 0.04], [0.09, 0.2], [0.2, 0.2], [0.2, 0.24]], 12, { a: 0.6, tone: 0.9 });

    /* --- Manguera a lo largo del brazo --- */
    const cable = [T1([-0.3, 1.0, 0.66])];
    for (let k = 0; k <= 5; k++) cable.push(Tu([-0.42 - Math.sin((k / 5) * Math.PI) * 0.12, 0.2 + (k / 5) * (L1 - 0.3), -0.02]));
    for (let k = 0; k <= 5; k++) cable.push(Te([-0.36 - Math.sin((k / 5) * Math.PI) * 0.16, 0.1 + (k / 5) * (L2 - 0.4), -0.2]));
    cable.push(Tt([0.14, 0.42, 0]));
    S.polyline(cable, { a: 0.75, lw: 2 });

    /* --- Cordón ya soldado: más brillante cerca de la antorcha --- */
    for (let k = 0; k < 90; k++) {
      const back = k / 90;
      const p = seam(u - back * 0.9), q = seam(u - (back + 1 / 90) * 0.9);
      S.line([p[0], p[1] + 0.012, p[2]], [q[0], q[1] + 0.012, q[2]], { red: true, a: 0.25 + 0.75 * (1 - back) ** 2, lw: 2.4 - back * 1.2, bias: -0.2 });
    }
    // Trayectoria pendiente
    for (let k = 0; k < 24; k += 2) {
      const p = seam(u + 0.01 + (k / 24) * 0.1), q = seam(u + 0.01 + ((k + 1) / 24) * 0.1);
      S.line([p[0], p[1] + 0.012, p[2]], [q[0], q[1] + 0.012, q[2]], { a: 0.45, bias: -0.2 });
    }

    /* --- Arco y chispas --- */
    const flick = 0.6 + 0.4 * Math.sin(t * 47) * Math.sin(t * 31);
    S.dot(tip, { red: true, a: 0.5 * flick, r: 7, round: true, bias: -0.4 });
    S.dot(tip, { a: 0.95, r: 2.2, round: true, bias: -0.5 });
    for (const s of sparks) {
      const life = (t * 1.6 + s.ph) % 1;
      const d = s.v * life * 0.55;
      const y = tip[1] + s.up * life * 0.5 - 1.9 * life * life * 0.5;
      if (y < TOP) continue;
      S.dot([tip[0] + Math.cos(s.a) * d, y, tip[2] + Math.sin(s.a) * d], { red: true, a: (1 - life) * 0.95, r: 1.3, bias: -0.4 });
    }

    S.render(ctx, cam, { alpha: grow });
  });
}
