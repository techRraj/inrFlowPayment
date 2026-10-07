import { useState } from 'react';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getUsers, saveUsers } from '../services/storageService.js';
import { getKYCStatus } from '../services/kycService.js';
import { isValidMobile } from '../utils/validators.js';
import { formatDate } from '../utils/dates.js';

export default function Profile() {
  const { currentUser } = useAuth();
  const { dataVersion, bumpData } = useApp();
  const toast = useToast();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [mobile, setMobile] = useState(currentUser.mobile);
  const [error, setError] = useState('');

  const kycStatus = getKYCStatus(currentUser.id);

  const save = () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!isValidMobile(mobile)) { setError('Enter a valid 10-digit mobile number.'); return; }
    setError('');
    const users = getUsers().map((u) => (u.id === currentUser.id ? { ...u, name: name.trim(), mobile: mobile.trim() } : u));
    saveUsers(users);
    // update current user session
    const updated = users.find((u) => u.id === currentUser.id);
    localStorage.setItem('inrflow_current_user', JSON.stringify(updated));
    bumpData();
    setEdit(false);
    toast.success('Profile updated.');
    window.location.reload();
  };

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Profile</h1>
      <p className="muted small mb-3">Your demo account information. Stored only in your browser.</p>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Account Details</h3>
            {!edit && <button className="btn btn-outline btn-sm" onClick={() => setEdit(true)}>Edit</button>}
          </div>
          <div className="card-pad">
            {!edit ? (
              <>
                <Row label="Name" value={currentUser.name} />
                <Row label="Email" value={currentUser.email} />
                <Row label="Mobile" value={currentUser.mobile} />
                <Row label="User ID" value={currentUser.id} mono />
                <Row label="Registration Date" value={formatDate(currentUser.createdAt)} />
                <Row label="Account Status" value={<Badge status={currentUser.status} />} />
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile</label>
                  <input className="form-control" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                </div>
                {error && <div className="form-error mb-2">{error}</div>}
                <div className="flex" style={{ gap: '.5rem' }}>
                  <button className="btn btn-outline" onClick={() => { setEdit(false); setName(currentUser.name); setMobile(currentUser.mobile); }}>Cancel</button>
                  <button className="btn btn-primary" onClick={save}>Save Changes</button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Verification &amp; Status</h3></div>
          <div className="card-pad">
            <Row label="KYC Status" value={<Badge status={kycStatus} />} />
            <Row label="Account Type" value={currentUser.role === 'ADMIN' ? 'Administrator (Demo)' : 'Standard User (Demo)'} />
            <Row label="Demo Mode" value={<span className="badge badge-warning">ON</span>} />
            <p className="muted small mt-2">
              Frontend-only demonstration. Not suitable for real financial use. No real identity verification is performed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex-between" style={{ padding: '.6rem 0', borderBottom: '1px solid #eef0f6' }}>
      <span className="muted small">{label}</span>
      <span className={mono ? 'mono' : ''} style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}