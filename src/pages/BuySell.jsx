import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiInfo, FiArrowRight } from 'react-icons/fi';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWallet } from '../context/WalletContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { createOrder } from '../services/orderService.js';
import { createTransaction } from '../services/transactionService.js';
import { createPayment, processPayment } from '../services/demoPaymentService.js';
import { getCommissionRate, calculateCommission, creditCommission, hasCommissionForTransaction } from '../services/commissionService.js';
import { createNotification } from '../services/notificationService.js';
import { validateAmount } from '../utils/validators.js';

export default function BuySell() {
  const { currentUser } = useAuth();
  const { refresh } = useWallet();
  const { bumpData } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState('BUY');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [stage, setStage] = useState('review'); // review | processing | done
  const [createdTxn, setCreatedTxn] = useState(null);
  const [simulateFailure, setSimulateFailure] = useState(false);

  const rate = getCommissionRate();
  const commission = useMemo(() => calculateCommission(Number(amount || 0), rate), [amount, rate]);
  const total = useMemo(() => Number(amount || 0), [amount]);

  const onContinue = () => {
    const err = validateAmount(amount);
    if (err) { setError(err); return; }
    setError('');
    setStage('review');
    setSimulateFailure(false);
    setReviewOpen(true);
  };

  const runPayment = async () => {
    setStage('processing');
    const order = createOrder({
      userId: currentUser.id, type: tab, amount: Number(amount),
      commissionRate: rate, commission, status: 'READY',
    });
    const payment = createPayment({ userId: currentUser.id, amount: Number(amount), orderId: order.id });
    const result = await processPayment(payment.id, { delay: 1000, simulateFailure });

    const txn = createTransaction({
      userId: currentUser.id, orderId: order.id, type: tab, amount: Number(amount),
      commission, commissionRate: rate,
      status: result.success ? 'SUCCESS' : 'FAILED',
      paymentId: payment.id,
    });

    if (result.success) {
      // commission credit (with duplicate protection)
      if (!hasCommissionForTransaction(txn.id)) {
        creditCommission(currentUser.id, txn.id, commission, rate, Number(amount));
      }
      createNotification(currentUser.id, {
        title: `₹${commission.toFixed(2)} commission credited`,
        message: `Commission credited for transaction ${txn.id}.`,
        type: 'SUCCESS',
      });
      toast.success(`Transaction successful. ₹${commission.toFixed(2)} commission credited.`);
    } else {
      createNotification(currentUser.id, {
        title: 'Demo payment failed',
        message: `Your simulated ${tab} payment of ₹${Number(amount).toLocaleString('en-IN')} failed. No commission was credited.`,
        type: 'ERROR',
      });
      toast.error('Simulated payment failed. No commission credited.');
    }

    setCreatedTxn(txn);
    setStage('done');
    refresh(); bumpData();
  };

  const reset = () => {
    setReviewOpen(false);
    setAmount('');
    setStage('review');
    setCreatedTxn(null);
  };

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Buy &amp; Sell</h1>
      <p className="muted small mb-3">Place a demo order. Commission is calculated automatically — you cannot edit it.</p>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header" style={{ padding: 0 }}>
            <div className="flex" style={{ width: '100%' }}>
              {['BUY', 'SELL'].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    flex: 1, padding: '1rem', border: 'none', background: tab === t ? '#fff' : '#fafbfd',
                    borderBottom: tab === t ? '3px solid #4f46e5' : '3px solid transparent',
                    fontWeight: 700, color: tab === t ? '#4f46e5' : '#6b7280',
                  }}>{t}</button>
              ))}
            </div>
          </div>
          <div className="card-pad">
            <div className="form-group">
              <label className="form-label" htmlFor="amount">Amount (₹)</label>
              <input id="amount" className="form-control" inputMode="numeric" value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="e.g. 10000" style={{ fontSize: '1.15rem', padding: '.85rem 1rem' }} />
              <div className="form-hint">Maximum demo transaction ₹1,00,000.</div>
              {error && <div className="form-error">{error}</div>}
            </div>

            <div className="flex" style={{ flexWrap: 'wrap', gap: '.4rem', marginBottom: '1rem' }}>
              {[1000, 2500, 5000, 10000, 25000].map((a) => (
                <button key={a} className="btn btn-outline btn-sm" onClick={() => setAmount(String(a))}>
                  ₹{a.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <div className="card card-pad" style={{ background: '#fafbfd' }}>
              <div className="flex-between"><span className="muted small">Transaction amount</span><strong>₹{Number(amount || 0).toLocaleString('en-IN')}</strong></div>
              <div className="flex-between mt-1"><span className="muted small">Commission rate</span><strong>{rate}%</strong></div>
              <div className="flex-between mt-1"><span className="muted small">Commission</span><strong className="text-success">₹{commission.toFixed(2)}</strong></div>
              <div className="divider" />
              <div className="flex-between"><span className="muted small">Total</span><strong>₹{Number(amount || 0).toLocaleString('en-IN')}</strong></div>
              <div className="flex-between mt-1"><span className="muted small">Expected wallet credit</span><strong className="text-success">₹{commission.toFixed(2)}</strong></div>
            </div>

            <button className="btn btn-primary btn-block btn-lg mt-2" onClick={onContinue}>
              Continue <FiArrowRight />
            </button>
            <p className="muted small mt-2"><FiInfo /> Commission is set by admin and cannot be edited here.</p>
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="card-title mb-1">How commission works</h3>
          <p className="muted small">On every successful {tab} transaction, commission is calculated and credited to your demo wallet automatically.</p>
          <div className="card card-pad" style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
            <div className="small fw-700">Formula</div>
            <div className="mono mt-1">commission = amount × rate ÷ 100</div>
            <div className="muted small mt-1">₹{Number(amount || 10000).toLocaleString('en-IN')} × {rate}% = ₹{calculateCommission(Number(amount || 10000), rate).toFixed(2)}</div>
          </div>
          <ul className="muted small mt-2" style={{ paddingLeft: '1.1rem' }}>
            <li>Only successful transactions credit commission.</li>
            <li>Failed payments do not credit commission.</li>
            <li>Duplicate protection prevents double crediting.</li>
            <li>Historical rates are preserved on each record.</li>
          </ul>
        </div>
      </div>

      <Modal open={reviewOpen} title="Order Summary" onClose={reset} size={520}
        footer={
          stage === 'review'
            ? (<>
              <button className="btn btn-outline" onClick={reset}>Back</button>
              <button className="btn btn-danger" onClick={() => { setSimulateFailure(true); runPayment(); }}>Simulate Failed Payment</button>
              <button className="btn btn-primary" onClick={() => { setSimulateFailure(false); runPayment(); }}>Simulate Payment</button>
            </>)
            : stage === 'processing' ? null : (
              <button className="btn btn-primary" onClick={() => { reset(); navigate(`/transactions/${createdTxn?.id}`); }}>View Transaction</button>
            )
        }>
        {stage === 'review' && (
          <>
            <div className="flex-between mb-1"><span className="muted small">Type</span><strong>{tab}</strong></div>
            <div className="flex-between mb-1"><span className="muted small">Amount</span><strong>₹{Number(amount).toLocaleString('en-IN')}</strong></div>
            <div className="flex-between mb-1"><span className="muted small">Commission Rate</span><strong>{rate}%</strong></div>
            <div className="flex-between mb-1"><span className="muted small">Commission</span><strong className="text-success">₹{commission.toFixed(2)}</strong></div>
            <div className="flex-between mb-1"><span className="muted small">Status</span><span className="badge badge-warning">READY FOR DEMO PAYMENT</span></div>
            <p className="muted small mt-2">This is a simulated payment. No real money is processed.</p>
          </>
        )}
        {stage === 'processing' && (
          <div className="text-center" style={{ padding: '2rem 0' }}>
            <div className="spinner spinner-dark" style={{ width: 34, height: 34, borderWidth: 3 }} />
            <div className="mt-2 fw-700">Processing simulated payment…</div>
            <div className="muted small">{simulateFailure ? 'Failure will be simulated.' : 'This takes about 1 second.'}</div>
          </div>
        )}
        {stage === 'done' && createdTxn && (
          <div className="text-center">
            {createdTxn.status === 'SUCCESS' ? (
              <>
                <div className="success-icon">✓</div>
                <h3 style={{ margin: 0 }}>Transaction Successful</h3>
                <p className="muted small mt-1">Commission credited to your demo wallet.</p>
                <div className="card card-pad mt-2" style={{ textAlign: 'left' }}>
                  <div className="flex-between"><span className="muted small">Transaction ID</span><span className="mono">{createdTxn.id}</span></div>
                  <div className="flex-between mt-1"><span className="muted small">Amount</span><strong>₹{createdTxn.amount.toLocaleString('en-IN')}</strong></div>
                  <div className="flex-between mt-1"><span className="muted small">Commission</span><strong className="text-success">₹{createdTxn.commission.toFixed(2)}</strong></div>
                </div>
              </>
            ) : (
              <>
                <div className="success-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>✕</div>
                <h3 style={{ margin: 0 }}>Demo Payment Failed</h3>
                <p className="muted small mt-1">No commission was credited for this transaction.</p>
                <div className="flex-between mt-2"><span className="muted small">Transaction ID</span><span className="mono">{createdTxn.id}</span></div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}