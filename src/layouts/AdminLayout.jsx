import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import Sidebar from '../components/Sidebar.jsx';
import DemoBanner from '../components/DemoBanner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminLayout() {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar variant="admin" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <DemoBanner />
        <div className="topbar">
          <div className="flex-center">
            <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><FiMenu /></button>
            <div className="topbar-title">Admin Console</div>
          </div>
          <div className="topbar-right">
            <span className="demo-badge">ADMIN</span>
            <div className="user-chip">
              <div className="avatar" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>A</div>
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