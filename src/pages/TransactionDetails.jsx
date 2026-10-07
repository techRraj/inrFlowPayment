import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { getTransactionById } from '../services/transactionService.js';
import { formatDateTime } from '../utils/dates.js';
import { downloadFile } from '../services/reportService.js';
import EmptyState from '../components/EmptyState.jsx';

export default function TransactionDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { dataVersion } = useApp();
  const navigate = useNavigate();
  const txn = useMemo(() => getTransactionById(id), [id, dataVersion]);

  if (!txn || (txn.userId !== currentUser.id && currentUser.role !== 'ADMIN')) {
    return (
      <div className="card card-pad">
        <EmptyState
          title="Transaction not found"
          message="This transaction does not exist or is not available to your account."
          action={<Link className="btn btn-primary" to="/transactions">Back to Transactions</Link>}
        />
      </div>
    );
  }

  const timeline = [
    ['Order Created', txn.timeline?.orderCreated],
    ['Payment Initiated', txn.timeline?.paymentInitiated],
    ['Payment Successful', txn.timeline?.paymentSuccess],
    ['Commission Calculated', txn.timeline?.commissionCalculated],
    ['Commission Credited', txn.timeline?.commissionCredited],
    ['Transaction Completed', txn.timeline?.completed],
  ];

  const downloadReceipt = () => {
    const lines = [
      'DEMO RECEIPT — NOT A REAL PAYMENT RECEIPT',
      '=========================================',
      `Transaction ID: ${txn.id}`,
      `Order ID: ${txn.orderId || '—'}`,
      `Payment ID: ${txn.paymentId || '—'}`,
      `Type: ${txn.type}`,
      `Amount: ₹${txn.amount.toFixed(2)}`,
      `Commission Rate: ${txn.commissionRate}%`,
      `Commission: ₹${txn.commission.toFixed(2)}`,
      `Status: ${txn.status}`,
      `Date: ${formatDateTime(txn.createdAt)}`,
      '',
      'This is a simulated receipt generated locally. No real money was processed.',
    ].join('\n');
    downloadFile(`inrflow-demo-receipt-${txn.id}.txt`, lines);
  };

  return (
    <div>
      <div className="flex-between mb-3" style={{ flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Transaction Details</h1>
          <p className="muted small" style={{ margin: '.25rem 0 0' }}>
            Full lifecycle and commission breakdown for <span className="mono">{txn.id}</span>
          </p>
        </div>
        <div className="flex" style={{ gap: '.5rem' }}>
          <button className="btn btn-outline" onClick={downloadReceipt}>Download Demo Receipt</button>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      </div>

      {txn.status === 'SUCCESS' && (
        <div className="card card-pad mb-3 text-center" style={{ background: 'linear-gradient(135deg,#eef2ff,#ecfeff)', borderColor: '#c7d2fe' }}>
          <div className="success-icon">✓</div>
          <h2 style={{ margin: '.25rem 0' }}>Transaction Successful</h2>
          <p className="muted small">Commission has been credited to the demo wallet.</p>
          <div className="stat-grid mt-2">
            <div className="stat-card"><div className="stat-label">Amount</div><div className="stat-value">₹{txn.amount.toLocaleString('en-IN')}</div></div>
            <div className="stat-card"><div className="stat-label">Commission</div><div className="stat-value text-success">₹{txn.commission.toFixed(2)}</div></div>
            <div className="stat-card"><div className="stat-label">Wallet Credit</div><div className="stat-value text-success">₹{txn.commission.toFixed(2)}</div></div>
            <div className="stat-card"><div className="stat-label">Date</div><div className="stat-value" style={{ fontSize: '1rem' }}>{formatDateTime(txn.createdAt)}</div></div>
          </div>
        </div>
      )}

      <div className="grid grid-2 mb-3">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Overview</h3><Badge status={txn.status} /></div>
          <div className="card-pad">
            {[
              ['Transaction ID', txn.id, true],
              ['Order ID', txn.orderId || '—', true],
              ['Payment ID', txn.paymentId || '—', true],
              ['Type', txn.type],
              ['Amount', `₹${txn.amount.toLocaleString('en-IN')}`],
              ['Commission Rate', `${txn.commissionRate}%`],
              ['Commission', `₹${txn.commission.toFixed(2)}`],
              ['Created', formatDateTime(txn.createdAt)],
            ].map(([k, v, mono], i) => (
              <div key={i} className="flex-between" style={{ padding: '.55rem 0', borderBottom: i < 7 ? '1px solid #eef0f6' : 'none' }}>
                <span className="muted small">{k}</span>
                <span className={mono ? 'mono' : ''} style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Timeline</h3></div>
          <div className="card-pad">
            <div className="timeline">
              {timeline.map(([label, ts], i) => {
                const done = !!ts;
                const active = done && i === timeline.filter((x) => x[1]).length - 1;
                return (
                  <div key={i} className={`tl-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                    <div style={{ fontWeight: 600 }}>{label}</div>
                    <div className="muted small">{ts ? formatDateTime(ts) : 'Pending'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <strong>DEMO RECEIPT — NOT A REAL PAYMENT RECEIPT</strong>
        <p className="muted small" style={{ margin: '.4rem 0 0' }}>
          This transaction was simulated in the browser. No money was processed and no external service was used.
        </p>
      </div>
    </div>
  );
}