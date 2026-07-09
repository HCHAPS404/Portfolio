export function PageAmbient() {
  return (
    <div className="pcb-ambient" aria-hidden="true">
      <div className="pcb-grid" />
      <div className="pcb-traces" />
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
