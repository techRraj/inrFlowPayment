// In-memory payment store + localStorage persist for demo
import { getStorage, setStorage } from './storageService.js';
import { generatePaymentId } from '../utils/ids.js';
import { nowISO } from '../utils/dates.js';

const PAY_KEY = 'inrflow_payments';

function getPayments() { return getStorage(PAY_KEY, []); }
function savePayments(list) { setStorage(PAY_KEY, list); }

export function createPayment({ userId, amount, method = 'UPI_DEMO', orderId }) {
  const p = {
    id: generatePaymentId(),
    userId,
    orderId,
    amount: +Number(amount).toFixed(2),
    method,
    status: 'PENDING',
    createdAt: nowISO(),
    completedAt: null,
  };
  const list = getPayments();
  list.unshift(p);
  savePayments(list);
  return p;
}

export function getPayment(id) {
  return getPayments().find((p) => p.id === id) || null;
}

export function processPayment(paymentId, { simulateFailure = false, delay = 1000 } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = getPayments();
      const idx = list.findIndex((p) => p.id === paymentId);
      if (idx === -1) return resolve({ success: false, error: 'Payment not found.' });
      const status = simulateFailure ? 'FAILED' : 'SUCCESS';
      list[idx] = { ...list[idx], status, completedAt: nowISO() };
      savePayments(list);
      resolve({ success: !simulateFailure, payment: list[idx] });
    }, delay);
  });
}

export function refundPayment(paymentId) {
  const list = getPayments();
  const idx = list.findIndex((p) => p.id === paymentId);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], status: 'REFUNDED', refundedAt: nowISO() };
  savePayments(list);
  return list[idx];
}