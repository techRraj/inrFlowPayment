import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <div className="text-center">
        <div style={{ fontSize: '4rem', fontWeight: 800, letterSpacing: '-.04em', background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>404</div>
        <h1 style={{ margin: '.5rem 0', letterSpacing: '-.02em' }}>Page not found</h1>
        <p className="muted">The page you are looking for does not exist in this demo.</p>
        <div className="flex-center mt-3" style={{ justifyContent: 'center', gap: '.5rem' }}>
          <Link to="/" className="btn btn-outline">Home</Link>
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}