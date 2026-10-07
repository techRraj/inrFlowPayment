import { FiBell } from 'react-icons/fi';
import EmptyState from '../components/EmptyState.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatDateTime } from '../utils/dates.js';

export default function Notifications() {
  const { notifications, markRead, markAll } = useApp();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex-between mb-3">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Notifications</h1>
          <p className="muted small" style={{ margin: '.25rem 0 0' }}>{unread} unread of {notifications.length}</p>
        </div>
        <button className="btn btn-outline" onClick={markAll} disabled={unread === 0}>Mark all as read</button>
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <EmptyState title="No notifications" message="You will see demo payment, commission and KYC updates here." icon={<FiBell />} />
        ) : notifications.map((n) => (
          <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
            <div className="notif-dot" />
            <div style={{ flex: 1 }}>
              <div className="flex-between" style={{ gap: '.5rem' }}>
                <strong>{n.title}</strong>
                <span className="muted small">{formatDateTime(n.createdAt)}</span>
              </div>
              <div className="muted small mt-1">{n.message}</div>
              {!n.read && (
                <button className="btn btn-ghost btn-sm mt-1" onClick={() => markRead(n.id)}>Mark as read</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}