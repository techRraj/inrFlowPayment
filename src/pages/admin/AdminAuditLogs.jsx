import { useMemo, useState } from 'react';
import EmptyState from '../../components/EmptyState.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { getAuditLogs } from '../../services/storageService.js';
import { formatDateTime } from '../../utils/dates.js';

export default function AdminAuditLogs() {
  const { dataVersion } = useApp();
  const [search, setSearch] = useState('');
  const logs = useMemo(() => getAuditLogs(), [dataVersion]);

  const filtered = logs.filter((l) =>
    !search || `${l.action} ${l.admin} ${l.target} ${l.description}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Audit Logs</h1>
      <p className="muted small mb-3">A record of significant demo admin actions.</p>

      <div className="card card-pad mb-3">
        <input className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs" />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Action</th><th>Admin</th><th>Target</th><th>Description</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td><span className="badge badge-primary">{l.action}</span></td>
                  <td className="small">{l.admin}</td>
                  <td className="mono small">{l.target}</td>
                  <td className="small">{l.description}</td>
                  <td className="small">{formatDateTime(l.createdAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5}><EmptyState title="No audit logs" message="Admin actions will be recorded here." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}