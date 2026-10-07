import { useMemo, useState } from 'react';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { getOrders, getUsers } from '../../services/storageService.js';
import { formatDateTime } from '../../utils/dates.js';

export default function AdminOrders() {
  const { dataVersion } = useApp();
  const [search, setSearch] = useState('');
  const orders = useMemo(() => getOrders(), [dataVersion]);
  const users = useMemo(() => getUsers(), [dataVersion]);

  const filtered = orders.filter((o) => {
    const u = users.find((x) => x.id === o.userId);
    return !search || `${o.id} ${u?.email || ''}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Orders</h1>
      <p className="muted small mb-3">Buy/sell orders created during demo transactions.</p>

      <div className="card card-pad mb-3">
        <input className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID or user" />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Order ID</th><th>User</th><th>Type</th><th>Amount</th><th>Rate</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.map((o) => {
                const u = users.find((x) => x.id === o.userId);
                return (
                  <tr key={o.id}>
                    <td className="mono small">{o.id}</td>
                    <td className="small">{u?.name || '—'}</td>
                    <td><Badge status={o.type} /></td>
                    <td>₹{o.amount.toLocaleString('en-IN')}</td>
                    <td>{o.commissionRate}%</td>
                    <td className="text-success">₹{o.commission.toFixed(2)}</td>
                    <td><Badge status={o.status} /></td>
                    <td className="small">{formatDateTime(o.createdAt)}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8}><EmptyState title="No orders found" message="Orders appear here when buy/sell transactions are placed." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}