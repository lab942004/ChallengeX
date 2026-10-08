import { Outlet } from 'react-router-dom';

/** Shell for themed error pages (404/401/500/network). */
export function ErrorLayout() {
  return (
    <div className="min-h-screen bg-void">
      <Outlet />
    </div>
  );
}
