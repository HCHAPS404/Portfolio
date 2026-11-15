/**
 * NAVIRA-SATViRe — escena de alerta temprana de deslizamientos.
 *
 * Una ladera en perspectiva dibujada como perfiles apilados (con oclusión). Cuatro
 * sensores en mástil y una pasarela en la cumbre se hablan por radio; la pasarela
 * enlaza con un satélite en órbita. Un ciclo de ~15 s cuenta la historia completa:
 * calma → la lluvia arrecia → el suelo cede (la ladera se deforma de verdad y los
 * escombros bajan) → alarma por satélite → recuperación.
 */
import { fitCanvas, visibleLoop, reduceMotion, rng } from '../core/dom.js';

const BG = '#0f0f12';
const INK = '237,235,230';
const RED = '238,46,51';
const CYCLE = 15; // segundos

const NX = 124;
const NZ = 44;
const X_MIN = -1.9;
const X_MAX = 1.9;
const Z_MIN = 0.78;
const Z_MAX = 4.3;

const NODES = [
  { x: 0.34, z: 2.5 },   // dentro de la zona inestable
  { x: -0.12, z: 2.95 },
  { x: 0.95, z: 2.7 },
  { x: -0.82, z: 2.15 },
];
const GATEWAY = { x: 0.5, z: 3.5 };
const SLIP = { x: 0.36, z: 2.55 }; // centro de la masa que cede

const smooth = (a, b, v) => {
  const k = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/** Altura base del terreno. */
function ground(x, z) {
  const ridge = 0.62 * Math.exp(-((z - 3.55) ** 2) * 0.85) * (0.72 + 0.28 * Math.sin(x * 1.7 + 0.7));
  const peak = 0.95 * Math.exp(-((x - 0.5) ** 2 * 1.5 + (z - 3.3) ** 2 * 1.25));
  const shoulder = 0.42 * Math.exp(-((x + 1.05) ** 2 * 2.2 + (z - 3.1) ** 2 * 1.1));
  const valley = -0.3 * Math.exp(-((x + 0.85) ** 2) * 6) * Math.exp(-((z - 2.1) ** 2) * 0.18);
  const rough =
    Math.sin(x * 5.3 + z * 2.9) * 0.028 +
    Math.sin(x * 11.7 - z * 7.1 + 1.3) * 0.016 +
    Math.sin(x * 2.1 + z * 1.4) * 0.05;
  return ridge + peak + shoulder + valley + rough;
}

/** Inestabilidad (0..1) alrededor de la masa que cede. */
const instability = (x, z) => Math.exp(-(((x - SLIP.x) / 0.62) ** 2 + ((z - SLIP.z) / 0.5) ** 2));

export function createTerrain(canvas) {
  let ctx, W, H;
  const R = rng(2026);
  // Gotas de lluvia: posiciones y velocidades fijas, el movimiento sale del tiempo
  const drops = Array.from({ length: 150 }, () => ({ x: R(), y: R(), v: 0.35 + R() * 0.55, len: 6 + R() * 10, a: 0.12 + R() * 0.3 }));
  // Escombros: cada uno recorre la ladera con su fase y su deriva
  const debris = Array.from({ length: 90 }, () => ({ off: R(), dx: (R() - 0.5) * 0.75, sp: 0.5 + R() * 0.7, s: 1.4 + R() * 2.4 }));

  function resize() {
    ({ ctx, width: W, height: H } = fitCanvas(canvas));
  }

  // Cámara
  let sway = 0;
  let focal = 1;
  let baseY = 0;
  const proj = (x, y, z) => ({
    sx: W / 2 + ((x + sway) / z) * focal,
    sy: baseY + ((1.05 - y) / z) * focal * 0.62,
  });

  function draw(now) {
    const clock = reduceMotion ? 10.3 : (now / 1000) % CYCLE;
    const t = reduceMotion ? 10.3 : now / 1000;

    const rain = 0.22 + 0.78 * smooth(4, 7, clock) * (1 - smooth(11.2, 13.5, clock));
    const warn = smooth(6, 8, clock) * (1 - smooth(12.3, 13.6, clock));
    const slide = smooth(8, 10.4, clock) * (1 - smooth(11.6, 14.4, clock));
    const alarm = smooth(9, 10, clock) * (1 - smooth(13, 14.6, clock));

    sway = Math.sin(t * 0.18) * 0.07;
    focal = W * 0.64;
    baseY = H * 0.2;
    ctx.clearRect(0, 0, W, H);
    ctx.lineJoin = 'round';

    // --- Cielo: órbita tenue del satélite
    const sat = {
      x: W * (0.8 + 0.085 * Math.cos(t * 0.22)),
      y: H * (0.13 + 0.045 * Math.sin(t * 0.22)),
    };
    ctx.strokeStyle = `rgba(${INK},0.1)`;
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    ctx.ellipse(W * 0.8, H * 0.13, W * 0.085, H * 0.045, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- Terreno: de lejos a cerca, con oclusión
    for (let iz = NZ - 1; iz >= 0; iz--) {
      const f = iz / (NZ - 1);
      const z = Z_MIN + f * (Z_MAX - Z_MIN);
      const depth = 1 - f; // 1 = cerca
      const pts = new Array(NX);
      const inst = new Float32Array(NX);

      for (let ix = 0; ix < NX; ix++) {
        const x = X_MIN + (ix / (NX - 1)) * (X_MAX - X_MIN);
        const u = instability(x, z);
        let y = ground(x, z);
        // La ladera cede: se hunde la zona inestable y se amontona el material abajo
        y -= 0.24 * slide * u;
        y += 0.15 * slide * Math.exp(-(((x - SLIP.x - 0.04) / 0.55) ** 2 + ((z - 1.9) / 0.34) ** 2));
        // Sacudida mínima durante el deslizamiento
        y += slide * u * 0.012 * Math.sin(t * 38 + x * 20);
        pts[ix] = proj(x, y, z);
        inst[ix] = u;
      }

      // Oclusión: tapa lo que queda detrás
      ctx.beginPath();
      ctx.moveTo(pts[0].sx, pts[0].sy);
      for (let ix = 1; ix < NX; ix++) ctx.lineTo(pts[ix].sx, pts[ix].sy);
      ctx.lineTo(pts[NX - 1].sx, H + 2);
      ctx.lineTo(pts[0].sx, H + 2);
      ctx.closePath();
      ctx.fillStyle = BG;
      ctx.fill();

      // Perfil
      ctx.beginPath();
      ctx.moveTo(pts[0].sx, pts[0].sy);
      for (let ix = 1; ix < NX; ix++) ctx.lineTo(pts[ix].sx, pts[ix].sy);
      ctx.strokeStyle = `rgba(${INK},${(0.1 + depth * 0.5).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Tramo inestable en rojo (más intenso cuanto más cerca de ceder)
      let pen = false;
      ctx.beginPath();
      for (let ix = 0; ix < NX; ix++) {
        if (inst[ix] > 0.22) {
          if (pen) ctx.lineTo(pts[ix].sx, pts[ix].sy);
          else ctx.moveTo(pts[ix].sx, pts[ix].sy);
          pen = true;
        } else pen = false;
      }
      const redAlpha = 0.28 + 0.72 * Math.max(warn * 0.7, slide);
      ctx.strokeStyle = `rgba(${RED},${redAlpha.toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Puntos de relieve (textura de nube de puntos)
      if (iz % 2 === 0) {
        ctx.fillStyle = `rgba(${INK},${(0.18 + depth * 0.5).toFixed(3)})`;
        const size = 0.7 + depth * 1.5;
        for (let ix = iz % 4 === 0 ? 0 : 2; ix < NX; ix += 4) {
          if (inst[ix] > 0.3 && warn > 0.1) continue;
          ctx.fillRect(pts[ix].sx - size / 2, pts[ix].sy - size / 2, size, size);
        }
      }
    }

    // --- Escombros que bajan por la ladera
    if (slide > 0.02) {
      for (const d of debris) {
        const u = (t * 0.32 * d.sp + d.off) % 1;
        const z = SLIP.z - 0.25 - u * 1.25;
        const x = SLIP.x + d.dx * (0.4 + u) + Math.sin(u * 7 + d.off * 9) * 0.05;
        const y = ground(x, z) - 0.24 * slide * instability(x, z) + 0.03;
        const p = proj(x, y, z);
        const a = Math.sin(u * Math.PI) * slide;
        ctx.fillStyle = `rgba(${RED},${a.toFixed(3)})`;
        ctx.fillRect(p.sx - d.s / 2, p.sy - d.s / 2, d.s, d.s);
        // Estela
        ctx.fillStyle = `rgba(${RED},${(a * 0.4).toFixed(3)})`;
        ctx.fillRect(p.sx - d.s / 2, p.sy - d.s * 2.2, d.s * 0.7, d.s * 1.6);
      }
    }

    // --- Sensores en mástil, con enlaces de radio
    const top = (node, mast) => {
      const y = ground(node.x, node.z) - 0.24 * slide * instability(node.x, node.z);
      const p = proj(node.x, y, node.z);
      return { ...p, tipY: p.sy - mast };
    };
    const gw = top(GATEWAY, 40);
    const sensors = NODES.map((n) => top(n, 20));

    // Enlaces nodo → pasarela (curvas punteadas con paquetes de datos)
    sensors.forEach((s, i) => {
      const midX = (s.sx + gw.sx) / 2;
      const midY = Math.min(s.tipY, gw.tipY) - 22 - i * 4;
      ctx.beginPath();
      ctx.moveTo(s.sx, s.tipY);
      ctx.quadraticCurveTo(midX, midY, gw.sx, gw.tipY);
      ctx.strokeStyle = `rgba(${INK},${(0.16 + warn * 0.3).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.lineDashOffset = -t * 14;
      ctx.stroke();
      ctx.setLineDash([]);

      // Paquete viajando por el enlace
      const k = (t * (0.35 + warn * 0.5) + i * 0.27) % 1;
      const bx = (1 - k) * (1 - k) * s.sx + 2 * (1 - k) * k * midX + k * k * gw.sx;
      const by = (1 - k) * (1 - k) * s.tipY + 2 * (1 - k) * k * midY + k * k * gw.tipY;
      ctx.fillStyle = `rgba(${RED},${(0.5 + warn * 0.5).toFixed(2)})`;
      ctx.fillRect(bx - 1.6, by - 1.6, 3.2, 3.2);
    });

    sensors.forEach((s, i) => {
      const hot = i === 0 ? Math.max(warn, slide) : warn * 0.45;
      const blink = Math.sin(t * (4 + hot * 12) + i * 1.9) > 0;
      ctx.strokeStyle = `rgba(${INK},0.6)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s.sx, s.sy);
      ctx.lineTo(s.sx, s.tipY);
      ctx.stroke();
      ctx.fillStyle = hot > 0.3 && blink ? `rgb(${RED})` : `rgba(${RED},0.4)`;
      ctx.fillRect(s.sx - 3, s.tipY - 3, 6, 6);
      if (hot > 0.3) {
        const pulse = (t * (0.9 + hot)) % 1;
        const r = 5 + pulse * 18;
        ctx.strokeStyle = `rgba(${RED},${((1 - pulse) * hot).toFixed(3)})`;
        ctx.strokeRect(s.sx - r, s.tipY - r, r * 2, r * 2);
      }
    });

    // --- Pasarela en la cumbre: antena y ondas de difusión
    ctx.strokeStyle = `rgba(${INK},0.85)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(gw.sx, gw.sy);
    ctx.lineTo(gw.sx, gw.tipY);
    ctx.moveTo(gw.sx - 6, gw.tipY + 8);
    ctx.lineTo(gw.sx, gw.tipY - 2);
    ctx.lineTo(gw.sx + 6, gw.tipY + 8);
    ctx.stroke();
    ctx.fillStyle = alarm > 0.2 ? `rgb(${RED})` : `rgba(${INK},0.9)`;
    ctx.fillRect(gw.sx - 3, gw.tipY - 5, 6, 6);

    if (alarm > 0.05) {
      for (let k = 0; k < 3; k++) {
        const ph = (t * 0.7 + k / 3) % 1;
        const rad = 8 + ph * Math.min(W, H) * 0.34;
        ctx.strokeStyle = `rgba(${RED},${((1 - ph) * 0.8 * alarm).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(gw.sx, gw.tipY - 2, rad, Math.PI * 1.12, Math.PI * 1.88);
        ctx.stroke();
      }
    }

    // --- Satélite y enlace descendente
    const link = alarm > 0.05 || warn > 0.4;
    ctx.beginPath();
    ctx.moveTo(gw.sx, gw.tipY - 3);
    ctx.lineTo(sat.x, sat.y + 5);
    ctx.strokeStyle = `rgba(${link ? RED : INK},${link ? (0.35 + alarm * 0.5).toFixed(2) : '0.08'})`;
    ctx.setLineDash([4, 6]);
    ctx.lineDashOffset = -t * 30;
    ctx.stroke();
    ctx.setLineDash([]);
    if (alarm > 0.05) {
      const k = (t * 0.8) % 1;
      const px = gw.sx + (sat.x - gw.sx) * k;
      const py = gw.tipY - 3 + (sat.y + 5 - gw.tipY + 3) * k;
      ctx.fillStyle = `rgb(${RED})`;
      ctx.fillRect(px - 2, py - 2, 4, 4);
    }

    ctx.save();
    ctx.translate(sat.x, sat.y);
    ctx.rotate(Math.sin(t * 0.22) * 0.3);
    ctx.strokeStyle = `rgba(${INK},0.95)`;
    ctx.lineWidth = 1;
    ctx.strokeRect(-4, -4, 8, 8);
    ctx.strokeRect(-19, -2.5, 12, 5);
    ctx.strokeRect(7, -2.5, 12, 5);
    ctx.beginPath();
    ctx.moveTo(-13, -2.5); ctx.lineTo(-13, 2.5);
    ctx.moveTo(13, -2.5); ctx.lineTo(13, 2.5);
    ctx.stroke();
    ctx.fillStyle = alarm > 0.2 ? `rgb(${RED})` : `rgba(${INK},0.9)`;
    ctx.fillRect(-1.5, -1.5, 3, 3);
    ctx.restore();

    // --- Lluvia por delante de todo
    const active = Math.floor(drops.length * rain);
    ctx.lineWidth = 1;
    for (let i = 0; i < active; i++) {
      const d = drops[i];
      const x = ((d.x * W + t * W * 0.06 * d.v) % (W + 40)) - 10;
      const y = ((d.y * (H + 30) + t * H * 0.55 * d.v) % (H + 30)) - 10;
      ctx.strokeStyle = `rgba(${INK},${(d.a * (0.4 + rain * 0.6)).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - d.len * 0.28, y + d.len);
      ctx.stroke();
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return visibleLoop(canvas, draw, { fps: 45 });
}
