import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/Badge.jsx';
import Pagination from '../../components/Pagination.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getUsers, saveUsers, getAuditLogs, saveAuditLogs } from '../../services/storageService.js';
import { generateAuditId } from '../../utils/ids.js';
import { nowISO } from '../../utils/dates.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { createNotification } from '../../services/notificationService.js';

export default function AdminUsers() {
  const { dataVersion, bumpData } = useApp();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const all = useMemo(() => getUsers(), [dataVersion]);

  const filtered = all.filter((u) => {
    if (search && !`${u.name} ${u.email} ${u.id}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (role && u.role !== role) return false;
    if (status && u.status !== status) return false;
    return true;
  });

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleStatus = (u) => {
    const next = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const users = getUsers().map((x) => (x.id === u.id ? { ...x, status: next } : x));
    saveUsers(users);
    const logs = getAuditLogs();
    logs.unshift({
      id: generateAuditId(),
      action: next === 'SUSPENDED' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
      admin: currentUser.name,
      target: u.email,
      description: `${next === 'SUSPENDED' ? 'Suspended' : 'Activated'} user ${u.name}`,
      createdAt: nowISO(),
    });
    saveAuditLogs(logs);
    createNotification(u.id, {
      title: next === 'SUSPENDED' ? 'Account suspended' : 'Account activated',
      message: `Your demo account has been ${next === 'SUSPENDED' ? 'suspended' : 'activated'} by admin.`,
      type: next === 'SUSPENDED' ? 'WARNING' : 'SUCCESS',
    });
    bumpData();
    toast.success(`User ${next === 'SUSPENDED' ? 'suspended' : 'activated'}.`);
  };

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Users</h1>
      <p className="muted small mb-3">Manage demo users and their access.</p>

      <div className="card card-pad mb-3">
        <div className="grid grid-3">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Search</label>
            <input className="form-control" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Name, email or ID" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Role</label>
            <select className="form-control" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
              <option value="">All roles</option><option>USER</option><option>ADMIN</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-control" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All statuses</option><option>ACTIVE</option><option>SUSPENDED</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {paged.map((u) => (
                <tr key={u.id}>
                  <td><Link to={`/admin/users/${u.id}`} className="text-primary fw-700">{u.name}</Link></td>
                  <td className="small">{u.email}</td>
                  <td className="small">{u.mobile}</td>
                  <td><span className="badge badge-primary">{u.role}</span></td>
                  <td><Badge status={u.status} /></td>
                  <td>
                    <div className="flex" style={{ gap: '.3rem' }}>
                      <Link className="btn btn-ghost btn-sm" to={`/admin/users/${u.id}`}>View</Link>
                      <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(u)}>
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && <tr><td colSpan={6}><EmptyState title="No users found" message="Try adjusting the filters." /></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card-pad"><Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={setPage} /></div>
      </div>
    </div>
  );
}