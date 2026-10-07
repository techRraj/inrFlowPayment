import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiList, FiDollarSign, FiShield, FiCheckSquare, FiAlertTriangle, FiTrendingUp, FiUserCheck } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import StatCard from '../../components/StatCard.jsx';
import Badge from '../../components/Badge.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { getUsers, getTransactions, getCommissions, getKYC, getDisputes, getSettlements } from '../../services/storageService.js';
import { formatDate } from '../../utils/dates.js';

export default function AdminDashboard() {
  const { dataVersion } = useApp();
  const users = useMemo(() => getUsers(), [dataVersion]);
  const txns = useMemo(() => getTransactions(), [dataVersion]);
  const commissions = useMemo(() => getCommissions(), [dataVersion]);
  const kyc = useMemo(() => getKYC(), [dataVersion]);
  const disputes = useMemo(() => getDisputes(), [dataVersion]);
  const settlements = useMemo(() => getSettlements(), [dataVersion]);

  const totalVolume = txns.filter((t) => t.status === 'SUCCESS').reduce((a, t) => a + t.amount, 0);
  const totalCommission = commissions.filter((c) => c.status === 'CREDITED').reduce((a, c) => a + c.amount, 0);
  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
  const pendingKYC = kyc.filter((k) => k.status === 'PENDING').length;
  const openDisputes = disputes.filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW').length;
  const pendingSettlements = settlements.filter((s) => s.status === 'PENDING' || s.status === 'PROCESSING').length;
  const successCount = txns.filter((t) => t.status === 'SUCCESS').length;

  const volumeChart = useMemo(() => {
    const months = {};
    txns.forEach((t) => {
      const m = new Date(t.createdAt).toLocaleString('en-IN', { month: 'short' });
      if (!months[m]) months[m] = { month: m, volume: 0, commission: 0 };
      if (t.status === 'SUCCESS') {
        months[m].volume += t.amount;
        months[m].commission += t.commission;
      }
    });
    return Object.values(months);
  }, [txns]);

  const userGrowth = useMemo(() => {
    const months = {};
    users.forEach((u) => {
      const m = new Date(u.createdAt).toLocaleString('en-IN', { month: 'short' });
      months[m] = (months[m] || 0) + 1;
    });
    return Object.entries(months).map(([month, users]) => ({ month, users }));
  }, [users]);

  const statusChart = useMemo(() => {
    const counts = { SUCCESS: 0, PENDING: 0, FAILED: 0, REFUNDED: 0 };
    txns.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [txns]);

  const buySellChart = useMemo(() => {
    const buy = txns.filter((t) => t.type === 'BUY' && t.status === 'SUCCESS').length;
    const sell = txns.filter((t) => t.type === 'SELL' && t.status === 'SUCCESS').length;
    return [{ name: 'BUY', value: buy }, { name: 'SELL', value: sell }];
  }, [txns]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Admin Dashboard</h1>
      <p className="muted small mb-3">All statistics are calculated from stored demo records.</p>

      <div className="stat-grid mb-3">
        <StatCard label="Total Users" value={users.length} sub={`${activeUsers} active`} icon={<FiUsers />} />
        <StatCard label="Transaction Volume" value={`₹${totalVolume.toLocaleString('en-IN')}`} sub={`${successCount} successful`} icon={<FiTrendingUp />} color="#06b6d4" bg="#ecfeff" />
        <StatCard label="Total Commission" value={`₹${totalCommission.toFixed(2)}`} sub={`${commissions.length} records`} icon={<FiDollarSign />} color="#10b981" bg="#d1fae5" />
        <StatCard label="Successful Transactions" value={successCount} sub={`${txns.length} total`} icon={<FiList />} color="#4f46e5" bg="#eef2ff" />
        <StatCard label="Pending KYC" value={pendingKYC} sub="Awaiting review" icon={<FiShield />} color="#f59e0b" bg="#fef3c7" />
        <StatCard label="Pending Settlements" value={pendingSettlements} sub="To be processed" icon={<FiCheckSquare />} color="#7c3aed" bg="#ede9fe" />
        <StatCard label="Open Disputes" value={openDisputes} sub="Needs attention" icon={<FiAlertTriangle />} color="#ef4444" bg="#fee2e2" />
        <StatCard label="Active Users" value={activeUsers} sub={`${users.length - activeUsers} suspended`} icon={<FiUserCheck />} color="#10b981" bg="#d1fae5" />
      </div>

      <div className="grid grid-2 mb-3">
        <ChartCard title="Transaction Volume" sub="Monthly successful INR volume">
          <ResponsiveContainer>
            <BarChart data={volumeChart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
              <Bar dataKey="volume" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Commission" sub="Monthly commission credited">
          <ResponsiveContainer>
            <LineChart data={volumeChart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
              <Line type="monotone" dataKey="commission" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="User Growth" sub="New demo users by month">
          <ResponsiveContainer>
            <BarChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="users" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Transaction Status" sub="Distribution across statuses">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={statusChart} dataKey="value" nameKey="name" outerRadius={80} label>
                {statusChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-2 mb-3">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Recent Transactions</h3><Link className="btn btn-ghost btn-sm" to="/admin/transactions">View all</Link></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Transaction</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {txns.slice(0, 6).map((t) => {
                  const u = users.find((x) => x.id === t.userId);
                  return (
                    <tr key={t.id}>
                      <td className="mono small">{t.id}</td>
                      <td>{u?.name || '—'}</td>
                      <td>₹{t.amount.toLocaleString('en-IN')}</td>
                      <td><Badge status={t.status} /></td>
                      <td className="small">{formatDate(t.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Recent Users</h3><Link className="btn btn-ghost btn-sm" to="/admin/users">View all</Link></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>
                {users.slice(0, 6).map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td className="small">{u.email}</td>
                    <td><span className="badge badge-primary">{u.role}</span></td>
                    <td><Badge status={u.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Pending KYC</h3><Link className="btn btn-ghost btn-sm" to="/admin/kyc">Review</Link></div>
          <div className="card-pad">
            {kyc.filter((k) => k.status === 'PENDING').length === 0 ? (
              <div className="muted small">No pending KYC.</div>
            ) : kyc.filter((k) => k.status === 'PENDING').slice(0, 4).map((k) => {
              const u = users.find((x) => x.id === k.userId);
              return (
                <div key={k.id} className="flex-between" style={{ padding: '.5rem 0', borderBottom: '1px solid #eef0f6' }}>
                  <div><div style={{ fontWeight: 600 }}>{k.fullName}</div><div className="muted small">{u?.email}</div></div>
                  <Badge status={k.status} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Open Disputes</h3><Link className="btn btn-ghost btn-sm" to="/admin/disputes">Manage</Link></div>
          <div className="card-pad">
            {disputes.filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW').length === 0 ? (
              <div className="muted small">No open disputes.</div>
            ) : disputes.filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW').slice(0, 4).map((d) => (
              <div key={d.id} className="flex-between" style={{ padding: '.5rem 0', borderBottom: '1px solid #eef0f6' }}>
                <div><div className="mono small">{d.id}</div><div className="muted small">{d.reason}</div></div>
                <Badge status={d.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, sub, children }) {
  return (
    <div className="card chart-card">
      <h3 className="chart-title">{title}</h3>
      <p className="chart-sub">{sub}</p>
      <div style={{ width: '100%', height: 240 }}>
        {children}
      </div>
    </div>
  );
}