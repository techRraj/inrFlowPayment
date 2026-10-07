import { useMemo, useState } from 'react';
import Badge from '../../components/Badge.jsx';
import Pagination from '../../components/Pagination.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  getTransactions, getUsers, getAuditLogs, saveAuditLogs,
} from '../../services/storageService.js';
import { refundTransaction } from '../../services/transactionService.js';
import { reverseCommission } from '../../services/commissionService.js';
import { debitWallet } from '../../services/walletService.js';
import { refundPayment } from '../../services/demoPaymentService.js';
import { createNotification } from '../../services/notificationService.js';
import { generateAuditId } from '../../utils/ids.js';
import { nowISO, formatDateTime } from '../../utils/dates.js';

export default function AdminTransactions() {
  const { dataVersion, bumpData } = useApp();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [refundTarget, setRefundTarget] = useState(null);
  const pageSize = 10;

  const txns = useMemo(() => getTransactions(), [dataVersion]);
  const users = useMemo(() => getUsers(), [dataVersion]);

  const filtered = txns.filter((t) => {
    const u = users.find((x) => x.id === t.userId);
    if (search && !`${t.id} ${u?.email || ''} ${u?.name || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (status && t.status !== status) return false;
    return true;
  });

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const doRefund = () => {
    try {
      const t = refundTarget;
      refundTransaction(t.id);
      refundPayment(t.paymentId);
      if (t.commission > 0) {
        reverseCommission(t.id);
        // reverse wallet credit (debit the commission amount, but guard balance)
        try {
          debitWallet(t.userId, t.commission, `Commission reversal for refunded ${t.id}`, 'REFUND', t.id);
        } catch {
          // if insufficient balance, still allow reversal record; ignore
        }
      }
      const logs = getAuditLogs();
      logs.unshift({
        id: generateAuditId(), action: 'REFUND_PROCESSED', admin: currentUser.name, target: t.id,
        description: `Refund simulated for transaction ${t.id}`, createdAt: nowISO(),
      });
      saveAuditLogs(logs);
      createNotification(t.userId, {
        title: 'Refund processed',
        message: `Transaction ${t.id} has been refunded (simulated) and any commission reversed.`,
        type: 'INFO',
      });
      bumpData();
      setRefundTarget(null);
      toast.success('Simulated refund processed.');
    } catch (e) {
      toast.error(e.message);
      setRefundTarget(null);
    }
  };

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Transactions</h1>
      <p className="muted small mb-3">All transactions across demo users.</p>

      <div className="card card-pad mb-3">
        <div className="grid grid-2">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Search</label>
            <input className="form-control" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Transaction ID, user name or email" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-control" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All statuses</option>
              {['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Transaction ID</th><th>User</th><th>Order</th><th>Amount</th><th>Commission</th><th>Type</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {paged.map((t) => {
                const u = users.find((x) => x.id === t.userId);
                return (
                  <tr key={t.id}>
                    <td className="mono small">{t.id}</td>
                    <td className="small">{u?.name || '—'}</td>
                    <td className="mono small">{t.orderId || '—'}</td>
                    <td>₹{t.amount.toLocaleString('en-IN')}</td>
                    <td className="text-success">₹{t.commission.toFixed(2)}</td>
                    <td><Badge status={t.type} /></td>
                    <td><Badge status={t.status} /></td>
                    <td className="small">{formatDateTime(t.createdAt)}</td>
                    <td>
                      {t.status === 'SUCCESS'
                        ? <button className="btn btn-outline btn-sm" onClick={() => setRefundTarget(t)}>Simulate Refund</button>
                        : <span className="muted small">—</span>}
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && <tr><td colSpan={9}><EmptyState title="No transactions found" message="Try adjusting the filters." /></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card-pad"><Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={setPage} /></div>
      </div>

      <Modal open={!!refundTarget} title="Simulate Refund" onClose={() => setRefundTarget(null)}
        footer={<>
          <button className="btn btn-outline" onClick={() => setRefundTarget(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={doRefund}>Confirm Refund</button>
        </>}>
        <p>Refund transaction <span className="mono">{refundTarget?.id}</span>?</p>
        <p className="muted small">This will mark the transaction as REFUNDED, reverse any commission and add a refund ledger entry. This is simulated.</p>
      </Modal>
    </div>
  );
}