import { useMemo, useState } from 'react';
import { FiPlus, FiArrowDownCircle, FiList, FiCreditCard } from 'react-icons/fi';
import Modal from '../components/Modal.jsx';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWallet } from '../context/WalletContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { createPayment, processPayment } from '../services/demoPaymentService.js';
import { createTransaction } from '../services/transactionService.js';
import { createNotification } from '../services/notificationService.js';
import { validateAmount } from '../utils/validators.js';
import { formatDateTime } from '../utils/dates.js';

const QUICK_AMOUNTS = [500, 1000, 5000, 10000, 25000];
const METHODS = [
  { id: 'UPI_DEMO', label: 'UPI Demo', icon: '⚡' },
  { id: 'CARD_DEMO', label: 'Card Demo', icon: '💳' },
  { id: 'NETBANKING_DEMO', label: 'Net Banking Demo', icon: '🏦' },
];

export default function WalletPage() {
  const { currentUser } = useAuth();
  const { balance, totalCredits, totalDebits, totalCommission, ledger, refresh } = useWallet();
  const { bumpData } = useApp();
  const toast = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);

  const [addAmount, setAddAmount] = useState(5000);
  const [addCustom, setAddCustom] = useState('');
  const [method, setMethod] = useState('UPI_DEMO');
  const [stage, setStage] = useState('select'); // select | processing | success
  const [error, setError] = useState('');

  const [wdAmount, setWdAmount] = useState('');
  const [wdError, setWdError] = useState('');

  const summary = useMemo(() => ({
    balance, totalCredits, totalDebits, totalCommission,
  }), [balance, totalCredits, totalDebits, totalCommission]);

  const openAdd = () => { setAddOpen(true); setStage('select'); setError(''); setAddAmount(5000); setAddCustom(''); };

  const effectiveAmount = addCustom ? Number(addCustom) : Number(addAmount);

  const completeAdd = async () => {
    const err = validateAmount(effectiveAmount);
    if (err) { setError(err); return; }
    setError('');
    setStage('processing');
    const payment = createPayment({ userId: currentUser.id, amount: effectiveAmount, method });
    const result = await processPayment(payment.id, { delay: 1000 });
    if (!result.success) {
      createTransaction({
        userId: currentUser.id, orderId: null, type: 'DEPOSIT', amount: effectiveAmount,
        commission: 0, commissionRate: 0, status: 'FAILED', paymentId: payment.id,
      });
      toast.error('Simulated payment failed. No balance was added.');
      setStage('select');
      return;
    }
    // credit wallet
    const w = useWalletCredit(currentUser.id, effectiveAmount, `Demo deposit via ${METHODS.find((m) => m.id === method)?.label}`);
    createTransaction({
      userId: currentUser.id, orderId: null, type: 'DEPOSIT', amount: effectiveAmount,
      commission: 0, commissionRate: 0, status: 'SUCCESS', paymentId: payment.id,
    });
    createNotification(currentUser.id, {
      title: 'Demo payment successful',
      message: `₹${effectiveAmount.toLocaleString('en-IN')} added to your demo wallet (simulated).`,
      type: 'SUCCESS',
    });
    refresh(); bumpData();
    setStage('success');
    toast.success(`₹${effectiveAmount.toLocaleString('en-IN')} added to demo wallet.`);
  };

  const completeWithdraw = () => {
    const err = validateAmount(wdAmount);
    if (err) { setWdError(err); return; }
    if (Number(wdAmount) > balance) { setWdError('Insufficient demo wallet balance.'); return; }
    setWdError('');
    try {
      useWalletDebit(currentUser.id, Number(wdAmount), 'Demo withdrawal to Bank Account (Demo)');
      createTransaction({
        userId: currentUser.id, orderId: null, type: 'WITHDRAWAL', amount: Number(wdAmount),
        commission: 0, commissionRate: 0, status: 'SUCCESS', paymentId: `WD-${Date.now()}`,
      });
      createNotification(currentUser.id, {
        title: 'Demo withdrawal successful',
        message: `₹${Number(wdAmount).toLocaleString('en-IN')} withdrawn from demo wallet (simulated).`,
        type: 'INFO',
      });
      refresh(); bumpData();
      setWithdrawOpen(false);
      setWdAmount('');
      toast.success('Demo withdrawal successful. No real bank was involved.');
    } catch (e) {
      setWdError(e.message);
    }
  };

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Wallet</h1>
      <p className="muted small mb-3">Your demo wallet balance, totals and complete ledger.</p>

      <div className="stat-grid mb-3">
        <StatCard label="Available Balance" value={`₹${summary.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} icon={<FiCreditCard />} />
        <StatCard label="Total Credits" value={`₹${summary.totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="#10b981" bg="#d1fae5" />
        <StatCard label="Total Debits" value={`₹${summary.totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="#f59e0b" bg="#fef3c7" />
        <StatCard label="Total Commission" value={`₹${summary.totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="#06b6d4" bg="#ecfeff" />
      </div>

      <div className="flex mb-3" style={{ gap: '.6rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Demo Money</button>
        <button className="btn btn-outline" onClick={() => { setWithdrawOpen(true); setWdError(''); setWdAmount(''); }}><FiArrowDownCircle /> Withdraw Demo Money</button>
        <button className="btn btn-outline" onClick={() => setLedgerOpen(true)}><FiList /> View Ledger</button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Recent Ledger Entries</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Type</th><th>Credit</th><th>Debit</th><th>Balance</th><th>Description</th></tr>
            </thead>
            <tbody>
              {ledger.slice(0, 8).map((l) => (
                <tr key={l.id}>
                  <td className="small">{formatDateTime(l.createdAt)}</td>
                  <td><Badge status={l.type} /></td>
                  <td className="text-success">{l.credit > 0 ? `+₹${l.credit.toFixed(2)}` : '—'}</td>
                  <td className="text-danger">{l.debit > 0 ? `-₹${l.debit.toFixed(2)}` : '—'}</td>
                  <td>₹{l.balance.toFixed(2)}</td>
                  <td className="small muted">{l.description}</td>
                </tr>
              ))}
              {ledger.length === 0 && (
                <tr><td colSpan={6}><EmptyState title="No ledger entries yet" message="Add demo money to create your first ledger entry." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add money modal */}
      <Modal open={addOpen} title="Add Demo Money" onClose={() => setAddOpen(false)} size={560}
        footer={
          stage === 'success'
            ? <button className="btn btn-primary" onClick={() => setAddOpen(false)}>Done</button>
            : stage === 'processing'
              ? null
              : (<>
                <button className="btn btn-outline" onClick={() => setAddOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={completeAdd}>Complete Demo Payment</button>
              </>)
        }>
        {stage === 'select' && (
          <>
            <p className="muted small">Choose a demo amount and simulated payment method.</p>
            <div className="form-group">
              <label className="form-label">Quick amounts</label>
              <div className="flex" style={{ flexWrap: 'wrap', gap: '.4rem' }}>
                {QUICK_AMOUNTS.map((a) => (
                  <button key={a} type="button" className={`btn btn-sm ${!addCustom && addAmount === a ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setAddAmount(a); setAddCustom(''); }}>
                    ₹{a.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="custom">Custom amount (₹)</label>
              <input id="custom" className="form-control" inputMode="numeric" value={addCustom}
                onChange={(e) => setAddCustom(e.target.value.replace(/[^\d.]/g, ''))} placeholder="e.g. 7500" />
              <div className="form-hint">Maximum demo amount ₹1,00,000.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Payment method</label>
              <div className="pay-methods">
                {METHODS.map((m) => (
                  <div key={m.id} className={`pay-method ${method === m.id ? 'selected' : ''}`} onClick={() => setMethod(m.id)} role="button" tabIndex={0}>
                    <span className="pm-icon">{m.icon}</span>
                    <span style={{ fontWeight: 600 }}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card card-pad" style={{ background: '#fafbfd' }}>
              <div className="flex-between"><span className="muted small">Amount</span><strong>₹{Number(effectiveAmount || 0).toLocaleString('en-IN')}</strong></div>
              <div className="flex-between mt-1"><span className="muted small">Charges</span><span>₹0.00 (demo)</span></div>
            </div>
            {error && <div className="form-error mt-2">{error}</div>}
            <p className="muted small mt-2">SIMULATED PAYMENT — NO REAL MONEY WAS CHARGED.</p>
          </>
        )}
        {stage === 'processing' && (
          <div className="text-center" style={{ padding: '2rem 0' }}>
            <div className="spinner spinner-dark" style={{ width: 34, height: 34, borderWidth: 3 }} />
            <div className="mt-2 fw-700">Processing simulated payment…</div>
            <div className="muted small">Do not close this window.</div>
          </div>
        )}
        {stage === 'success' && (
          <div className="text-center">
            <div className="success-icon">✓</div>
            <h3 style={{ margin: 0 }}>Demo Payment Successful</h3>
            <p className="muted small mt-1">₹{Number(effectiveAmount || 0).toLocaleString('en-IN')} added to your demo wallet.</p>
            <p className="small" style={{ color: '#92400e', background: '#fef3c7', padding: '.5rem .8rem', borderRadius: 8 }}>
              SIMULATED PAYMENT — NO REAL MONEY WAS CHARGED.
            </p>
          </div>
        )}
      </Modal>

      {/* Withdraw modal */}
      <Modal open={withdrawOpen} title="Withdraw Demo Money" onClose={() => setWithdrawOpen(false)}
        footer={<>
          <button className="btn btn-outline" onClick={() => setWithdrawOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={completeWithdraw}>Confirm Demo Withdrawal</button>
        </>}>
        <p className="muted small">Withdraw from your demo wallet to a simulated bank account. No real bank details are collected.</p>
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input className="form-control" inputMode="numeric" value={wdAmount}
            onChange={(e) => setWdAmount(e.target.value.replace(/[^\d.]/g, ''))} placeholder={`Max ₹${balance.toFixed(2)}`} />
          <div className="form-hint">Available: ₹{balance.toFixed(2)}</div>
          {wdError && <div className="form-error">{wdError}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Destination</label>
          <input className="form-control" value="Bank Account (Demo)" readOnly />
        </div>
        <p className="muted small">DO NOT connect to any real bank. This is a simulated withdrawal.</p>
      </Modal>

      {/* Ledger modal */}
      <Modal open={ledgerOpen} title="Wallet Ledger" onClose={() => setLedgerOpen(false)} size={760}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Transaction ID</th><th>Type</th><th>Credit</th><th>Debit</th><th>Balance</th><th>Description</th></tr>
            </thead>
            <tbody>
              {ledger.map((l) => (
                <tr key={l.id}>
                  <td className="small">{formatDateTime(l.createdAt)}</td>
                  <td className="mono small">{l.refId || l.id}</td>
                  <td><Badge status={l.type} /></td>
                  <td className="text-success">{l.credit > 0 ? `₹${l.credit.toFixed(2)}` : '—'}</td>
                  <td className="text-danger">{l.debit > 0 ? `₹${l.debit.toFixed(2)}` : '—'}</td>
                  <td>₹{l.balance.toFixed(2)}</td>
                  <td className="small muted">{l.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}

// Inline helpers to avoid circular imports
import { creditWallet, debitWallet } from '../services/walletService.js';
function useWalletCredit(userId, amount, reason) { return creditWallet(userId, amount, reason, 'DEMO_DEPOSIT'); }
function useWalletDebit(userId, amount, reason) { return debitWallet(userId, amount, reason, 'WITHDRAWAL'); }