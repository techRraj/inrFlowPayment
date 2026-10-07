import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ title = 'Nothing here yet', message = 'There is no data to display.', icon, action }) {
  return (
    <div className="text-center" style={{ padding: '3rem 1rem' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', color: '#64748b',
        display: 'grid', placeItems: 'center', margin: '0 auto 1rem', fontSize: '1.6rem',
      }}>
        {icon || <FiInbox />}
      </div>
      <div style={{ fontWeight: 700, marginBottom: '.35rem' }}>{title}</div>
      <div className="muted small" style={{ maxWidth: 360, margin: '0 auto 1rem' }}>{message}</div>
      {action}
    </div>
  );
}