/**
 * Retrato ASCII: convierte una imagen en caracteres según su luminosidad.
 * El fondo (rojo en la foto original) se dibuja como una trama roja tenue y
 * el sujeto en blanco. Entra con un barrido de escáner y reacciona al cursor.
 */
import { fitCanvas, visibleLoop, reduceMotion } from '../core/dom.js';

const RAMP = ' .,:;-~=+*xX#%@';
const NOISE = '01<>/\\[]{}#%&*+=';

export function createAsciiPortrait(canvas, src) {
  let ctx, W, H, cols, rows, cw, ch;
  let cells = null; // { lum: Float32Array, bg: Uint8Array }
  let start = 0;
  const img = new Image();
  const pointer = { col: -99, row: -99 };

  function sample() {
    if (!img.complete || !img.naturalWidth) return;
    const off = document.createElement('canvas');
    off.width = cols;
    off.height = rows;
    const octx = off.getContext('2d', { willReadFrequently: true });
    // Recorte tipo "cover" centrado, con un poco más de peso arriba (rostro)
    const srcAspect = img.naturalWidth / img.naturalHeight;
    const dstAspect = W / H;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    if (srcAspect > dstAspect) sw = sh * dstAspect;
    else sh = sw / dstAspect;
    const sx = (img.naturalWidth - sw) / 2;
    const sy = (img.naturalHeight - sh) * 0.3;
    octx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
    const data = octx.getImageData(0, 0, cols, rows).data;

    const lum = new Float32Array(cols * rows);
    const bg = new Uint8Array(cols * rows);
    for (let i = 0; i < cols * rows; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      bg[i] = r > 40 && r > g * 2.1 && r > b * 2.1 ? 1 : 0;
      // Realce de contraste para que el rostro tenga volumen
      lum[i] = Math.min(1, Math.pow(l, 0.72) * 1.35);
    }
    cells = { lum, bg };
  }

  function resize() {
    ({ ctx, width: W, height: H } = fitCanvas(canvas));
    cw = W < 420 ? 5 : 6;
    ch = Math.round(cw * 1.6);
    cols = Math.ceil(W / cw);
    rows = Math.ceil(H / ch);
    sample();
  }

  function draw(now) {
    if (!cells) return;
    if (!start) start = now;
    const t = now - start;
    const progress = reduceMotion ? 1 : Math.min(1, t / 2200);
    const scanRow = progress * (rows + 4);
    // Banda de "glitch" ocasional que desplaza unas filas
    const glitchOn = !reduceMotion && progress >= 1 && Math.sin(t * 0.0013) > 0.985;
    const glitchRow = Math.floor((Math.sin(t * 0.7) * 0.5 + 0.5) * rows);

    ctx.clearRect(0, 0, W, H);
    ctx.font = `500 ${Math.round(ch * 0.86)}px "JetBrains Mono", ui-monospace, Consolas, monospace`;
    ctx.textBaseline = 'top';

    for (let row = 0; row < rows; row++) {
      if (row > scanRow) break;
      const nearScan = progress < 1 && scanRow - row < 2.5;
      const shift = glitchOn && Math.abs(row - glitchRow) < 2 ? 3 : 0;

      for (let col = 0; col < cols; col++) {
        const srcCol = Math.min(cols - 1, Math.max(0, col + shift));
        const i = srcCol + row * cols;
        const l = cells.lum[i];
        const isBg = cells.bg[i];

        const dx = col - pointer.col;
        const dy = (row - pointer.row) * 1.6;
        const lens = dx * dx + dy * dy < 30;

        let char;
        let style;
        if (nearScan || lens) {
          char = NOISE[(Math.random() * NOISE.length) | 0];
          style = nearScan ? '#ee2e33' : 'rgba(237,235,230,0.9)';
        } else if (isBg) {
          // Trama de fondo: puntos rojos espaciados
          if ((col + row * 2) % 3 !== 0) continue;
          char = l > 0.42 ? ':' : '.';
          style = `rgba(238,46,51,${(0.25 + l * 0.6).toFixed(2)})`;
        } else {
          const lvl = Math.round(l * (RAMP.length - 1));
          if (lvl <= 0) continue;
          char = RAMP[lvl];
          // Parpadeo sutil de algunas celdas
          if (!reduceMotion && Math.random() < 0.0025) char = NOISE[(Math.random() * NOISE.length) | 0];
          style = `rgba(237,235,230,${(0.3 + l * 0.7).toFixed(2)})`;
        }
        ctx.fillStyle = style;
        ctx.fillText(char, col * cw, row * ch);
      }
    }
  }

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.col = (e.clientX - r.left) / cw;
    pointer.row = (e.clientY - r.top) / ch;
  });
  canvas.addEventListener('pointerleave', () => {
    pointer.col = pointer.row = -99;
  });

  img.onload = () => {
    sample();
    if (reduceMotion) draw(4200);
  };
  img.src = src;

  resize();
  window.addEventListener('resize', resize);
  return visibleLoop(canvas, draw, { fps: 30 });
}
