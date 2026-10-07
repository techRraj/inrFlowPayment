import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiCreditCard, FiRepeat, FiList, FiDollarSign, FiShield, FiAlertTriangle,
  FiBell, FiUser, FiLogOut, FiUsers, FiSettings, FiBarChart2, FiFileText, FiCheckSquare, FiBriefcase,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { to: '/wallet', label: 'Wallet', icon: <FiCreditCard /> },
  { to: '/buy-sell', label: 'Buy & Sell', icon: <FiRepeat /> },
  { to: '/transactions', label: 'Transactions', icon: <FiList /> },
  { to: '/commission', label: 'Commission', icon: <FiDollarSign /> },
  { to: '/kyc', label: 'KYC', icon: <FiShield /> },
  { to: '/disputes', label: 'Disputes', icon: <FiAlertTriangle /> },
  { to: '/notifications', label: 'Notifications', icon: <FiBell /> },
  { to: '/profile', label: 'Profile', icon: <FiUser /> },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { to: '/admin/users', label: 'Users', icon: <FiUsers /> },
  { to: '/admin/kyc', label: 'KYC', icon: <FiShield /> },
  { to: '/admin/transactions', label: 'Transactions', icon: <FiList /> },
  { to: '/admin/orders', label: 'Orders', icon: <FiBriefcase /> },
  { to: '/admin/commissions', label: 'Commissions', icon: <FiDollarSign /> },
  { to: '/admin/settlements', label: 'Settlements', icon: <FiCheckSquare /> },
  { to: '/admin/disputes', label: 'Disputes', icon: <FiAlertTriangle /> },
  { to: '/admin/reports', label: 'Reports', icon: <FiBarChart2 /> },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: <FiFileText /> },
  { to: '/admin/settings', label: 'Settings', icon: <FiSettings /> },
];

export default function Sidebar({ variant = 'user', open, onClose }) {
  const { logout } = useAuth();
  const links = variant === 'admin' ? adminLinks : userLinks;
  const base = variant === 'admin' ? '/admin' : '';

  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-brand">
          <div className="logo-mark">IF</div>
          <span>INRFlow</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === base + '/dashboard'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {l.icon}<span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="nav-link w-100" style={{ border: 'none', background: 'none', textAlign: 'left' }} onClick={logout}>
            <FiLogOut /><span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}