import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { isValidEmail, isValidMobile, isStrongEnough } from '../utils/validators.js';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!isValidEmail(form.email)) e.email = 'Enter a valid email address.';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required.';
    else if (!isValidMobile(form.mobile)) e.mobile = 'Enter a valid 10-digit mobile number.';
    if (!form.password) e.password = 'Password is required.';
    else if (!isStrongEnough(form.password)) e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      try {
        register({ name: form.name, email: form.email, mobile: form.mobile, password: form.password });
        toast.success('Demo account created. Please sign in.');
        navigate('/login');
      } catch (err) {
        setErrors({ email: err.message });
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <div className="brand-lg" style={{ color: '#fff', marginBottom: '1.5rem' }}>
          <div className="logo-mark" style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'grid', placeItems: 'center', fontWeight: 800 }}>IF</div>
          INRFlow
        </div>
        <h2>Create your demo account</h2>
        <p>A wallet is created automatically with ₹0 balance. Fund it with demo money and try the full workflow.</p>
        <div className="card card-pad mt-3" style={{ background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.12)', color: '#e0e7ff' }}>
          <div className="fw-700" style={{ color: '#fff', marginBottom: '.4rem' }}>What you get</div>
          <div className="small">✓ Demo wallet with ledger</div>
          <div className="small">✓ Simulated buy/sell with 2% commission</div>
          <div className="small">✓ Simulated KYC, disputes and notifications</div>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <h2 style={{ margin: '0 0 .25rem', letterSpacing: '-.02em' }}>Create account</h2>
          <p className="muted small mb-2">Registration is local and stored in your browser only.</p>

          <form onSubmit={submit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input id="name" className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Priya Nair" />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" className="form-control" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@demo.com" />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mobile">Mobile Number</label>
              <input id="mobile" className="form-control" value={form.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" />
              {errors.mobile && <div className="form-error">{errors.mobile}</div>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" className="form-control" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Minimum 6 characters" />
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm">Confirm Password</label>
              <input id="confirm" type="password" className="form-control" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="Re-enter password" />
              {errors.confirm && <div className="form-error">{errors.confirm}</div>}
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Demo Account'}
            </button>
          </form>

          <p className="muted small mt-2 text-center">
            Already registered? <Link to="/login" className="text-primary fw-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}