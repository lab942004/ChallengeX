import { Outlet } from 'react-router-dom';
import { RealmBackground } from '../components/common/RealmBackground';

/** Shell for themed error pages (404/401/500/network). */
export function ErrorLayout() {
  return (
    <div className="relative min-h-screen bg-void">
      <RealmBackground variant="app" artOpacity={0.35} />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
