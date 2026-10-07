import { getCommissions, saveCommissions, getSettings } from './storageService.js';
import { generateCommissionId } from '../utils/ids.js';
import { nowISO } from '../utils/dates.js';
import { creditWallet } from './walletService.js';

export function getCommissionRate() {
  const s = getSettings();
  const r = Number(s.commissionRate);
  return isNaN(r) ? 2 : r;
}

export function calculateCommission(amount, rate) {
  const a = Number(amount);
  const r = Number(rate);
  if (isNaN(a) || isNaN(r)) return 0;
  return +(a * r / 100).toFixed(2);
}

export function hasCommissionForTransaction(transactionId) {
  return getCommissions().some((c) => c.transactionId === transactionId && c.status === 'CREDITED');
}

export function getCommissionForTransaction(transactionId) {
  return getCommissions().find((c) => c.transactionId === transactionId) || null;
}

export function creditCommission(userId, transactionId, amount, rate, transactionAmount) {
  if (hasCommissionForTransaction(transactionId)) {
    throw new Error('Commission has already been processed for this transaction.');
  }
  const list = getCommissions();
  const record = {
    id: generateCommissionId(),
    userId,
    transactionId,
    amount: +Number(amount).toFixed(2),
    rate: Number(rate),
    transactionAmount: +Number(transactionAmount).toFixed(2),
    status: 'CREDITED',
    createdAt: nowISO(),
  };
  list.unshift(record);
  saveCommissions(list);
  creditWallet(userId, record.amount, `Commission ${rate}% on ${transactionId}`, 'COMMISSION', transactionId);
  return record;
}

export function reverseCommission(transactionId) {
  const list = getCommissions();
  const idx = list.findIndex((c) => c.transactionId === transactionId && c.status === 'CREDITED');
  if (idx === -1) return null;
  list[idx] = { ...list[idx], status: 'REVERSED', reversedAt: nowISO() };
  saveCommissions(list);
  return list[idx];
}

export function getUserCommissions(userId) {
  return getCommissions().filter((c) => c.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getCommissionSummary(userId) {
  const all = getCommissions().filter((c) => c.userId === userId);
  const credited = all.filter((c) => c.status === 'CREDITED');
  const total = credited.reduce((a, c) => a + c.amount, 0);
  return {
    total: +total.toFixed(2),
    count: credited.length,
    all,
  };
}