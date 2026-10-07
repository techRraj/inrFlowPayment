import { useMemo, useState } from 'react';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getDisputes, getUsers, getAuditLogs, saveAuditLogs } from '../../services/storageService.js';
import { updateDispute } from '../../services/disputeService.js';
import { createNotification } from '../../services/notificationService.js';
import { generateAuditId } from '../../utils/ids.js';
import { nowISO, formatDateTime } from '../../utils/dates.js';

export default function AdminDisputes() {
  const { dataVersion, bumpData } = useApp();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('UNDER_REVIEW');
  const [response, setResponse] = useState('');

  const disputes = useMemo(() => getDisputes(), [dataVersion]);
  const users = useMemo(() => getUsers(), [dataVersion]);

  const open = (d) => { setSelected(d); setStatus(d.status === 'OPEN' ? 'UNDER_REVIEW' : d.status); setResponse(d.adminResponse || ''); };

  const save = () => {
    if (!response.trim()) { toast.error('Please add a response.'); return; }
    updateDispute(selected.id, { status, adminResponse: response });
    createNotification(selected.userId, {
      title: 'Dispute updated',
      message: `Your dispute ${selected.id} is now ${status}. Admin response: ${response}`,
      type: status === 'RESOLVED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'INFO',
    });
    const logs = getAuditLogs();
    logs.unshift({
      id: generateAuditId(), action: 'DISPUTE_UPDATED', admin: currentUser.name, target: selected.id,
      description: `Set dispute ${selected.id} to ${status}`, createdAt: nowISO(),
    });
    saveAuditLogs(logs);
    setSelected(null); bumpData();
    toast.success('Dispute updated and user notified.');
  };

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Disputes</h1>
      <p className="muted small mb-3">Review, respond and resolve user disputes.</p>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Dispute ID</th><th>User</th><th>Transaction</th><th>Reason</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
            <tbody>
              {disputes.map((d) => {
                const u = users.find((x) => x.id === d.userId);
                return (
                  <tr key={d.id}>
                    <td className="mono small">{d.id}</td>
                    <td className="small">{u?.name || '—'}</td>
                    <td className="mono small">{d.transactionId}</td>
                    <td>{d.reason}</td>
                    <td><Badge status={d.status} /></td>
                    <td className="small">{formatDateTime(d.createdAt)}</td>
                    <td><button className="btn btn-outline btn-sm" onClick={() => open(d)}>Manage</button></td>
                  </tr>
                );
              })}
              {disputes.length === 0 && <tr><td colSpan={7}><EmptyState title="No disputes" message="No user disputes have been raised." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!selected} title={`Dispute ${selected?.id || ''}`} onClose={() => setSelected(null)} size={560}
        footer={<>
          <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Save Update</button>
        </>}>
        {selected && (
          <>
            <div className="card card-pad mb-2" style={{ background: '#fafbfd' }}>
              <div className="flex-between mb-1"><span className="muted small">User</span><strong>{users.find((x) => x.id === selected.userId)?.name}</strong></div>
              <div className="flex-between mb-1"><span className="muted small">Transaction</span><span className="mono">{selected.transactionId}</span></div>
              <div className="flex-between mb-1"><span className="muted small">Reason</span><strong>{selected.reason}</strong></div>
              <div className="muted small mt-1">{selected.description}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                {['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Admin Response</label>
              <textarea className="form-control" rows={3} value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Write a response to the user" />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}