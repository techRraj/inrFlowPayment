import { useMemo, useState } from 'react';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getKYC, getUsers, getAuditLogs, saveAuditLogs } from '../../services/storageService.js';
import { reviewKYC } from '../../services/kycService.js';
import { createNotification } from '../../services/notificationService.js';
import { generateAuditId } from '../../utils/ids.js';
import { nowISO, formatDateTime } from '../../utils/dates.js';

export default function AdminKYC() {
  const { dataVersion, bumpData } = useApp();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('PENDING');
  const [reject, setReject] = useState(null);
  const [reason, setReason] = useState('');

  const kyc = useMemo(() => getKYC(), [dataVersion]);
  const users = useMemo(() => getUsers(), [dataVersion]);
  const filtered = kyc.filter((k) => k.status === tab);

  const log = (action, target, description) => {
    const logs = getAuditLogs();
    logs.unshift({ id: generateAuditId(), action, admin: currentUser.name, target, description, createdAt: nowISO() });
    saveAuditLogs(logs);
  };

  const verify = (k) => {
    reviewKYC(k.id, { status: 'VERIFIED', reviewedBy: currentUser.id });
    createNotification(k.userId, { title: 'KYC verified', message: 'Your simulated KYC has been verified.', type: 'SUCCESS' });
    log('KYC_VERIFIED', k.id, `Verified KYC for ${k.fullName}`);
    bumpData();
    toast.success('KYC verified.');
  };

  const confirmReject = () => {
    if (!reason.trim()) { toast.error('Rejection reason is required.'); return; }
    reviewKYC(reject.id, { status: 'REJECTED', reviewedBy: currentUser.id, rejectionReason: reason });
    createNotification(reject.userId, { title: 'KYC rejected', message: `Your simulated KYC was rejected: ${reason}`, type: 'ERROR' });
    log('KYC_REJECTED', reject.id, `Rejected KYC for ${reject.fullName}: ${reason}`);
    setReject(null); setReason('');
    bumpData();
    toast.warning('KYC rejected.');
  };

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>KYC Review</h1>
      <p className="muted small mb-3">All KYC is simulated. No real identity is verified.</p>

      <div className="flex mb-3" style={{ gap: '.5rem', flexWrap: 'wrap' }}>
        {['PENDING', 'VERIFIED', 'REJECTED'].map((t) => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
            {t} ({kyc.filter((k) => k.status === t).length})
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>KYC ID</th><th>User</th><th>Full Name</th><th>ID Type</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((k) => {
                const u = users.find((x) => x.id === k.userId);
                return (
                  <tr key={k.id}>
                    <td className="mono small">{k.id}</td>
                    <td className="small">{u?.email}</td>
                    <td>{k.fullName}</td>
                    <td className="small">{k.idType}</td>
                    <td className="small">{formatDateTime(k.submittedAt)}</td>
                    <td><Badge status={k.status} /></td>
                    <td>
                      {k.status === 'PENDING' ? (
                        <div className="flex" style={{ gap: '.3rem' }}>
                          <button className="btn btn-success btn-sm" onClick={() => verify(k)}>Verify</button>
                          <button className="btn btn-danger btn-sm" onClick={() => { setReject(k); setReason(''); }}>Reject</button>
                        </div>
                      ) : <span className="muted small">—</span>}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7}><EmptyState title={`No ${tab.toLowerCase()} KYC`} message="Nothing to review in this tab." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!reject} title="Reject Demo KYC" onClose={() => setReject(null)}
        footer={<>
          <button className="btn btn-outline" onClick={() => setReject(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={confirmReject}>Confirm Rejection</button>
        </>}>
        <p className="muted small">Provide a reason. The user will receive a notification.</p>
        <div className="form-group">
          <label className="form-label">Rejection Reason</label>
          <textarea className="form-control" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Demo ID number appears invalid" />
        </div>
      </Modal>
    </div>
  );
}