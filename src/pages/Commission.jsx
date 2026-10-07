import { useMemo } from 'react';
import { FiDollarSign } from 'react-icons/fi';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { getUserCommissions, getCommissionSummary, getCommissionRate } from '../services/commissionService.js';
import { formatDate, isToday, isThisMonth } from '../utils/dates.js';

export default function Commission() {
  const { currentUser } = useAuth();
  const { dataVersion } = useApp();
  const list = useMemo(() => getUserCommissions(currentUser.id), [currentUser.id, dataVersion]);
  const summary = useMemo(() => getCommissionSummary(currentUser.id), [currentUser.id, dataVersion]);
  const rate = getCommissionRate();

  const today = list.filter((c) => c.status === 'CREDITED' && isToday(c.createdAt)).reduce((a, c) => a + c.amount, 0);
  const month = list.filter((c) => c.status === 'CREDITED' && isThisMonth(c.createdAt)).reduce((a, c) => a + c.amount, 0);

  const latest = list.find((c) => c.status === 'CREDITED');

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Commission</h1>
      <p className="muted small mb-3">Automatic commission earnings from successful demo transactions.</p>

      <div className="stat-grid mb-3">
        <div className="stat-card">
          <div className="stat-label">Total Commission</div>
          <div className="stat-value">₹{summary.total.toFixed(2)}</div>
          <div className="stat-sub">{summary.count} credits</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">This Month</div>
          <div className="stat-value">₹{month.toFixed(2)}</div>
          <div className="stat-sub">Current calendar month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today</div>
          <div className="stat-value">₹{today.toFixed(2)}</div>
          <div className="stat-sub">Since midnight</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Rate</div>
          <div className="stat-value">{rate}%</div>
          <div className="stat-sub">Applies to new transactions</div>
        </div>
      </div>

      {latest && (
        <div className="commission-hero mb-3">
          <div className="small" style={{ color: '#e0e7ff', letterSpacing: '.08em' }}>YOU EARNED</div>
          <div className="amount">₹{latest.amount.toFixed(2)}</div>
          <div>FROM</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{latest.transactionAmount.toLocaleString('en-IN')} TRANSACTION</div>
          <div className="mt-2">
            <span className="demo-badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>RATE {latest.rate}%</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h3 className="card-title">Commission History</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Transaction ID</th><th>Transaction Amount</th><th>Rate</th><th>Commission</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td className="mono small">{c.transactionId}</td>
                  <td>₹{c.transactionAmount?.toLocaleString('en-IN')}</td>
                  <td>{c.rate}%</td>
                  <td className="text-success fw-700">+₹{c.amount.toFixed(2)}</td>
                  <td><Badge status={c.status} /></td>
                  <td className="small">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6}>
                  <EmptyState title="No commission earnings yet" message="Complete a successful demo transaction to earn commission." icon={<FiDollarSign />} />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}