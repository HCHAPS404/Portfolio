/**
 * Terreno de puntos en perspectiva (dot-matrix) con nodos sensores y una onda
 * de alerta roja que se propaga desde la ladera. Ilustra NAVIRA-SATViRe:
 * alerta temprana de deslizamientos.
 */
import { fitCanvas, visibleLoop } from '../core/dom.js';

const NODES = [
  { x: -0.55, z: 2.0, id: 'N-01' },
  { x: 0.62, z: 1.7, id: 'N-02' },
  { x: 0.05, z: 2.9, id: 'N-03' },
  { x: -0.2, z: 1.35, id: 'N-04' },
];

// Relieve: una montaña principal, una loma secundaria y rugosidad
function height(x, z) {
  const peak = 0.95 * Math.exp(-((x - 0.12) ** 2 * 3.2 + (z - 2.55) ** 2 * 1.5));
  const hill = 0.4 * Math.exp(-((x + 0.85) ** 2 * 5 + (z - 1.9) ** 2 * 2.4));
  const rough =
    Math.sin(x * 6.1 + z * 3.3) * 0.035 +
    Math.sin(x * 13.7 - z * 8.2 + 1.3) * 0.02 +
    Math.sin(x * 2.3 + z * 1.1) * 0.05;
  return peak + hill + rough;
}

export function createTerrain(canvas) {
  let ctx, W, H;
  const ORIGIN = { x: 0.12, z: 2.55 }; // la onda nace en la cima

  function resize() {
    ({ ctx, width: W, height: H } = fitCanvas(canvas));
  }

  function project(x, y, z, sway) {
    const f = W * 0.62;
    const camH = 0.95;
    return {
      sx: W / 2 + ((x + sway) / z) * f,
      sy: H * 0.2 + ((camH - y) / z) * f * 0.62,
    };
  }

  function draw(now) {
    const t = now;
    const sway = Math.sin(t * 0.00018) * 0.06;
    const waveR = ((t * 0.00042) % 1) * 2.6;
    const NX = W < 640 ? 46 : 84;
    const NZ = W < 640 ? 30 : 44;

    ctx.clearRect(0, 0, W, H);

    for (let iz = NZ - 1; iz >= 0; iz--) {
      const z = 0.75 + (iz / (NZ - 1)) * 3.4;
      const depth = 1 - iz / (NZ - 1); // 1 cerca, 0 lejos
      for (let ix = 0; ix < NX; ix++) {
        const x = (ix / (NX - 1) - 0.5) * 3.4;
        const dist = Math.hypot(x - ORIGIN.x, (z - ORIGIN.z) * 0.9);
        const wave = Math.exp(-((dist - waveR) ** 2) * 60) * (1 - waveR / 2.6);
        const y = height(x, z) + wave * 0.07;
        const { sx, sy } = project(x, y, z, sway);
        if (sx < -4 || sx > W + 4 || sy < -4 || sy > H + 4) continue;

        const size = 0.7 + depth * 1.5 + wave * 1.6;
        if (wave > 0.22) {
          ctx.fillStyle = `rgba(238,46,51,${Math.min(1, 0.35 + wave).toFixed(2)})`;
        } else {
          const a = 0.1 + depth * 0.5 + Math.min(0.35, y * 0.42);
          ctx.fillStyle = `rgba(237,235,230,${a.toFixed(2)})`;
        }
        ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
      }
    }

    // Nodos sensores: cuadro rojo que parpadea y se enciende con la onda
    for (const [i, n] of NODES.entries()) {
      const y = height(n.x, n.z);
      const { sx, sy } = project(n.x, y, n.z, sway);
      const dist = Math.hypot(n.x - ORIGIN.x, (n.z - ORIGIN.z) * 0.9);
      const hit = Math.abs(dist - waveR) < 0.16;
      const blink = Math.sin(t * 0.005 + i * 1.7) > 0;

      ctx.fillStyle = hit || blink ? '#ee2e33' : 'rgba(238,46,51,0.35)';
      ctx.fillRect(sx - 3, sy - 3, 6, 6);
      if (hit) {
        ctx.strokeStyle = 'rgba(238,46,51,0.8)';
        ctx.strokeRect(sx - 8, sy - 8, 16, 16);
      }
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return visibleLoop(canvas, draw, { fps: 40 });
}
