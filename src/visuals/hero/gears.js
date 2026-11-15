/**
 * Portada en italiano — mecánica de precisión.
 * Tren de cinco engranajes macizos montados sobre una placa: engranan de verdad
 * (cada velocidad sale de la relación de dientes). El eje motriz lleva un plato
 * de manivela que, con una biela, mueve un pistón dentro de un cilindro en
 * corte, con aletas de refrigeración y bujía. Todo en sólidos con espesor.
 */
import { scene, easeIn, TAU } from '../kit.js';
import { Scene3D, orbit, chain, translate, rotX, rotZ, gearProfile, ngon } from '../kit3d.js';

const M = 0.11;                 // módulo
const AXZ = rotX(Math.PI / 2);  // eje de revolución → Z local
const FRONT = -0.2;             // cara delantera de los engranajes
const CRANK = 0.82;
const ROD = 2.95;

/** Engranajes: dientes, espesor y de quién reciben el giro (ángulo de montaje). */
const TRAIN = [
  { n: 24, x: 0, y: 0, from: -1, th: 0.4 },
  { n: 12, from: 0, at: 1.0, th: 0.5 },
  { n: 36, from: 0, at: Math.PI + 0.62, th: 0.34 },
  { n: 14, from: 2, at: -0.5, th: 0.46 },
  { n: 10, from: 1, at: 0.25, th: 0.4 },
];
TRAIN.forEach((g) => {
  g.profile = gearProfile(g.n, M);
  g.rp = (g.n * M) / 2;
  if (g.from < 0) return;
  const p = TRAIN[g.from];
  const d = ((p.n + g.n) * M) / 2;
  g.x = p.x + Math.cos(g.at) * d;
  g.y = p.y + Math.sin(g.at) * d;
});

/** Biela: dos ojos unidos por un cuerpo que se estrecha. */
function rodProfile(len) {
  const pts = [];
  for (let k = 0; k <= 8; k++) pts.push([Math.cos(Math.PI / 2 + (k / 8) * Math.PI) * 0.2, Math.sin(Math.PI / 2 + (k / 8) * Math.PI) * 0.2]);
  pts.push([0.3, -0.09], [len - 0.26, -0.07]);
  for (let k = 0; k <= 8; k++) pts.push([len + Math.cos(-Math.PI / 2 + (k / 8) * Math.PI) * 0.16, Math.sin(-Math.PI / 2 + (k / 8) * Math.PI) * 0.16]);
  pts.push([len - 0.26, 0.07], [0.3, 0.09]);
  return pts;
}

export function create(canvas) {
  const S = new Scene3D();
  const rod = rodProfile(ROD);

  return scene(canvas, (ctx, W, H, t, ptr) => {
    const small = W < 640;
    const grow = easeIn(t, 0.1, 1.8);
    const cam = orbit({
      yaw: 0.5 + ptr.x * 0.3 + Math.sin(t * 0.11) * 0.1,
      pitch: 0.2 + ptr.y * 0.12,
      scale: Math.min(W, H) * (small ? 0.1 : 0.112),
      cx: W * (small ? 0.5 : 0.52),
      cy: H * 0.5,
      dist: 20,
      target: [0.5, -0.3, 0],
    });
    S.reset();

    const angles = [];
    TRAIN.forEach((g, i) => {
      if (g.from < 0) angles[i] = t * 0.6;
      else {
        const p = TRAIN[g.from];
        angles[i] = g.at + Math.PI - Math.PI / g.n - ((angles[g.from] - g.at) * p.n) / g.n;
      }
    });

    /* --- Placa de montaje --- */
    S.box(translate(0, 0, 0), [-5.7, 2.3], [-3.9, 2.9], [0.42, 0.58], { a: 0.5, tone: 0.55, layer: -2 });
    for (const [x, y] of [[-5.4, -3.6], [2.0, -3.6], [2.0, 2.6], [-5.4, 2.6], [-1.7, 2.6], [-1.7, -3.6]]) {
      S.lathe(chain(translate(x, y, 0.42), AXZ), [[0.11, -0.07], [0.11, 0]], 6, { a: 0.6, tone: 1.2, layer: -1 });
    }
    // Líneas de centros grabadas en la placa
    TRAIN.forEach((g) => {
      if (g.from < 0) return;
      const p = TRAIN[g.from];
      S.line([p.x, p.y, 0.41], [g.x, g.y, 0.41], { a: 0.22, dash: [8, 4, 2, 4], layer: -1 });
    });

    /* --- Engranajes --- */
    TRAIN.forEach((g, i) => {
      const z0 = FRONT, z1 = FRONT + g.th;
      const T = chain(translate(g.x, g.y, 0), rotZ(angles[i]));
      const Tc = translate(g.x, g.y, 0);
      // Eje hasta la placa y casquillo trasero
      S.lathe(chain(Tc, AXZ), [[0.14, z1], [0.14, 0.42]], 10, { a: 0.5, tone: 0.9 });
      S.lathe(chain(Tc, AXZ), [[0.26, 0.3], [0.26, 0.42]], 12, { a: 0.5, tone: 0.8 });
      // Corona dentada
      S.extrude(T, g.profile, z0, z1, { a: 0.9, tone: 1.05 }, { a: 0.42, tone: 1.25 });
      // Rebaje del alma y aligeramientos (caras oscuras sobre la cara delantera)
      const behind = T([0, 0, z1]);
      const web = g.rp - 2.6 * M;
      if (g.n >= 14) {
        S.face(ngon(28, web).map(([x, y]) => T([x, y, z0 - 0.004])), behind, { a: 0.45, tone: 0.7, bias: -0.06 });
        const holes = g.n >= 30 ? 6 : 4;
        const hr = web * (g.n >= 30 ? 0.24 : 0.27);
        for (let k = 0; k < holes; k++) {
          const a = (k / holes) * TAU;
          const cx = Math.cos(a) * web * 0.62, cy = Math.sin(a) * web * 0.62;
          S.face(ngon(12, hr).map(([x, y]) => T([cx + x, cy + y, z0 - 0.008])), behind, { a: 0.6, tone: 0.18, bias: -0.1 });
        }
      }
      // Cubo, tuerca y chaveta
      const hub = Math.max(0.2, g.rp * 0.26);
      S.lathe(chain(T, AXZ), [[hub * 0.8, z0 - 0.14], [hub, z0 - 0.1], [hub, z0]], 14, { a: 0.8, tone: 1.3, bias: -0.14 });
      S.extrude(T, ngon(6, hub * 0.55), z0 - 0.24, z0 - 0.14, { a: 0.85, tone: 1.5, bias: -0.2 }, { a: 0.5, bias: -0.18 });
      S.dot(Tc([0, 0, z0 - 0.26]), { red: true, a: 0.95, r: 2, bias: -0.5 });
    });

    /* --- Plato de manivela, biela y pistón --- */
    const a = angles[0];
    const pin = [Math.cos(a) * CRANK, Math.sin(a) * CRANK];
    const px = pin[0] + Math.sqrt(ROD * ROD - pin[1] * pin[1]);
    const T0 = chain(translate(0, 0, 0), rotZ(a));
    S.lathe(chain(T0, AXZ), [[1.0, -0.6], [1.0, -0.5], [0.34, -0.5], [0.34, FRONT - 0.1]], 22, { a: 0.85, tone: 1.2, bias: -0.3 });
    const front = T0([0, 0, 0]);
    // Contrapeso y taladros del plato
    S.face([...Array(9)].map((_, k) => T0([Math.cos(Math.PI * 0.62 + (k / 8) * Math.PI * 0.76) * 0.9, Math.sin(Math.PI * 0.62 + (k / 8) * Math.PI * 0.76) * 0.9, -0.604])).concat([T0([-0.2, -0.3, -0.604]), T0([-0.2, 0.3, -0.604])]), front, { a: 0.5, tone: 0.5, bias: -0.36 });
    for (const ang of [1.3, -1.3]) S.face(ngon(10, 0.13).map(([x, y]) => T0([Math.cos(ang) * 0.6 + x, Math.sin(ang) * 0.6 + y, -0.606])), front, { a: 0.6, tone: 0.15, bias: -0.38 });
    S.lathe(chain(translate(pin[0], pin[1], 0), AXZ), [[0.1, -0.98], [0.14, -0.94], [0.14, -0.6]], 10, { a: 0.9, tone: 1.5, bias: -0.5 });

    const tilt = Math.atan2(-pin[1], px - pin[0]);
    S.extrude(chain(translate(pin[0], pin[1], 0), rotZ(tilt)), rod, -0.86, -0.72, { a: 0.9, tone: 1.35, bias: -0.42 }, { a: 0.4, bias: -0.4 });

    // Cilindro en corte: pared trasera, guías, culata, aletas y bujía
    const X0 = ROD - CRANK - 0.62, X1 = ROD + CRANK + 0.95;
    S.box(translate(0, 0, 0), [X0, X1], [-0.62, 0.62], [-0.36, -0.28], { a: 0.5, tone: 0.6, bias: 0.6 });
    for (const s of [-1, 1]) {
      S.box(translate(0, 0, 0), [X0, X1], s > 0 ? [0.5, 0.62] : [-0.62, -0.5], [-1.06, -0.36], { a: 0.8, tone: 1.0 });
      for (let k = 0; k < 10; k++) {
        const fx = X0 + 0.55 + k * ((X1 - X0 - 0.7) / 10);
        S.box(translate(0, 0, 0), [fx, fx + 0.06], s > 0 ? [0.62, 0.95] : [-0.95, -0.62], [-1.0, -0.42], { a: 0.55, tone: 1.2 });
      }
    }
    S.box(translate(0, 0, 0), [X1, X1 + 0.2], [-0.62, 0.62], [-1.06, -0.28], { a: 0.8, tone: 0.9 });
    S.lathe(chain(translate(X1 + 0.2, 0, -0.67), rotZ(-Math.PI / 2)), [[0.1, 0], [0.1, 0.12], [0.06, 0.16], [0.06, 0.42], [0.03, 0.46]], 8, { a: 0.75, tone: 1.4 });

    // Cámara: se enciende con la compresión
    const squeeze = ((px - (ROD - CRANK)) / (2 * CRANK)) ** 3;
    S.face([[px + 0.44, -0.5, -0.362], [X1, -0.5, -0.362], [X1, 0.5, -0.362], [px + 0.44, 0.5, -0.362]], [px, 0, 0.5], { a: 0.2, glow: 0.08 + squeeze * 0.75, red: true, bias: 0.3 });
    if (squeeze > 0.8) S.dot([X1 - 0.02, 0, -0.67], { red: true, a: 0.9, r: 5 * squeeze, round: true, bias: -0.6 });

    // Pistón con segmentos y bulón
    S.box(translate(px, 0, 0), [-0.44, 0.44], [-0.49, 0.49], [-1.02, -0.4], { a: 0.95, tone: 1.3, bias: -0.1 });
    for (const rx of [0.18, 0.3]) S.polyline([[px + rx, -0.49, -1.021], [px + rx, 0.49, -1.021]], { a: 0.8, red: true, bias: -0.5 });
    S.lathe(chain(translate(px, 0, 0), AXZ), [[0.1, -1.08], [0.1, -1.02]], 10, { a: 0.9, red: true, glow: 0.6, bias: -0.5 });

    S.render(ctx, cam, { alpha: grow });
  });
}
