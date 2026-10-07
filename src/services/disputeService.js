import { getDisputes, saveDisputes } from './storageService.js';
import { generateDisputeId } from '../utils/ids.js';
import { nowISO } from '../utils/dates.js';

export function createDispute({ userId, transactionId, reason, description }) {
  const d = {
    id: generateDisputeId(),
    userId,
    transactionId,
    reason,
    description,
    status: 'OPEN',
    createdAt: nowISO(),
    updatedAt: nowISO(),
    adminResponse: null,
  };
  const list = getDisputes();
  list.unshift(d);
  saveDisputes(list);
  return d;
}

export function getUserDisputes(userId) {
  return getDisputes().filter((d) => d.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function updateDispute(id, { status, adminResponse }) {
  const list = getDisputes().map((d) =>
    d.id === id ? { ...d, status: status || d.status, adminResponse: adminResponse ?? d.adminResponse, updatedAt: nowISO() } : d
  );
  saveDisputes(list);
  return list.find((d) => d.id === id);
}