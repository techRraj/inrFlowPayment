import { getTransactions, getCommissions, getUsers, getSettlements, getOrders } from './storageService.js';

export function buildReportData({ from, to } = {}) {
  const txns = getTransactions();
  const inRange = txns.filter((t) => {
    const d = new Date(t.createdAt);
    if (from && d < new Date(from)) return false;
    if (to && d > new Date(to)) return false;
    return true;
  });
  const success = inRange.filter((t) => t.status === 'SUCCESS');
  const failed = inRange.filter((t) => t.status === 'FAILED');
  const refunds = inRange.filter((t) => t.status === 'REFUNDED');
  const commissions = getCommissions();
  const totalCommission = commissions.filter((c) => c.status === 'CREDITED').reduce((a, c) => a + c.amount, 0);
  const volume = success.reduce((a, t) => a + t.amount, 0);
  return {
    totalVolume: volume,
    totalCommission: +totalCommission.toFixed(2),
    successful: success.length,
    failed: failed.length,
    refunds: refunds.length,
    settlements: getSettlements().length,
    users: getUsers().length,
    orders: getOrders().length,
    transactions: inRange,
  };
}

export function toCSV(rows, headers) {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const head = headers.map((h) => esc(h.label)).join(',');
  const body = rows.map((r) => headers.map((h) => esc(typeof h.value === 'function' ? h.value(r) : r[h.value])).join(',')).join('\n');
  return `${head}\n${body}`;
}

export function downloadFile(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}