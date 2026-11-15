/**
 * Portada en japonés — robótica aérea.
 * Cuadricóptero modelado en sólidos (fuselaje, brazos, motores, hélices, tren
 * de aterrizaje y cámara en cardán) que avanza sobre un terreno desconocido.
 * Su lidar barre el suelo y, detrás del haz, el relieve aparece ya convertido
 * en una malla sólida; delante solo hay puntos sueltos. La ruta por delante se
 * marca con balizas.
 */
import { scene, easeIn, clamp01, TAU } from '../kit.js';
import { Scene3D, orbit, chain, translate, rotX, rotY, rotZ, ngon } from '../kit3d.js';

const COLS = 25;
const ROWS = 32;
const DX = 0.34;
const DZ = 0.34;
const BACK = 24;       // filas ya escaneadas que siguen a la vista
const SPEED = 1.1;
const ALT = 3.1;
const ARM = 0.95;

/** Relieve: colinas, una cresta que serpentea y un valle. */
function height(x, z) {
  return (
    Math.sin(x * 0.5 + z * 0.28) * 0.5 +
    Math.sin(z * 0.4 - x * 0.22 + 1.7) * 0.4 +
    Math.sin(x * 1.2 + 0.5) * Math.cos(z * 0.85) * 0.18 +
    Math.exp(-((x - 2.4 + Math.sin(z * 0.22) * 1.5) ** 2) * 0.45) * 1.05 -
    Math.exp(-((x + 2.6 + Math.cos(z * 0.18) * 1.2) ** 2) * 0.5) * 0.45
  );
}

/** Perfil lateral del fuselaje (se extruye a lo ancho). */
const HULL = [[-0.66, -0.06], [-0.56, 0.1], [-0.2, 0.2], [0.28, 0.2], [0.6, 0.08], [0.7, -0.04], [0.5, -0.15], [-0.42, -0.15]];

export function create(canvas) {
  const S = new Scene3D();

  return scene(canvas, (ctx, W, H, t, ptr) => {
    const small = W < 640;
    const grow = easeIn(t, 0.1, 1.8);
    const cam = orbit({
      yaw: 0.78 + ptr.x * 0.28 + Math.sin(t * 0.12) * 0.1,
      pitch: 0.48 + ptr.y * 0.08,
      scale: Math.min(W, H) * (small ? 0.1 : 0.112),
      cx: W * 0.5,
      cy: H * (small ? 0.5 : 0.5),
      dist: 24,
      target: [0, 2.0, -2.2],
    });
    S.reset();

    const travel = t * SPEED;
    const shift = travel % DZ;
    const base = Math.floor(travel / DZ);
    const half = (COLS - 1) / 2;
    const hAt = (i, j) => height((i - half) * DX, (j + base) * DZ);
    const zAt = (j) => (j - BACK) * DZ - shift;

    /* --- Terreno: malla sólida donde ya pasó el lidar, puntos donde aún no --- */
    for (let j = 0; j < ROWS; j++) {
      const z0 = zAt(j), z1 = zAt(j + 1);
      const scanned = z1 <= 0.0001;
      const age = clamp01(-z1 / (BACK * DZ));
      for (let i = 0; i < COLS - 1; i++) {
        const x0 = (i - half) * DX, x1 = x0 + DX;
        if (scanned) {
          const fade = (1 - age) ** 0.8;
          const pts = [[x0, hAt(i, j), z0], [x1, hAt(i + 1, j), z0], [x1, hAt(i + 1, j + 1), z1], [x0, hAt(i, j + 1), z1]];
          const top = Math.max(pts[0][1], pts[2][1]);
          S.face(pts, [x0, -9, z0], { a: (0.2 + (top > 0.75 ? 0.4 : 0.12)) * fade, tone: 1.05 + top * 0.5, fa: 0.25 + 0.75 * fade, layer: -2 });
        } else if ((i + j + base) % 2 === 0) {
          S.dot([x0, hAt(i, j), z0], { a: 0.3, r: 0.9, layer: -2 });
        }
      }
    }

    /* --- Dron --- */
    const bob = Math.sin(t * 1.7) * 0.08;
    const sway = Math.sin(t * 0.5) * 0.45;
    const D = chain(translate(sway, ALT + bob, 0), rotZ(-Math.cos(t * 0.5) * 0.09), rotX(0.1 + Math.sin(t * 1.1) * 0.02));
    const hull = chain(D, rotY(-Math.PI / 2)); // el perfil del fuselaje mira hacia +Z (rumbo)

    // Brazos, motores y hélices
    [[1, 1], [1, -1], [-1, -1], [-1, 1]].forEach(([sx, sz], k) => {
      const yaw = Math.atan2(-sz, sx);
      const A = chain(D, rotY(yaw));
      S.box(A, [0.18, ARM * 1.38], [-0.02, 0.06], [-0.055, 0.055], { a: 0.8, tone: 1.1 });
      const Mt = chain(D, translate(sx * ARM, 0, sz * ARM));
      S.lathe(Mt, [[0.13, -0.08], [0.13, 0.12], [0.09, 0.17], [0.03, 0.17], [0.03, 0.24]], 12, { a: 0.85, tone: 1.25 });
      S.lathe(Mt, [[0.135, 0.02], [0.135, 0.05]], 12, { a: 0.9, red: sz > 0, glow: sz > 0 ? 0.7 : 0 });
      // Hélice: dos palas y el disco que deja al girar
      const spin = t * 38 * (k % 2 ? 1 : -1) + k;
      const P = chain(Mt, translate(0, 0.24, 0), rotY(spin));
      for (const dir of [1, -1]) {
        S.face([[0, 0, -0.03], [dir * 0.3, 0.012, -0.075], [dir * 0.62, 0.02, -0.03], [dir * 0.62, 0.02, 0.03], [dir * 0.3, 0.012, 0.06], [0, 0, 0.03]].map(P), null, { a: 0.7, tone: 1.5, both: true, fa: 0.85 });
      }
      S.polyline(ngon(26, 0.63).map(([x, z]) => Mt([x, 0.25, z])), { a: 0.22 }, true);
      S.polyline(ngon(20, 0.4).map(([x, z]) => Mt([x, 0.25, z])), { a: 0.1 }, true);
      // Pata bajo el motor
      S.box(Mt, [-0.025, 0.025], [-0.5, -0.08], [-0.025, 0.025], { a: 0.6, tone: 0.9 });
      S.lathe(chain(Mt, translate(0, -0.5, 0)), [[0.05, -0.04], [0.05, 0]], 6, { a: 0.6, tone: 0.8 });
    });

    // Fuselaje, cubierta, batería y antena
    S.extrude(hull, HULL, -0.24, 0.24, { a: 0.9, tone: 1.15 }, { a: 0.5, tone: 1.0 });
    S.box(D, [-0.17, 0.17], [0.2, 0.27], [-0.42, 0.12], { a: 0.7, tone: 0.8 });
    S.lathe(chain(D, translate(0, 0.27, -0.12)), [[0.13, 0], [0.13, 0.05], [0.07, 0.09]], 12, { a: 0.75, tone: 1.4 });
    S.line(D([0.1, 0.27, -0.45]), D([0.1, 0.62, -0.52]), { a: 0.8 });
    S.dot(D([0.1, 0.62, -0.52]), { red: 0.5 + 0.5 * Math.sin(t * 6) > 0.5, a: 0.9, r: 1.8 });
    S.box(D, [-0.245, -0.24], [-0.06, 0.1], [-0.3, 0.3], { a: 0.5, tone: 1.6 });
    S.box(D, [0.24, 0.245], [-0.06, 0.1], [-0.3, 0.3], { a: 0.5, tone: 1.6 });

    // Cardán con cámara y lidar bajo el morro
    const G = chain(D, translate(0, -0.2, 0.36));
    S.box(G, [-0.03, 0.03], [0, 0.08], [-0.03, 0.03], { a: 0.7 });
    S.lathe(G, [[0.02, -0.22], [0.11, -0.18], [0.14, -0.1], [0.11, -0.02], [0.03, 0]], 10, { a: 0.85, tone: 1.3 });
    S.lathe(chain(G, translate(0, -0.1, 0.12), rotX(Math.PI / 2)), [[0.07, 0], [0.07, 0.06]], 10, { a: 0.9, red: true, glow: 0.5 });
    const emitter = G([0, -0.22, 0]);

    /* --- Lidar: fila que se está midiendo y abanico de haces --- */
    const row = [];
    for (let i = 0; i < COLS; i++) {
      const x = (i - half) * DX;
      row.push([x, height(x, travel + BACK * DZ) + 0.01, 0]);
    }
    S.polyline(row, { red: true, a: 0.95, lw: 1.8, bias: -0.3 });
    for (let k = 0; k < COLS; k += 2) S.line(emitter, row[k], { red: true, a: 0.1, bias: -0.2 });
    const sweep = (Math.sin(t * 2.4) + 1) / 2;
    const hit = row[Math.round(sweep * (COLS - 1))];
    S.line(emitter, hit, { red: true, a: 0.8, lw: 1.4, bias: -0.3 });
    S.dot(hit, { red: true, a: 1, r: 3.2, bias: -0.5 });

    /* --- Ruta: balizas por delante y estela por detrás --- */
    for (let k = 1; k <= 4; k++) {
      const z = k * 2.3 - (travel % 2.3);
      const p = [Math.sin((travel + z) * 0.5 / SPEED) * 0.45, ALT, z];
      const far = clamp01(1 - z / 9.5);
      S.polyline(ngon(4, 0.22).map(([x, y]) => [p[0] + x, p[1] + y, p[2]]), { a: 0.7 * far }, true);
      S.line(p, [p[0], height(p[0], travel + BACK * DZ + z), z], { a: 0.16 * far, dash: [2, 5] });
    }
    for (let k = 0; k < 26; k++) {
      const z = -k * 0.34;
      const z2 = z - 0.2;
      const xa = Math.sin((t + z / SPEED) * 0.5) * 0.45, xb = Math.sin((t + z2 / SPEED) * 0.5) * 0.45;
      S.line([xa, ALT - 0.1, z - 0.7], [xb, ALT - 0.1, z2 - 0.7], { a: 0.4 * (1 - k / 26) });
    }

    S.render(ctx, cam, { alpha: grow });
  });
}
