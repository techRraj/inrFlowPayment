import { useMemo, useState } from 'react';
import { FiAlertTriangle, FiPlus } from 'react-icons/fi';
import Modal from '../components/Modal.jsx';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getUserDisputes, createDispute } from '../services/disputeService.js';
import { getUserTransactions } from '../services/transactionService.js';
import { createNotification } from '../services/notificationService.js';
import { formatDateTime } from '../utils/dates.js';

const REASONS = ['Payment Issue', 'Incorrect Commission', 'Transaction Failed', 'Other'];

export default function Disputes() {
  const { currentUser } = useAuth();
  const { dataVersion, bumpData } = useApp();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ transactionId: '', reason: REASONS[0], description: '' });
  const [errors, setErrors] = useState({});

  const disputes = useMemo(() => getUserDisputes(currentUser.id), [currentUser.id, dataVersion]);
  const txns = useMemo(() => getUserTransactions(currentUser.id), [currentUser.id, dataVersion]);

  const submit = () => {
    const e = {};
    if (!form.transactionId) e.transactionId = 'Select a transaction.';
    if (!form.description.trim()) e.description = 'Please describe the issue.';
    setErrors(e);
    if (Object.keys(e).length) return;
    createDispute({ userId: currentUser.id, ...form });
    createNotification(currentUser.id, {
      title: 'Dispute submitted',
      message: `Your dispute for ${form.transactionId} has been received and is open.`,
      type: 'INFO',
    });
    bumpData();
    setOpen(false);
    setForm({ transactionId: '', reason: REASONS[0], description: '' });
    toast.success('Dispute created. Admin will review it.');
  };

  return (
    <div>
      <div className="flex-between mb-3">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Disputes</h1>
          <p className="muted small" style={{ margin: '.25rem 0 0' }}>Raise and track issues with demo transactions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}><FiPlus /> Create Dispute</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Dispute ID</th><th>Transaction</th><th>Reason</th><th>Status</th><th>Created</th><th>Admin Response</th></tr></thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id}>
                  <td className="mono small">{d.id}</td>
                  <td className="mono small">{d.transactionId}</td>
                  <td>{d.reason}</td>
                  <td><Badge status={d.status} /></td>
                  <td className="small">{formatDateTime(d.createdAt)}</td>
                  <td className="small muted">{d.adminResponse || 'Awaiting response'}</td>
                </tr>
              ))}
              {disputes.length === 0 && (
                <tr><td colSpan={6}>
                  <EmptyState title="No disputes found" message="You have not raised any disputes yet." icon={<FiAlertTriangle />}
                    action={<button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>Create Dispute</button>} />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} title="Create Dispute" onClose={() => setOpen(false)}
        footer={<>
          <button className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Submit Dispute</button>
        </>}>
        <div className="form-group">
          <label className="form-label">Transaction</label>
          <select className="form-control" value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })}>
            <option value="">Select a transaction</option>
            {txns.map((t) => <option key={t.id} value={t.id}>{t.id} — ₹{t.amount.toLocaleString('en-IN')} ({t.status})</option>)}
          </select>
          {errors.transactionId && <div className="form-error">{errors.transactionId}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Reason</label>
          <select className="form-control" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
            {REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail." />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>
      </Modal>
    </div>
  );
}