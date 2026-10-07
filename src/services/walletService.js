import {
  getWallet, saveWallet, getLedgerAll, saveLedgerAll,
} from './storageService.js';
import { generateLedgerId } from '../utils/ids.js';
import { nowISO } from '../utils/dates.js';

export function ensureWallet(userId) {
  let w = getWallet(userId);
  if (!w) {
    w = { userId, balance: 0, totalCredits: 0, totalDebits: 0, totalCommission: 0, updatedAt: nowISO() };
    saveWallet(w);
  }
  return w;
}

export function getBalance(userId) {
  return ensureWallet(userId).balance;
}

export function creditWallet(userId, amount, reason, type = 'CREDIT', refId = null) {
  const amt = Number(amount);
  if (!amt || amt <= 0) throw new Error('Credit amount must be greater than 0.');
  const w = ensureWallet(userId);
  w.balance = +(w.balance + amt).toFixed(2);
  w.totalCredits = +(w.totalCredits + amt).toFixed(2);
  if (type === 'COMMISSION') w.totalCommission = +(w.totalCommission + amt).toFixed(2);
  w.updatedAt = nowISO();
  saveWallet(w);
  createLedgerEntry(userId, {
    type, credit: amt, debit: 0, balance: w.balance, description: reason, refId,
  });
  return w;
}

export function debitWallet(userId, amount, reason, type = 'DEBIT', refId = null) {
  const amt = Number(amount);
  if (!amt || amt <= 0) throw new Error('Debit amount must be greater than 0.');
  const w = ensureWallet(userId);
  if (w.balance < amt) throw new Error('Insufficient demo wallet balance.');
  w.balance = +(w.balance - amt).toFixed(2);
  w.totalDebits = +(w.totalDebits + amt).toFixed(2);
  w.updatedAt = nowISO();
  saveWallet(w);
  createLedgerEntry(userId, {
    type, credit: 0, debit: amt, balance: w.balance, description: reason, refId,
  });
  return w;
}

export function createLedgerEntry(userId, { type, credit, debit, balance, description, refId = null }) {
  const list = getLedgerAll();
  const entry = {
    id: generateLedgerId(),
    userId,
    type,
    credit: +credit.toFixed(2),
    debit: +debit.toFixed(2),
    balance: +balance.toFixed(2),
    description,
    refId,
    createdAt: nowISO(),
  };
  list.unshift(entry);
  saveLedgerAll(list);
  return entry;
}

export function getLedger(userId) {
  return getLedgerAll().filter((e) => e.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getWalletSummary(userId) {
  const w = ensureWallet(userId);
  return {
    balance: w.balance,
    totalCredits: w.totalCredits,
    totalDebits: w.totalDebits,
    totalCommission: w.totalCommission,
  };
}