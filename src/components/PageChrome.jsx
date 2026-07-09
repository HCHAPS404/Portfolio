import { useCursorGlow } from "../hooks/useCursorGlow.js";

export function PageAmbient() {
  useCursorGlow();

  return (
    <div className="pcb-ambient" aria-hidden="true">
      <div className="pcb-grid" />
      <div className="pcb-traces" />
      <div className="cursor-glow" />
      <div className="pcb-vignette" />
    </div>
  );
}

export function ScrollProgress({ progress }) {
  return (
    <div className="scroll-progress" aria-hidden="true">
      <div
        className="scroll-progress-bar"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
