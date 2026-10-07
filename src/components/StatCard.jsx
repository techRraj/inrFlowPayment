export default function StatCard({ label, value, sub, icon, color = '#4f46e5', bg = '#eef2ff' }) {
  return (
    <div className="stat-card">
      {icon && (
        <div className="stat-icon" style={{ background: bg, color }}>
          {icon}
        </div>
      )}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}