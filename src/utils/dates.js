export function nowISO() { return new Date().toISOString(); }

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const mon = d.toLocaleString('en-IN', { month: 'short' });
  const yr = d.getFullYear();
  return `${day} ${mon} ${yr}`;
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const time = d.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${formatDate(iso)}, ${time}`;
}

export function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return d.toDateString() === n.toDateString();
}

export function isThisMonth(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

export function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}