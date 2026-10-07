import { useMemo, useState } from 'react';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getCommissions, getUsers, getAuditLogs, saveAuditLogs } from '../../services/storageService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { generateAuditId } from '../../utils/ids.js';
import { nowISO, formatDateTime } from '../../utils/dates.js';

const RATES = [1, 2, 3, 5];

export default function AdminCommissions() {
  const { dataVersion, bumpData, settings, updateSettings } = useApp();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [rate, setRate] = useState(settings.commissionRate);

  const commissions = useMemo(() => getCommissions(), [dataVersion]);
  const users = useMemo(() => getUsers(), [dataVersion]);

  const total = commissions.filter((c) => c.status === 'CREDITED').reduce((a, c) => a + c.amount, 0);

  const saveRate = () => {
    const r = Number(rate);
    if (isNaN(r) || r < 0 || r > 20) { toast.error('Commission rate must be between 0 and 20%.'); return; }
    updateSettings({ commissionRate: r });
    const logs = getAuditLogs();
    logs.unshift({
      id: generateAuditId(), action: 'COMMISSION_CHANGED', admin: currentUser.name, target: 'SETTINGS',
      description: `Commission rate changed to ${r}%`, createdAt: nowISO(),
    });
    saveAuditLogs(logs);
    bumpData();
    toast.success(`Commission rate updated to ${r}%. Only future transactions use this rate.`);
  };

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Commissions</h1>
      <p className="muted small mb-3">Configure the demo commission rate. Historical records are never changed.</p>

      <div className="grid grid-2 mb-3">
        <div className="card card-pad">
          <div className="stat-label">Current Demo Commission</div>
          <div className="stat-value" style={{ fontSize: '2.4rem' }}>{settings.commissionRate}%</div>
          <div className="muted small">Applies to new transactions only.</div>
          <div className="form-group mt-2">
            <label className="form-label">Set new rate</label>
            <div className="flex" style={{ flexWrap: 'wrap', gap: '.4rem' }}>
              {RATES.map((r) => (
                <button key={r} className={`btn btn-sm ${Number(rate) === r ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRate(r)}>{r}%</button>
              ))}
              <input className="form-control" style={{ maxWidth: 120 }} value={rate} onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ''))} />
              <button className="btn btn-primary btn-sm" onClick={saveRate}>Save Rate</button>
            </div>
          </div>
        </div>
        <div className="card card-pad">
          <div className="stat-label">Total Commission Credited</div>
          <div className="stat-value text-success">₹{total.toFixed(2)}</div>
          <div className="muted small">{commissions.filter((c) => c.status === 'CREDITED').length} credited records</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Commission Records</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Commission ID</th><th>User</th><th>Transaction</th><th>Transaction Amount</th><th>Rate</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {commissions.map((c) => {
                const u = users.find((x) => x.id === c.userId);
                return (
                  <tr key={c.id}>
                    <td className="mono small">{c.id}</td>
                    <td className="small">{u?.name || '—'}</td>
                    <td className="mono small">{c.transactionId}</td>
                    <td>₹{c.transactionAmount?.toLocaleString('en-IN')}</td>
                    <td>{c.rate}%</td>
                    <td className="text-success">₹{c.amount.toFixed(2)}</td>
                    <td><Badge status={c.status} /></td>
                    <td className="small">{formatDateTime(c.createdAt)}</td>
                  </tr>
                );
              })}
              {commissions.length === 0 && <tr><td colSpan={8}><EmptyState title="No commission records" message="Commission records appear after successful transactions." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}