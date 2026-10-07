import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { getUsers, getTransactions, getCommissions, getKYC, getDisputes, getWallet } from '../../services/storageService.js';
import { formatDate, formatDateTime } from '../../utils/dates.js';

export default function AdminUserDetail() {
  const { id } = useParams();
  const { dataVersion } = useApp();
  const user = useMemo(() => getUsers().find((u) => u.id === id), [id, dataVersion]);
  const wallet = useMemo(() => getWallet(id), [id, dataVersion]);
  const txns = useMemo(() => getTransactions().filter((t) => t.userId === id), [id, dataVersion]);
  const commissions = useMemo(() => getCommissions().filter((c) => c.userId === id), [id, dataVersion]);
  const kyc = useMemo(() => getKYC().filter((k) => k.userId === id), [id, dataVersion]);
  const disputes = useMemo(() => getDisputes().filter((d) => d.userId === id), [id, dataVersion]);

  if (!user) {
    return <div className="card card-pad"><EmptyState title="User not found" message="This user does not exist." action={<Link className="btn btn-primary" to="/admin/users">Back to Users</Link>} /></div>;
  }

  const totalCommission = commissions.filter((c) => c.status === 'CREDITED').reduce((a, c) => a + c.amount, 0);

  return (
    <div>
      <div className="flex-between mb-3" style={{ flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>{user.name}</h1>
          <p className="muted small" style={{ margin: '.25rem 0 0' }}>{user.email} · {user.mobile}</p>
        </div>
        <Link className="btn btn-outline" to="/admin/users">Back to Users</Link>
      </div>

      <div className="stat-grid mb-3">
        <div className="stat-card"><div className="stat-label">Wallet Balance</div><div className="stat-value">₹{(wallet?.balance || 0).toFixed(2)}</div></div>
        <div className="stat-card"><div className="stat-label">Total Commission</div><div className="stat-value text-success">₹{totalCommission.toFixed(2)}</div></div>
        <div className="stat-card"><div className="stat-label">Transactions</div><div className="stat-value">{txns.length}</div></div>
        <div className="stat-card"><div className="stat-label">Account Status</div><div style={{ marginTop: '.35rem' }}><Badge status={user.status} /></div></div>
      </div>

      <div className="grid grid-2 mb-3">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Profile</h3></div>
          <div className="card-pad">
            <Row label="User ID" value={user.id} mono />
            <Row label="Role" value={user.role} />
            <Row label="Registered" value={formatDate(user.createdAt)} />
            <Row label="KYC Status" value={<Badge status={kyc[0]?.status || 'NOT_SUBMITTED'} />} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Disputes</h3></div>
          <div className="card-pad">
            {disputes.length === 0 ? <div className="muted small">No disputes.</div> : disputes.map((d) => (
              <div key={d.id} className="flex-between" style={{ padding: '.5rem 0', borderBottom: '1px solid #eef0f6' }}>
                <div><div className="mono small">{d.id}</div><div className="muted small">{d.reason}</div></div>
                <Badge status={d.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Transactions</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Transaction</th><th>Type</th><th>Amount</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id}>
                  <td className="mono small">{t.id}</td>
                  <td><Badge status={t.type} /></td>
                  <td>₹{t.amount.toLocaleString('en-IN')}</td>
                  <td className="text-success">+₹{t.commission.toFixed(2)}</td>
                  <td><Badge status={t.status} /></td>
                  <td className="small">{formatDateTime(t.createdAt)}</td>
                </tr>
              ))}
              {txns.length === 0 && <tr><td colSpan={6}><div className="muted small text-center" style={{ padding: '1rem' }}>No transactions.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex-between" style={{ padding: '.55rem 0', borderBottom: '1px solid #eef0f6' }}>
      <span className="muted small">{label}</span>
      <span className={mono ? 'mono' : ''} style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}