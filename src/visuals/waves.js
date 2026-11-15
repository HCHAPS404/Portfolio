/**
 * Hackatón GDG Cartagena — bahía al atardecer.
 *
 * Línea de horizonte inspirada en Cartagena de Indias (fortaleza, muralla almenada, Torre
 * del Reloj con su esfera en marcha, cúpula y campanario), un sol de franjas, un mar de
 * perfiles ondulados con reflejo, un velero de vela roja y gaviotas. En el cielo, una
 * constelación dibuja los corchetes "< • >" del logo de Google Developer Groups.
 */
import { fitCanvas, visibleLoop, reduceMotion, rng } from '../core/dom.js';

const BG = '#0f0f12';
const INK = '237,235,230';
const RED = '238,46,51';

const TAU = Math.PI * 2;

export function createWaves(canvas) {
  let ctx, W, H;
  const R = rng(1533); // año de fundación de Cartagena
  const stars = Array.from({ length: 46 }, () => ({ x: R(), y: R() * 0.62, s: 0.6 + R() * 1.4, p: R() * TAU, f: 0.6 + R() * 1.6 }));
  const gulls = Array.from({ length: 4 }, (_, i) => ({ x: R(), y: 0.12 + R() * 0.2, v: 0.006 + R() * 0.006, size: 5 + R() * 4, p: R() * TAU + i }));

  function resize() {
    ({ ctx, width: W, height: H } = fitCanvas(canvas));
  }

  const stroke = (alpha, width = 1) => {
    ctx.strokeStyle = `rgba(${INK},${alpha})`;
    ctx.lineWidth = width;
  };

  /** Contorno cerrado relleno con el color de fondo (tapa lo que queda detrás) y trazado. */
  function solid(points, alpha = 0.9) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fillStyle = BG;
    ctx.fill();
    stroke(alpha);
    ctx.stroke();
  }

  /** Almenas a lo largo de un tramo de muralla. */
  function battlements(x0, x1, y, h, step) {
    const pts = [[x0, y]];
    for (let x = x0; x < x1; x += step * 2) {
      pts.push([x, y - h], [Math.min(x + step, x1), y - h], [Math.min(x + step, x1), y], [Math.min(x + step * 2, x1), y]);
    }
    return pts;
  }

  function skyline(horizon, t) {
    const u = H * 0.01; // unidad vertical
    const w = W * 0.01; // unidad horizontal

    // Fortaleza (izquierda): terrazas escalonadas con almenas
    const fort = [
      [w * 3, horizon], [w * 8, horizon - u * 5], [w * 13, horizon - u * 5],
      [w * 16, horizon - u * 9], [w * 22, horizon - u * 9], [w * 25, horizon - u * 6],
      [w * 31, horizon - u * 6], [w * 34, horizon],
    ];
    solid(fort);
    stroke(0.55);
    ctx.beginPath();
    for (let i = 0; i < 9; i++) {
      const x = w * (16.6 + i * 0.62);
      ctx.moveTo(x, horizon - u * 9);
      ctx.lineTo(x, horizon - u * 10.2);
    }
    ctx.stroke();

    // Muralla almenada
    solid([...battlements(w * 33, w * 78, horizon - u * 3.2, u * 1.1, w * 0.55), [w * 78, horizon], [w * 33, horizon]], 0.8);

    // Cúpula con tambor y linterna
    const dx = w * 60;
    const dr = w * 4.2;
    const base = horizon - u * 3.2;
    solid([[dx - dr, base], [dx - dr, base - u * 4], [dx + dr, base - u * 4], [dx + dr, base]]);
    ctx.beginPath();
    ctx.moveTo(dx - dr * 0.92, base - u * 4);
    ctx.bezierCurveTo(dx - dr * 0.92, base - u * 11.5, dx + dr * 0.92, base - u * 11.5, dx + dr * 0.92, base - u * 4);
    ctx.closePath();
    ctx.fillStyle = BG;
    ctx.fill();
    stroke(0.9);
    ctx.stroke();
    solid([[dx - w * 0.7, base - u * 9.6], [dx - w * 0.7, base - u * 12.6], [dx + w * 0.7, base - u * 12.6], [dx + w * 0.7, base - u * 9.6]]);
    ctx.beginPath();
    ctx.moveTo(dx, base - u * 12.6);
    ctx.lineTo(dx, base - u * 14.4);
    ctx.moveTo(dx - w * 0.4, base - u * 13.6);
    ctx.lineTo(dx + w * 0.4, base - u * 13.6);
    stroke(0.9);
    ctx.stroke();
    // ventanas del tambor
    ctx.beginPath();
    for (let i = -2; i <= 2; i++) {
      ctx.moveTo(dx + i * w * 1.5, base - u * 1.2);
      ctx.lineTo(dx + i * w * 1.5, base - u * 3.2);
    }
    stroke(0.55);
    ctx.stroke();

    // Campanario esbelto
    const bx = w * 69;
    const bw = w * 2.4;
    const bt = horizon - u * 14.5;
    solid([[bx - bw, base], [bx - bw, bt], [bx + bw, bt], [bx + bw, base]]);
    ctx.beginPath();
    ctx.moveTo(bx - bw * 0.35, bt + u * 3.6);
    ctx.lineTo(bx - bw * 0.35, bt + u * 1.8);
    ctx.arc(bx, bt + u * 1.8, bw * 0.35, Math.PI, 0);
    ctx.lineTo(bx + bw * 0.35, bt + u * 3.6);
    stroke(0.7);
    ctx.stroke();
    solid([[bx - bw * 1.1, bt], [bx, bt - u * 3.4], [bx + bw * 1.1, bt]]);

    // Torre del Reloj: cuerpo, arco, esfera con manecillas y remate
    const tx = w * 47;
    const tw = w * 3.6;
    const tt = horizon - u * 19;
    const tb = horizon - u * 2.2;
    solid([[tx - tw, tb], [tx - tw, tt], [tx + tw, tt], [tx + tw, tb]]);
    solid([[tx - tw * 1.18, tt], [tx - tw * 1.18, tt - u * 0.9], [tx + tw * 1.18, tt - u * 0.9], [tx + tw * 1.18, tt]]);
    // Cuerpo superior más angosto
    const t2 = tt - u * 6.5;
    solid([[tx - tw * 0.78, tt - u * 0.9], [tx - tw * 0.78, t2], [tx + tw * 0.78, t2], [tx + tw * 0.78, tt - u * 0.9]]);
    // Remate: cuello, cúpula y asta
    solid([[tx - tw * 0.55, t2], [tx - tw * 0.55, t2 - u * 1.6], [tx + tw * 0.55, t2 - u * 1.6], [tx + tw * 0.55, t2]]);
    ctx.beginPath();
    ctx.moveTo(tx - tw * 0.5, t2 - u * 1.6);
    ctx.bezierCurveTo(tx - tw * 0.5, t2 - u * 5.4, tx + tw * 0.5, t2 - u * 5.4, tx + tw * 0.5, t2 - u * 1.6);
    ctx.closePath();
    ctx.fillStyle = BG;
    ctx.fill();
    stroke(0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx, t2 - u * 4.6);
    ctx.lineTo(tx, t2 - u * 7);
    stroke(0.9);
    ctx.stroke();
    ctx.fillStyle = `rgb(${RED})`;
    ctx.fillRect(tx, t2 - u * 7, w * 1.1, u * 0.7);

    // Arco de la puerta
    ctx.beginPath();
    ctx.moveTo(tx - tw * 0.42, tb);
    ctx.lineTo(tx - tw * 0.42, tb - u * 4.4);
    ctx.arc(tx, tb - u * 4.4, tw * 0.42, Math.PI, 0);
    ctx.lineTo(tx + tw * 0.42, tb);
    stroke(0.75);
    ctx.stroke();

    // Esfera del reloj
    const cx = tx;
    const cy = t2 + (tt - t2) * 0.5 - u * 0.2;
    const cr = tw * 0.52;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, TAU);
    ctx.fillStyle = BG;
    ctx.fill();
    stroke(0.95);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      ctx.moveTo(cx + Math.cos(a) * cr * 0.78, cy + Math.sin(a) * cr * 0.78);
      ctx.lineTo(cx + Math.cos(a) * cr * 0.95, cy + Math.sin(a) * cr * 0.95);
    }
    stroke(0.6);
    ctx.stroke();
    // Manecillas (la horaria y la minutera avanzan despacio; el segundero, vivo)
    const sec = (t % 60) / 60;
    const min = (t / 60) % 60 / 60;
    const hour = (t / 3600) % 12 / 12;
    const hand = (frac, len, width, color) => {
      const a = frac * TAU - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * cr * len, cy + Math.sin(a) * cr * len);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    };
    hand(hour + 0.31, 0.5, 1.4, `rgba(${INK},0.95)`);
    hand(min + 0.55, 0.78, 1.1, `rgba(${INK},0.95)`);
    hand(sec, 0.86, 0.9, `rgb(${RED})`);

    // Ventanas de la torre
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const wy = tt + u * (1.4 + i * 3.4);
      ctx.moveTo(tx - tw * 0.5, wy);
      ctx.lineTo(tx - tw * 0.5, wy + u * 1.8);
      ctx.moveTo(tx + tw * 0.5, wy);
      ctx.lineTo(tx + tw * 0.5, wy + u * 1.8);
    }
    stroke(0.5);
    ctx.stroke();
  }

  function draw(now) {
    const t = reduceMotion ? 9 : now / 1000;
    const horizon = H * 0.5;
    const small = W < 540;
    ctx.clearRect(0, 0, W, H);
    ctx.lineJoin = 'round';

    // --- Estrellas dispersas
    for (const s of stars) {
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.f + s.p));
      ctx.fillStyle = `rgba(${INK},${(tw * 0.65).toFixed(3)})`;
      ctx.fillRect(s.x * W, s.y * H, s.s, s.s);
    }

    // --- Constelación "< • >" (corchetes de GDG)
    const k = Math.min(W, H) * 0.095;
    const cx = W * (small ? 0.3 : 0.27);
    const cy = H * 0.2;
    const star = [
      [-1.0, 0], [-0.3, -0.7], [-0.3, 0.7],   // <
      [0, 0],                                  // •
      [1.0, 0], [0.3, -0.7], [0.3, 0.7],       // >
    ].map(([x, y]) => [cx + x * k, cy + y * k]);
    const lines = [[0, 1], [0, 2], [4, 5], [4, 6]];
    stroke(0.28);
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    for (const [a, b] of lines) {
      ctx.moveTo(star[a][0], star[a][1]);
      ctx.lineTo(star[b][0], star[b][1]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    star.forEach(([x, y], i) => {
      const glow = 0.55 + 0.45 * Math.sin(t * 1.4 + i * 0.9);
      const isCore = i === 3;
      ctx.fillStyle = isCore ? `rgba(${RED},${(0.65 + glow * 0.35).toFixed(2)})` : `rgba(${INK},${(0.55 + glow * 0.45).toFixed(2)})`;
      const size = isCore ? 6 : 3.4;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      if (isCore) {
        ctx.strokeStyle = `rgba(${RED},${((1 - ((t * 0.5) % 1)) * 0.6).toFixed(3)})`;
        const r = 5 + ((t * 0.5) % 1) * 16;
        ctx.strokeRect(x - r, y - r, r * 2, r * 2);
      }
    });

    // --- Sol de franjas, medio hundido en el horizonte
    const sunR = Math.min(W, H) * 0.21;
    const sunX = W * 0.68;
    const sunY = horizon - sunR * 0.1;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, horizon);
    ctx.clip();
    const period = 9;
    const drift = (t * 5) % period;
    for (let y = -sunR; y < sunR; y += period) {
      const yy = y + drift;
      const frac = (yy + sunR) / (sunR * 2); // 0 arriba → 1 abajo
      if (frac < 0 || frac > 1) continue;
      const half = Math.sqrt(Math.max(0, sunR * sunR - yy * yy));
      const th = frac < 0.38 ? period : Math.max(1.2, period * (1 - (frac - 0.38) * 1.5));
      ctx.fillStyle = `rgba(${INK},${(0.95 - frac * 0.5).toFixed(2)})`;
      ctx.fillRect(sunX - half, sunY + yy, half * 2, th);
    }
    ctx.restore();

    // --- Horizonte de la ciudad (tapa el sol)
    skyline(horizon, t);
    stroke(0.55);
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(W, horizon);
    ctx.stroke();

    // --- Mar: perfiles ondulados de lejos a cerca, con oclusión y reflejo
    const ROWS = small ? 22 : 30;
    const STEP = small ? 7 : 6;
    let boat = null;
    const boatRow = Math.floor(ROWS * 0.55);
    const boatX = W * (0.34 + 0.08 * Math.sin(t * 0.09));

    for (let r = 0; r < ROWS; r++) {
      const depth = r / (ROWS - 1); // 0 junto al horizonte → 1 cerca
      const persp = depth ** 1.75;
      const y0 = horizon + 4 + persp * (H - horizon) * 1.02;
      const amp = 1.4 + depth * 15;
      const pts = [];
      for (let x = -STEP; x <= W + STEP; x += STEP) {
        const wave =
          Math.sin(x * 0.021 + t * 1.15 + r * 0.7) * 0.6 +
          Math.sin(x * 0.047 - t * 0.85 + r * 1.3) * 0.28 +
          Math.sin(x * 0.009 + t * 0.5 - r * 0.4) * 0.5;
        pts.push([x, y0 + wave * amp]);
      }

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.lineTo(W + STEP, H + 2);
      ctx.lineTo(-STEP, H + 2);
      ctx.closePath();
      ctx.fillStyle = BG;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      stroke(0.12 + depth * 0.52);
      ctx.stroke();

      // Reflejo del sol: tramos más claros bajo el astro
      const spread = sunR * (0.55 + persp * 1.6);
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i < pts.length; i++) {
        const near = Math.abs(pts[i][0] - sunX) < spread * (0.55 + 0.45 * Math.sin(i * 0.7 + r + t * 1.6));
        if (near) {
          if (pen) ctx.lineTo(pts[i][0], pts[i][1]);
          else ctx.moveTo(pts[i][0], pts[i][1]);
          pen = true;
        } else pen = false;
      }
      stroke(0.35 + depth * 0.6, 1.3);
      ctx.stroke();

      // Velero: se dibuja sobre su fila y las siguientes lo tapan parcialmente
      if (r === boatRow) {
        const idx = Math.min(pts.length - 2, Math.max(1, Math.round((boatX + STEP) / STEP)));
        const slope = (pts[idx + 1][1] - pts[idx - 1][1]) / (STEP * 2);
        boat = { x: boatX, y: pts[idx][1], tilt: Math.atan(slope) * 1.4, scale: 0.55 + persp * 1.9 };
      }
    }

    if (boat) {
      const s = boat.scale * Math.min(W, H) * 0.075;
      ctx.save();
      ctx.translate(boat.x, boat.y);
      ctx.rotate(boat.tilt);
      // Casco
      const hull = [[-s * 0.9, -s * 0.12], [s * 0.95, -s * 0.12], [s * 0.62, s * 0.2], [-s * 0.62, s * 0.2]];
      solid(hull, 0.95);
      // Mástil
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.12);
      ctx.lineTo(0, -s * 1.5);
      stroke(0.95);
      ctx.stroke();
      // Vela mayor roja
      ctx.beginPath();
      ctx.moveTo(s * 0.04, -s * 1.42);
      ctx.lineTo(s * 0.04, -s * 0.2);
      ctx.lineTo(s * 0.82, -s * 0.2);
      ctx.closePath();
      ctx.fillStyle = `rgba(${RED},0.92)`;
      ctx.fill();
      // Foque
      ctx.beginPath();
      ctx.moveTo(-s * 0.04, -s * 1.28);
      ctx.lineTo(-s * 0.04, -s * 0.2);
      ctx.lineTo(-s * 0.7, -s * 0.2);
      ctx.closePath();
      stroke(0.9);
      ctx.stroke();
      ctx.restore();

      // Estela
      stroke(0.35);
      for (let i = 0; i < 3; i++) {
        const off = ((t * 0.5 + i / 3) % 1);
        ctx.beginPath();
        ctx.moveTo(boat.x - s * (0.9 + off * 2.2), boat.y + s * (0.22 + i * 0.07));
        ctx.lineTo(boat.x - s * (1.3 + off * 2.6), boat.y + s * (0.22 + i * 0.07));
        ctx.globalAlpha = 1 - off;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // --- Gaviotas
    for (const g of gulls) {
      const gx = ((g.x + t * g.v) % 1.2 - 0.1) * W;
      const gy = H * g.y + Math.sin(t * 0.7 + g.p) * 6;
      const flap = Math.sin(t * 5 + g.p) * 0.5;
      const s = g.size;
      ctx.beginPath();
      ctx.moveTo(gx - s, gy + flap * s * 0.6);
      ctx.quadraticCurveTo(gx - s * 0.4, gy - s * (0.5 + flap * 0.5), gx, gy);
      ctx.quadraticCurveTo(gx + s * 0.4, gy - s * (0.5 + flap * 0.5), gx + s, gy + flap * s * 0.6);
      stroke(0.7);
      ctx.stroke();
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return visibleLoop(canvas, draw, { fps: 45 });
}
