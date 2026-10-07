import { getTransactions, saveTransactions } from './storageService.js';
import { generateTxnId, generatePaymentId } from '../utils/ids.js';
import { nowISO } from '../utils/dates.js';

export function createTransaction({ userId, orderId, type, amount, commission, commissionRate, status, paymentId }) {
  const txn = {
    id: generateTxnId(),
    orderId,
    userId,
    paymentId: paymentId || generatePaymentId(),
    type,
    amount: +Number(amount).toFixed(2),
    commission: +Number(commission).toFixed(2),
    commissionRate: Number(commissionRate),
    status,
    createdAt: nowISO(),
    timeline: {
      orderCreated: nowISO(),
      paymentInitiated: nowISO(),
      paymentSuccess: status === 'SUCCESS' ? nowISO() : null,
      commissionCalculated: status === 'SUCCESS' ? nowISO() : null,
      commissionCredited: status === 'SUCCESS' ? nowISO() : null,
      completed: status === 'SUCCESS' ? nowISO() : null,
    },
  };
  const list = getTransactions();
  list.unshift(txn);
  saveTransactions(list);
  return txn;
}

export function getTransactionById(id) {
  return getTransactions().find((t) => t.id === id) || null;
}

export function getUserTransactions(userId) {
  return getTransactions().filter((t) => t.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function updateTransactionStatus(id, status, patch = {}) {
  const list = getTransactions().map((t) => (t.id === id ? { ...t, status, ...patch } : t));
  saveTransactions(list);
  return list.find((t) => t.id === id);
}

export function refundTransaction(id) {
  const list = getTransactions();
  const t = list.find((x) => x.id === id);
  if (!t) throw new Error('Transaction not found.');
  if (t.status === 'REFUNDED') throw new Error('Transaction already refunded.');
  if (t.status !== 'SUCCESS') throw new Error('Only successful transactions can be refunded.');
  const updated = { ...t, status: 'REFUNDED', refundedAt: nowISO() };
  const idx = list.findIndex((x) => x.id === id);
  list[idx] = updated;
  saveTransactions(list);
  return updated;
}

export function getTransactionSummary(userId) {
  const list = getUserTransactions(userId);
  const success = list.filter((t) => t.status === 'SUCCESS');
  return {
    total: list.length,
    pending: list.filter((t) => t.status === 'PENDING').length,
    volume: success.reduce((a, t) => a + t.amount, 0),
    successCount: success.length,
    failedCount: list.filter((t) => t.status === 'FAILED').length,
  };
}