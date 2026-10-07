import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCreditCard, FiDollarSign, FiList, FiClock, FiPlus, FiRepeat, FiTrendingUp, FiZap,
} from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWallet } from '../context/WalletContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getUserTransactions, getTransactionSummary, createTransaction } from '../services/transactionService.js';
import { getUserCommissions, getCommissionSummary, getCommissionRate, calculateCommission, creditCommission, hasCommissionForTransaction } from '../services/commissionService.js';
import { createOrder } from '../services/orderService.js';
import { createNotification } from '../services/notificationService.js';
import { createPayment } from '../services/demoPaymentService.js';
import { formatDate } from '../utils/dates.js';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { balance, totalCommission, refresh, ledger } = useWallet();
  const { bumpData } = useApp();
  const toast = useToast();
  const [version, setVersion] = useState(0);
  const [tourOpen, setTourOpen] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStage, setDemoStage] = useState('');

  const txns = useMemo(() => getUserTransactions(currentUser.id), [currentUser.id, version]);
  const txnSummary = useMemo(() => getTransactionSummary(currentUser.id), [currentUser.id, version]);
  const commissions = useMemo(() => getUserCommissions(currentUser.id), [currentUser.id, version]);
  const commSummary = useMemo(() => getCommissionSummary(currentUser.id), [currentUser.id, version]);

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

  const statusChart = useMemo(() => {
    const counts = { SUCCESS: 0, PENDING: 0, FAILED: 0, REFUNDED: 0 };
    txns.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [txns]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  const refreshAll = () => { refresh(); bumpData(); setVersion((v) => v + 1); };

  // Guided demo transaction
  const runDemoTransaction = async () => {
    if (demoRunning) return;
    setDemoRunning(true);
    const amount = 10000;
    const rate = getCommissionRate();
    const commission = calculateCommission(amount, rate);

    try {
      setDemoStage('1/7 · Creating order…');
      const order = createOrder({ userId: currentUser.id, type: 'BUY', amount, commissionRate: rate, commission, status: 'READY' });
      await wait(400);

      setDemoStage('2/7 · Initiating demo payment…');
      const payment = createPayment({ userId: currentUser.id, amount, orderId: order.id, method: 'UPI_DEMO' });
      await wait(400);

      setDemoStage('3/7 · Simulating payment success…');
      await wait(500);

      setDemoStage(`4/7 · Calculating ${rate}% commission…`);
      const txn = createTransaction({
        userId: currentUser.id, orderId: order.id, type: 'BUY', amount,
        commission, commissionRate: rate, status: 'SUCCESS', paymentId: payment.id,
      });
      await wait(300);

      setDemoStage('5/7 · Crediting commission to wallet…');
      if (!hasCommissionForTransaction(txn.id)) {
        creditCommission(currentUser.id, txn.id, commission, rate, amount);
      }
      await wait(400);

      setDemoStage('6/7 · Creating notification…');
      createNotification(currentUser.id, {
        title: `₹${commission.toFixed(2)} commission credited`,
        message: `Commission credited for demo transaction ${txn.id}.`,
        type: 'SUCCESS',
      });
      await wait(300);

      setDemoStage('7/7 · Updating dashboard…');
      await wait(300);

      refreshAll();
      toast.success(`Demo transaction complete. ₹${commission.toFixed(2)} commission credited.`);
    } catch (e) {
      toast.error(e.message || 'Demo transaction failed.');
    } finally {
      setDemoRunning(false);
      setDemoStage('');
    }
  };

  return (
    <div>
      <div className="flex-between mb-3" style={{ flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Welcome back, {currentUser?.name?.split(' ')[0]}</h1>
          <p className="muted small" style={{ margin: '.25rem 0 0' }}>Here is your demo wallet and transaction overview.</p>
        </div>
        <div className="flex" style={{ gap: '.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setTourOpen(true)}>Product Tour</button>
          <button className="btn btn-outline btn-sm" onClick={() => runDemoTransaction()} disabled={demoRunning}>
            {demoRunning ? <span className="spinner spinner-dark" /> : <><FiZap /> Run Demo Transaction</>}
          </button>
        </div>
      </div>

      {demoRunning && (
        <div className="card card-pad mb-2" style={{ borderColor: '#c7d2fe', background: '#eef2ff' }}>
          <div className="flex-center">
            <span className="spinner spinner-dark" />
            <strong>Demo running:</strong> <span>{demoStage}</span>
          </div>
        </div>
      )}

      <div className="stat-grid mb-3">
        <StatCard label="Available Balance" value={`₹${Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} sub="Demo wallet" icon={<FiCreditCard />} />
        <StatCard label="Total Commission" value={`₹${Number(totalCommission).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} sub={`${commSummary.count} commission credits`} icon={<FiDollarSign />} color="#10b981" bg="#d1fae5" />
        <StatCard label="Total Transactions" value={txnSummary.total} sub={`${txnSummary.successCount} successful`} icon={<FiList />} color="#06b6d4" bg="#ecfeff" />
        <StatCard label="Pending Transactions" value={txnSummary.pending} sub="Awaiting completion" icon={<FiClock />} color="#f59e0b" bg="#fef3c7" />
      </div>

      <div className="grid grid-2 mb-3">
        <div className="card chart-card">
          <h3 className="chart-title">Transaction Volume</h3>
          <p className="chart-sub">Successful INR volume by month</p>
          <div style={{ width: '100%', height: 240 }}>
            {volumeChart.length === 0 ? <div className="muted small">No data yet.</div> : (
              <ResponsiveContainer>
                <BarChart data={volumeChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                  <Bar dataKey="volume" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">Commission Earnings</h3>
          <p className="chart-sub">Commission credited over time</p>
          <div style={{ width: '100%', height: 240 }}>
            {volumeChart.length === 0 ? <div className="muted small">No data yet.</div> : (
              <ResponsiveContainer>
                <LineChart data={volumeChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                  <Line type="monotone" dataKey="commission" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-2 mb-3">
        <div className="card chart-card">
          <h3 className="chart-title">Wallet Activity</h3>
          <p className="chart-sub">Latest ledger movements</p>
          <div style={{ width: '100%', height: 220 }}>
            {ledger.length === 0 ? <div className="muted small">No ledger entries yet.</div> : (
              <ResponsiveContainer>
                <LineChart data={[...ledger].reverse().slice(-10).map((l) => ({ date: formatDate(l.createdAt), balance: l.balance }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                  <Line type="monotone" dataKey="balance" stroke="#06b6d4" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">Transaction Status</h3>
          <p className="chart-sub">Distribution of your transactions</p>
          <div style={{ width: '100%', height: 220 }}>
            {statusChart.length === 0 ? <div className="muted small">No transactions yet.</div> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusChart} dataKey="value" nameKey="name" outerRadius={80} label>
                    {statusChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="card-pad grid grid-3">
          <Link to="/wallet" className="btn btn-primary btn-block"><FiPlus /> Add Demo Money</Link>
          <Link to="/buy-sell" className="btn btn-outline btn-block"><FiRepeat /> Buy</Link>
          <Link to="/transactions" className="btn btn-outline btn-block"><FiList /> View Transactions</Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Transactions</h3>
          <Link to="/transactions" className="btn btn-ghost btn-sm">View all</Link>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Transaction</th><th>Type</th><th>Amount</th><th>Commission</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {txns.slice(0, 5).map((t) => (
                <tr key={t.id}>
                  <td className="mono"><Link to={`/transactions/${t.id}`}>{t.id}</Link></td>
                  <td><Badge status={t.type} /></td>
                  <td>₹{t.amount.toLocaleString('en-IN')}</td>
                  <td className="text-success">+₹{t.commission.toFixed(2)}</td>
                  <td><Badge status={t.status} /></td>
                  <td>{formatDate(t.createdAt)}</td>
                </tr>
              ))}
              {txns.length === 0 && (
                <tr><td colSpan={6}><div className="text-center muted small" style={{ padding: '1.5rem' }}>No transactions yet.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product tour modal */}
      <Modal open={tourOpen} title="Product Tour" onClose={() => setTourOpen(false)} size={560}
        footer={<button className="btn btn-primary" onClick={() => setTourOpen(false)}>Got it</button>}>
        <div className="grid" style={{ gap: '.9rem' }}>
          {[
            ['Wallet', 'Track balance, credits, debits and full ledger. Add or withdraw demo money.'],
            ['Buy / Sell', 'Enter an amount, review the order and run a simulated payment.'],
            ['Commission', '2% commission is calculated and credited automatically on success.'],
            ['Transactions', 'Search, filter and inspect the full lifecycle of each transaction.'],
            ['Admin', 'Sign in as admin@demo.com to manage users, KYC, settlements, disputes and reports.'],
          ].map(([t, d]) => (
            <div key={t} className="card card-pad" style={{ padding: '.85rem 1rem' }}>
              <div style={{ fontWeight: 700 }}>{t}</div>
              <div className="muted small">{d}</div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }