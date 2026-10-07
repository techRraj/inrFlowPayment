import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    setLoading(true);
    setTimeout(() => {
      try {
        const u = login(form.email, form.password);
        toast.success(`Signed in as ${u.name}`);
        const from = location.state?.from;
        if (u.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
        else navigate(from || '/dashboard', { replace: true });
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const fill = (email, password) => setForm({ email, password });

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <div className="brand-lg" style={{ color: '#fff', marginBottom: '1.5rem' }}>
          <div className="logo-mark" style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'grid', placeItems: 'center', fontWeight: 800 }}>IF</div>
          INRFlow
        </div>
        <h2>Move INR. Buy &amp; Sell. Earn Rewards.</h2>
        <p>Sign in to the demonstration platform and explore the complete wallet, buy/sell and commission workflow.</p>
        <div className="card card-pad mt-3" style={{ background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.12)', color: '#e0e7ff' }}>
          <div className="fw-700" style={{ color: '#fff', marginBottom: '.4rem' }}>Demo credentials</div>
          <div className="small">User: user@demo.com / User@123</div>
          <div className="small">Admin: admin@demo.com / Admin@123</div>
          <div className="small mt-1" style={{ color: '#a5b4fc' }}>Demo authentication — not suitable for production.</div>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <h2 style={{ margin: '0 0 .25rem', letterSpacing: '-.02em' }}>Sign in</h2>
          <p className="muted small mb-2">Access your INRFlow demo account.</p>

          <div className="demo-btns">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fill('user@demo.com', 'User@123')}>Demo User Login</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fill('admin@demo.com', 'Admin@123')}>Demo Admin Login</button>
          </div>

          <div className="or-divider">or</div>

          <form onSubmit={submit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" type="email" className="form-control" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@demo.com" autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input id="password" type="password" className="form-control" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" autoComplete="current-password" />
            </div>
            {error && <div className="form-error mb-2">{error}</div>}
            <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Login'}
            </button>
          </form>

          <p className="muted small mt-2 text-center">
            New here? <Link to="/register" className="text-primary fw-700">Create a demo account</Link>
          </p>
          <p className="muted small text-center mt-2">
            Frontend-only demonstration. Not suitable for real financial use.
          </p>
        </div>
      </div>
    </div>
  );
}