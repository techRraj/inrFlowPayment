export default function Badge({ status }) {
  const map = {
    SUCCESS: 'badge-success', CREDITED: 'badge-success', VERIFIED: 'badge-success', SETTLED: 'badge-success', ACTIVE: 'badge-success', RESOLVED: 'badge-success',
    PENDING: 'badge-warning', PROCESSING: 'badge-warning', UNDER_REVIEW: 'badge-warning', READY: 'badge-warning', OPEN: 'badge-warning', NOT_SUBMITTED: 'badge-muted',
    FAILED: 'badge-danger', REJECTED: 'badge-danger', SUSPENDED: 'badge-danger', REVERSED: 'badge-danger',
    REFUNDED: 'badge-info', BUY: 'badge-primary', SELL: 'badge-info', COMMISSION: 'badge-success', DEMO_DEPOSIT: 'badge-primary', WITHDRAWAL: 'badge-warning', DEBIT: 'badge-muted', CREDIT: 'badge-success',
  };
  const cls = map[status] || 'badge-muted';
  return <span className={`badge ${cls}`}>{String(status).replace(/_/g, ' ')}</span>;
}