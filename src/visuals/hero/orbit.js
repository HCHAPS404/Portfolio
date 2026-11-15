/**
 * Portada en francés — aeroespacial.
 * Globo terrestre hecho de puntos que gira despacio; tres satélites lo orbitan
 * y abren enlaces con las estaciones de tierra que tienen a la vista. Por cada
 * enlace viaja un pulso de datos.
 */
import { scene, camera, ink, red, bg, easeIn, TAU, path } from '../kit.js';
import { rng } from '../../core/dom.js';

const POINTS = 2600;
const ORBITS = [
  { r: 1.42, inc: 0.5, node: 0.3, speed: 0.42, phase: 0 },
  { r: 1.7, inc: -0.95, node: 1.9, speed: 0.3, phase: 2.1 },
  { r: 2.05, inc: 1.35, node: 4.1, speed: 0.22, phase: 4.4 },
];

/** Continentes inventados: un campo suave que decide dónde hay tierra. */
function land(lat, lon) {
  return (
    Math.sin(lon * 2 + 0.6) * Math.cos(lat * 2.4) +
    Math.sin(lon * 5 + lat * 3) * 0.45 +
    Math.cos(lon * 3 - lat * 4 + 1.3) * 0.35
  );
}

const sphere = (lat, lon, r = 1) => [
  Math.cos(lat) * Math.cos(lon) * r,
  Math.sin(lat) * r,
  Math.cos(lat) * Math.sin(lon) * r,
];

export function create(canvas) {
  const R = rng(1957); // año del primer satélite
  const dots = [];
  for (let i = 0; i < POINTS; i++) {
    const lat = Math.asin(1 - (2 * (i + 0.5)) / POINTS);
    const lon = i * 2.39996323;
    const isLand = land(lat, lon) > 0.08;
    if (isLand || R() < 0.2) dots.push({ lat, lon, isLand });
  }
  const stations = [];
  while (stations.length < 7) {
    const lat = (R() - 0.5) * 2.2;
    const lon = R() * TAU;
    if (land(lat, lon) > 0.08) stations.push({ lat, lon });
  }

  return scene(canvas, (ctx, W, H, t, ptr) => {
    const small = W < 640;
    const grow = easeIn(t, 0.1, 2.2);
    const unit = Math.min(W, H) * (small ? 0.2 : 0.2);
    const proj = camera({
      yaw: ptr.x * 0.3,
      pitch: 0.32 + ptr.y * 0.12,
      scale: unit,
      cx: W * (small ? 0.5 : 0.52),
      cy: H * 0.5,
      dist: 9,
    });
    const spin = t * 0.09;
    const center = proj(0, 0, 0);
    const discR = unit * 1.02;

    /* --- Órbitas y posición de cada satélite --- */
    const orbitPoint = (o, a) => {
      const x = Math.cos(a) * o.r, z = Math.sin(a) * o.r;
      const y = z * Math.sin(o.inc), z2 = z * Math.cos(o.inc);
      const cn = Math.cos(o.node), sn = Math.sin(o.node);
      return [x * cn - z2 * sn, y, x * sn + z2 * cn];
    };
    const hidden = (p) => p[2] > 0 && Math.hypot(p[0] - center[0], p[1] - center[1]) < discR;

    const sats = ORBITS.map((o) => {
      const world = orbitPoint(o, o.phase + t * o.speed);
      return { o, world, screen: proj(...world) };
    });

    // Mitad lejana de las órbitas (queda detrás del globo)
    const drawOrbit = (o, far) => {
      ctx.beginPath();
      let pen = false;
      for (let k = 0; k <= 120; k++) {
        const p = proj(...orbitPoint(o, (k / 120) * TAU));
        const skip = far ? p[2] <= 0 || hidden(p) : p[2] > 0;
        if (skip) {
          pen = false;
          continue;
        }
        if (pen) ctx.lineTo(p[0], p[1]);
        else ctx.moveTo(p[0], p[1]);
        pen = true;
      }
      ctx.strokeStyle = ink((far ? 0.1 : 0.26) * grow);
      ctx.lineWidth = 1;
      ctx.stroke();
    };
    ORBITS.forEach((o) => drawOrbit(o, true));

    /* --- Globo --- */
    ctx.beginPath();
    ctx.arc(center[0], center[1], discR, 0, TAU);
    ctx.fillStyle = bg(0.82);
    ctx.fill();
    ctx.strokeStyle = ink(0.16 * grow);
    ctx.stroke();

    const shown = Math.floor(dots.length * grow);
    for (let i = 0; i < shown; i++) {
      const d = dots[i];
      const p = proj(...sphere(d.lat, d.lon + spin));
      if (p[2] > 0.05) continue; // cara oculta
      const facing = Math.min(1, -p[2] + 0.15);
      const size = d.isLand ? 2.2 : 1.2;
      ctx.fillStyle = ink(d.isLand ? 0.25 + 0.7 * facing : 0.1 + 0.18 * facing);
      ctx.fillRect(p[0] - size / 2, p[1] - size / 2, size, size);
    }

    /* --- Estaciones y enlaces --- */
    for (const [si, s] of stations.entries()) {
      const w = sphere(s.lat, s.lon + spin);
      const p = proj(...w);
      if (p[2] > -0.08) continue;
      ctx.strokeStyle = red(0.9 * grow);
      ctx.lineWidth = 1.2;
      ctx.strokeRect(p[0] - 4, p[1] - 4, 8, 8);
      ctx.fillStyle = red(0.9 * grow);
      ctx.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3);

      for (const sat of sats) {
        // Enlace solo si el satélite está sobre el horizonte de la estación
        const dx = sat.world[0] - w[0], dy = sat.world[1] - w[1], dz = sat.world[2] - w[2];
        const dist = Math.hypot(dx, dy, dz);
        const elevation = (dx * w[0] + dy * w[1] + dz * w[2]) / dist;
        if (elevation < 0.35 || hidden(sat.screen)) continue;
        const strength = Math.min(1, (elevation - 0.35) * 3) * grow;
        path(ctx, [p, sat.screen]);
        ctx.strokeStyle = red(0.4 * strength);
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        const u = (t * 0.9 + si * 0.37) % 1;
        ctx.fillStyle = red(strength);
        ctx.fillRect(p[0] + (sat.screen[0] - p[0]) * u - 2, p[1] + (sat.screen[1] - p[1]) * u - 2, 4, 4);
      }
    }

    /* --- Mitad cercana de las órbitas y satélites --- */
    ORBITS.forEach((o) => drawOrbit(o, false));
    for (const sat of sats) {
      if (hidden(sat.screen)) continue;
      const [x, y, d] = sat.screen;
      const k = (d > 0 ? 0.6 : 1) * (small ? 0.8 : 1);
      ctx.fillStyle = bg(1);
      ctx.strokeStyle = ink(0.9 * grow);
      ctx.lineWidth = 1.3;
      ctx.fillRect(x - 4 * k, y - 4 * k, 8 * k, 8 * k);
      ctx.strokeRect(x - 4 * k, y - 4 * k, 8 * k, 8 * k);
      // Paneles solares
      for (const side of [-1, 1]) {
        ctx.strokeRect(x + side * 7 * k - (side < 0 ? 12 * k : 0), y - 2.5 * k, 12 * k, 5 * k);
        path(ctx, [[x + side * (13 * k), y - 2.5 * k], [x + side * (13 * k), y + 2.5 * k]]);
        ctx.stroke();
      }
    }
  });
}
