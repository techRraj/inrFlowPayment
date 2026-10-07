import { useMemo, useState } from 'react';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getSettlements, getUsers, getAuditLogs, saveAuditLogs } from '../../services/storageService.js';
import { processSettlement } from '../../services/settlementService.js';
import { generateAuditId } from '../../utils/ids.js';
import { nowISO, formatDateTime } from '../../utils/dates.js';

export default function AdminSettlements() {
  const { dataVersion, bumpData } = useApp();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(null);

  const settlements = useMemo(() => getSettlements(), [dataVersion]);
  const users = useMemo(() => getUsers(), [dataVersion]);

  const process = async (s) => {
    setBusy(s.id);
    await processSettlement(s.id);
    const logs = getAuditLogs();
    logs.unshift({
      id: generateAuditId(), action: 'SETTLEMENT_PROCESSED', admin: currentUser.name, target: s.id,
      description: `Processed demo settlement ${s.id}`, createdAt: nowISO(),
    });
    saveAuditLogs(logs);
    setBusy(null); bumpData();
    toast.success('Demo settlement settled. No real money transferred.');
  };

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Settlements</h1>
      <p className="muted small mb-3">Simulate settlement processing. No real money is transferred.</p>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Settlement ID</th><th>User</th><th>Amount</th><th>Transactions</th><th>Commission</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {settlements.map((s) => {
                const u = users.find((x) => x.id === s.userId);
                return (
                  <tr key={s.id}>
                    <td className="mono small">{s.id}</td>
                    <td className="small">{u?.name || '—'}</td>
                    <td>₹{s.amount.toLocaleString('en-IN')}</td>
                    <td>{s.transactionCount}</td>
                    <td className="text-success">₹{s.commission.toFixed(2)}</td>
                    <td><Badge status={s.status} /></td>
                    <td className="small">{formatDateTime(s.createdAt)}</td>
                    <td>
                      {s.status === 'PENDING'
                        ? <button className="btn btn-primary btn-sm" disabled={busy === s.id} onClick={() => process(s)}>
                          {busy === s.id ? <span className="spinner" /> : 'Process Demo Settlement'}
                        </button>
                        : <span className="muted small">{s.status === 'SETTLED' ? 'Settled' : '—'}</span>}
                    </td>
                  </tr>
                );
              })}
              {settlements.length === 0 && <tr><td colSpan={8}><EmptyState title="No settlements" message="Settlements will appear here." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}