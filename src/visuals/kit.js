/**
 * Base común de las escenas de portada: colores, cámara 3D, seguimiento del
 * puntero y el ciclo de dibujo (redimensionado, pausa fuera de pantalla y
 * fotograma fijo con movimiento reducido).
 */
import { fitCanvas, visibleLoop, reduceMotion } from '../core/dom.js';

export const INK = '237,235,230';
export const RED = '238,46,51';
export const BG = '8,8,10';
export const TAU = Math.PI * 2;

export const ink = (a) => `rgba(${INK},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
export const red = (a = 1) => `rgba(${RED},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
export const bg = (a = 1) => `rgba(${BG},${a})`;

export const clamp01 = (v) => Math.max(0, Math.min(1, v));
/** Entrada suave: 0 → 1 entre `from` y `from + dur` segundos. */
export const easeIn = (t, from = 0, dur = 1.6) => 1 - Math.pow(1 - clamp01((t - from) / dur), 3);

/**
 * Cámara orbital. Eje Y hacia arriba. Devuelve una función que proyecta
 * (x, y, z) → [sx, sy, profundidad] (profundidad mayor = más lejos).
 */
export function camera({ yaw = 0, pitch = 0, scale = 100, cx = 0, cy = 0, dist = 0 }) {
  const cyw = Math.cos(yaw), syw = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  return (x, y, z) => {
    const x1 = x * cyw + z * syw;
    const z1 = -x * syw + z * cyw;
    const y1 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    const k = dist ? dist / (dist + z2) : 1;
    return [cx + x1 * scale * k, cy - y1 * scale * k, z2];
  };
}

/** Traza una polilínea a partir de puntos ya proyectados. */
export function path(ctx, pts, close = false) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close) ctx.closePath();
}

/**
 * Monta una escena: `draw(ctx, W, H, t, pointer)` se llama en cada fotograma
 * visible, con `t` en segundos desde el inicio y el puntero suavizado en -1..1.
 */
export function scene(canvas, draw, { fps = 45, still = 7 } = {}) {
  let ctx, W, H;
  let start = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const resize = () => ({ ctx, width: W, height: H } = fitCanvas(canvas));
  const onPointer = (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };

  resize();
  window.addEventListener('resize', resize);
  if (!reduceMotion) window.addEventListener('pointermove', onPointer, { passive: true });

  return visibleLoop(
    canvas,
    (now) => {
      if (!start) start = now;
      const t = reduceMotion ? still : (now - start) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      ctx.clearRect(0, 0, W, H);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      draw(ctx, W, H, t, pointer);
    },
    { fps },
  );
}
