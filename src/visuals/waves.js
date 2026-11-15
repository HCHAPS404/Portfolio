/**
 * Mar de puntos en perspectiva con un sol de franjas en el horizonte y una
 * baliza roja. Acompaña la hackatón de GDG Cartagena (costa Caribe).
 */
import { fitCanvas, visibleLoop } from '../core/dom.js';

const INK = '237,235,230';

export function createWaves(canvas) {
  let ctx, W, H;

  function resize() {
    ({ ctx, width: W, height: H } = fitCanvas(canvas));
  }

  function draw(now) {
    const t = now * 0.001;
    const horizon = H * 0.42;
    ctx.clearRect(0, 0, W, H);

    // Sol de franjas (estilo retro), medio hundido en el horizonte
    const sunR = Math.min(W, H) * 0.24;
    const sunX = W * 0.66;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, horizon);
    ctx.clip();
    for (let y = -sunR; y < sunR * 0.4; y += 7) {
      const half = Math.sqrt(Math.max(0, sunR * sunR - y * y));
      const k = (y + sunR) / (sunR * 1.4);          // 0 arriba → 1 abajo
      const thickness = Math.max(1, 5 - k * 4.2);   // franjas más finas hacia el horizonte
      ctx.fillStyle = `rgba(${INK},${(0.9 - k * 0.45).toFixed(2)})`;
      ctx.fillRect(sunX - half, horizon - sunR * 0.4 + y, half * 2, thickness);
    }
    ctx.restore();

    // Línea de horizonte
    ctx.fillStyle = `rgba(${INK},0.5)`;
    ctx.fillRect(0, horizon, W, 1);

    // Oleaje: filas de puntos que se acercan a la cámara
    const ROWS = W < 640 ? 26 : 34;
    const COLS = W < 640 ? 44 : 78;
    for (let r = 0; r < ROWS; r++) {
      const depth = (r + ((t * 0.35) % 1)) / ROWS;       // 0 horizonte → 1 cerca
      const persp = depth * depth;
      const y0 = horizon + 3 + persp * (H - horizon) * 1.02;
      const spread = 0.55 + persp * 1.5;
      const amp = 2 + persp * 15;
      const size = 0.8 + persp * 2;
      const alpha = 0.16 + depth * 0.62;

      for (let c = 0; c < COLS; c++) {
        const u = c / (COLS - 1) - 0.5;
        const x = W / 2 + u * W * spread;
        if (x < -4 || x > W + 4) continue;
        const wave =
          Math.sin(u * 9 + t * 1.3 + r * 0.55) * 0.6 +
          Math.sin(u * 21 - t * 0.9 + r * 0.3) * 0.25 +
          Math.sin(r * 0.8 - t * 1.7) * 0.35;
        const y = y0 + wave * amp;
        // Reflejo del sol: columna más brillante bajo el astro
        const glint = Math.max(0, 1 - Math.abs(x - sunX) / (sunR * (0.5 + persp)));
        const crest = wave > 0.72;
        ctx.fillStyle = `rgba(${INK},${Math.min(1, alpha + glint * 0.4 + (crest ? 0.25 : 0)).toFixed(2)})`;
        ctx.fillRect(x - size / 2, y - size / 2, size * (crest ? 1.6 : 1), size);
      }
    }

    // Baliza roja flotando, con anillo de pulso
    const bx = W * 0.3;
    const by = horizon + (H - horizon) * 0.4 + Math.sin(t * 1.7) * 5;
    const pulse = (t * 0.6) % 1;
    ctx.strokeStyle = `rgba(238,46,51,${(1 - pulse).toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - 6 - pulse * 18, by - 6 - pulse * 18, 12 + pulse * 36, 12 + pulse * 36);
    ctx.fillStyle = '#ee2e33';
    ctx.fillRect(bx - 4, by - 4, 8, 8);
  }

  resize();
  window.addEventListener('resize', resize);
  return visibleLoop(canvas, draw, { fps: 40 });
}
