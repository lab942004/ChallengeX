import { Outlet } from 'react-router-dom';

/**
 * GateLayout — full-bleed cinematic shell for the gate experience.
 * The supplied entry-gate.webp is the centerpiece of GatePage.
 */
export function GateLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-void">
      <Outlet />
    </div>
  );
}
