import { useEffect } from "react";

export function useCursorGlow() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduced.matches) return;

    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;
    let frame = 0;
    let active = false;

    const paint = () => {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;

      root.style.setProperty("--cursor-x", `${currentX}%`);
      root.style.setProperty("--cursor-y", `${currentY}%`);

      const settled =
        Math.abs(targetX - currentX) < 0.04 &&
        Math.abs(targetY - currentY) < 0.04;

      if (!settled) {
        frame = requestAnimationFrame(paint);
      } else {
        frame = 0;
      }
    };

    const queuePaint = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onMove = (event) => {
      if (event.pointerType === "touch") return;

      targetX = (event.clientX / window.innerWidth) * 100;
      targetY = (event.clientY / window.innerHeight) * 100;

      if (!active) {
        active = true;
        root.style.setProperty("--cursor-glow-opacity", "1");
      }

      queuePaint();
    };

    const onLeave = () => {
      active = false;
      root.style.setProperty("--cursor-glow-opacity", "0");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      root.style.removeProperty("--cursor-x");
      root.style.removeProperty("--cursor-y");
      root.style.removeProperty("--cursor-glow-opacity");
    };
  }, []);
}
