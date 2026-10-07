import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import Badge from '../components/Badge.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { getUserTransactions } from '../services/transactionService.js';
import { formatDate } from '../utils/dates.js';

export default function Transactions() {
  const { currentUser } = useAuth();
  const { dataVersion } = useApp();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const all = useMemo(() => getUserTransactions(currentUser.id), [currentUser.id, dataVersion]);

  const filtered = useMemo(() => {
    return all.filter((t) => {
      if (search && !`${t.id} ${t.orderId || ''} ${t.paymentId || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (type && t.type !== type) return false;
      if (status && t.status !== status) return false;
      if (from && new Date(t.createdAt) < new Date(from)) return false;
      if (to && new Date(t.createdAt) > new Date(to)) return false;
      return true;
    });
  }, [all, search, type, status, from, to]);

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Transactions</h1>
      <p className="muted small mb-3">Search, filter and inspect every transaction in your demo history.</p>

      <div className="card card-pad mb-3">
        <div className="grid grid-3">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label"><FiSearch /> Search</label>
            <input className="form-control" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Transaction, order or payment ID" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Type</label>
            <select className="form-control" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
              <option value="">All types</option>
              {['BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-control" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All statuses</option>
              {['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">From</label>
            <input type="date" className="form-control" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">To</label>
            <input type="date" className="form-control" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
          </div>
          <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-outline w-100" onClick={() => { setSearch(''); setType(''); setStatus(''); setFrom(''); setTo(''); setPage(1); }}>Reset filters</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Results ({filtered.length})</h3>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th><th>Order ID</th><th>Type</th><th>Amount</th>
                <th>Commission</th><th>Status</th><th>Date</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((t) => (
                <tr key={t.id}>
                  <td className="mono small">{t.id}</td>
                  <td className="mono small">{t.orderId || '—'}</td>
                  <td><Badge status={t.type} /></td>
                  <td>₹{t.amount.toLocaleString('en-IN')}</td>
                  <td className="text-success">{t.commission > 0 ? `+₹${t.commission.toFixed(2)}` : '—'}</td>
                  <td><Badge status={t.status} /></td>
                  <td className="small">{formatDate(t.createdAt)}</td>
                  <td><Link className="btn btn-ghost btn-sm" to={`/transactions/${t.id}`}>View</Link></td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={8}><EmptyState title="No transactions found" message="Try adjusting the filters or run a new demo transaction." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-pad">
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}