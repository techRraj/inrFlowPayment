import { useMemo, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatCard from '../../components/StatCard.jsx';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { getTransactions, getUsers } from '../../services/storageService.js';
import { buildReportData, toCSV, downloadFile } from '../../services/reportService.js';
import { formatDate } from '../../utils/dates.js';

export default function AdminReports() {
  const { dataVersion } = useApp();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const report = useMemo(() => buildReportData({ from, to }), [from, to, dataVersion]);
  const users = useMemo(() => getUsers(), [dataVersion]);

  const chart = useMemo(() => {
    const byType = {};
    report.transactions.forEach((t) => {
      byType[t.type] = (byType[t.type] || 0) + (t.status === 'SUCCESS' ? t.amount : 0);
    });
    return Object.entries(byType).map(([type, amount]) => ({ type, amount }));
  }, [report]);

  const exportCSV = () => {
    const rows = report.transactions.map((t) => ({
      id: t.id, orderId: t.orderId || '', type: t.type, amount: t.amount,
      commission: t.commission, status: t.status, createdAt: t.createdAt,
    }));
    const csv = toCSV(rows, [
      { label: 'Transaction ID', value: 'id' },
      { label: 'Order ID', value: 'orderId' },
      { label: 'Type', value: 'type' },
      { label: 'Amount', value: 'amount' },
      { label: 'Commission', value: 'commission' },
      { label: 'Status', value: 'status' },
      { label: 'Created', value: 'createdAt' },
    ]);
    downloadFile('inrflow-demo-report.csv', csv, 'text/csv');
  };

  return (
    <div>
      <div className="flex-between mb-3" style={{ flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Reports</h1>
          <p className="muted small" style={{ margin: '.25rem 0 0' }}>Business reporting from local demo data.</p>
        </div>
        <button className="btn btn-primary" onClick={exportCSV}><FiDownload /> Export CSV</button>
      </div>

      <div className="card card-pad mb-3">
        <div className="grid grid-2">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">From</label>
            <input type="date" className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">To</label>
            <input type="date" className="form-control" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="stat-grid mb-3">
        <StatCard label="Total Volume" value={`₹${report.totalVolume.toLocaleString('en-IN')}`} sub="Successful transactions" />
        <StatCard label="Total Commission" value={`₹${report.totalCommission.toFixed(2)}`} sub="Credited" color="#10b981" bg="#d1fae5" />
        <StatCard label="Successful" value={report.successful} sub="Transactions" color="#06b6d4" bg="#ecfeff" />
        <StatCard label="Failed" value={report.failed} sub="Transactions" color="#ef4444" bg="#fee2e2" />
        <StatCard label="Refunds" value={report.refunds} sub="Transactions" color="#f59e0b" bg="#fef3c7" />
        <StatCard label="Settlements" value={report.settlements} sub="Total records" color="#7c3aed" bg="#ede9fe" />
      </div>

      <div className="card chart-card mb-3">
        <h3 className="chart-title">Volume by Type</h3>
        <p className="chart-sub">Successful INR volume grouped by transaction type</p>
        <div style={{ width: '100%', height: 260 }}>
          {chart.length === 0 ? <div className="muted small">No data in selected range.</div> : (
            <ResponsiveContainer>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="type" fontSize={12} /><YAxis fontSize={12} />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Transactions in Range ({report.transactions.length})</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Transaction</th><th>User</th><th>Amount</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {report.transactions.slice(0, 30).map((t) => {
                const u = users.find((x) => x.id === t.userId);
                return (
                  <tr key={t.id}>
                    <td className="mono small">{t.id}</td>
                    <td className="small">{u?.name || '—'}</td>
                    <td>₹{t.amount.toLocaleString('en-IN')}</td>
                    <td className="text-success">₹{t.commission.toFixed(2)}</td>
                    <td><Badge status={t.status} /></td>
                    <td className="small">{formatDate(t.createdAt)}</td>
                  </tr>
                );
              })}
              {report.transactions.length === 0 && <tr><td colSpan={6}><EmptyState title="No transactions in range" message="Adjust the date filters." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}