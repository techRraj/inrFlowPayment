export default function LoadingSpinner({ label = 'Loading…', dark = false }) {
  return (
    <div className="loading-block">
      <div className={`spinner ${dark ? 'spinner-dark' : ''}`} style={{ width: 28, height: 28, borderWidth: 3 }} />
      <div className="muted small mt-2">{label}</div>
    </div>
  );
}