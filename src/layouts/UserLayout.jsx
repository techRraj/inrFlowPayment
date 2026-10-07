import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiMenu, FiBell } from 'react-icons/fi';
import Sidebar from '../components/Sidebar.jsx';
import DemoBanner from '../components/DemoBanner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { Link } from 'react-router-dom';

export default function UserLayout() {
  const { currentUser } = useAuth();
  const { notifications } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="app-shell">
      <Sidebar variant="user" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <DemoBanner />
        <div className="topbar">
          <div className="flex-center">
            <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><FiMenu /></button>
            <div className="topbar-title">INRFlow</div>
          </div>
          <div className="topbar-right">
            <Link to="/notifications" className="btn btn-ghost" style={{ position: 'relative' }} aria-label="Notifications">
              <FiBell size={18} />
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8,
                  background: '#ef4444', color: '#fff', fontSize: '.65rem', display: 'grid', placeItems: 'center', padding: '0 4px',
                }}>{unread}</span>
              )}
            </Link>
            <div className="user-chip">
              <div className="avatar">{(currentUser?.name || 'U').split(' ').map((s) => s[0]).slice(0,2).join('').toUpperCase()}</div>
              <span className="hide-sm">{currentUser?.name}</span>
            </div>
          </div>
        </div>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}