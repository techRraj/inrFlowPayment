import { getSettlements, saveSettlements } from './storageService.js';
import { generateSettlementId } from '../utils/ids.js';
import { nowISO } from '../utils/dates.js';

export function getUserSettlements(userId) {
  return getSettlements().filter((s) => s.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function processSettlement(id) {
  return new Promise((resolve) => {
    const list = getSettlements();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return resolve(null);
    list[idx] = { ...list[idx], status: 'PROCESSING', updatedAt: nowISO() };
    saveSettlements(list);
    setTimeout(() => {
      const l2 = getSettlements();
      const i2 = l2.findIndex((s) => s.id === id);
      if (i2 === -1) return resolve(null);
      l2[i2] = { ...l2[i2], status: 'SETTLED', settledAt: nowISO(), updatedAt: nowISO() };
      saveSettlements(l2);
      resolve(l2[i2]);
    }, 1500);
  });
}