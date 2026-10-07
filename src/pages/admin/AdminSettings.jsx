import { useState, useRef } from 'react';
import { FiDownload, FiUpload, FiRefreshCw } from 'react-icons/fi';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ALL_KEYS, STORAGE_KEYS, getStorage, setStorage, clearDemoData, getAuditLogs, saveAuditLogs } from '../../services/storageService.js';
import { resetDemoData } from '../../services/seedService.js';
import { generateAuditId } from '../../utils/ids.js';
import { nowISO } from '../../utils/dates.js';
import { downloadFile } from '../../services/reportService.js';

export default function AdminSettings() {
  const { settings, updateSettings, bumpData } = useApp();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef(null);

  const log = (action, description) => {
    const logs = getAuditLogs();
    logs.unshift({ id: generateAuditId(), action, admin: currentUser.name, target: 'SETTINGS', description, createdAt: nowISO() });
    saveAuditLogs(logs);
  };

  const doReset = () => {
    resetDemoData();
    setConfirmReset(false);
    toast.success('Demo data reset. Reloading…');
    setTimeout(() => window.location.reload(), 700);
  };

  const exportData = () => {
    const payload = {};
    ALL_KEYS.forEach((k) => { payload[k] = getStorage(k, null); });
    downloadFile('inrflow-demo-data.json', JSON.stringify(payload, null, 2), 'application/json');
    toast.success('Demo data exported.');
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const payload = JSON.parse(ev.target.result);
        Object.entries(payload).forEach(([k, v]) => { if (ALL_KEYS.includes(k)) setStorage(k, v); });
        log('DATA_IMPORTED', 'Demo data imported from JSON');
        toast.success('Demo data imported. Reloading…');
        setTimeout(() => window.location.reload(), 700);
      } catch (err) {
        toast.error('Invalid demo data file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>Settings</h1>
      <p className="muted small mb-3">Demo configuration and data management.</p>

      <div className="grid grid-2 mb-3">
        <div className="card card-pad">
          <h3 className="card-title mb-1">Application</h3>
          <div className="form-group">
            <label className="form-label">Application Name</label>
            <input className="form-control" value={settings.appName} onChange={(e) => updateSettings({ appName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Demo Commission Rate (%)</label>
            <input className="form-control" value={settings.commissionRate}
              onChange={(e) => updateSettings({ commissionRate: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 })} />
            <div className="form-hint">Between 0 and 20%. Only future transactions use the new rate.</div>
          </div>
          <div className="flex-between" style={{ padding: '.6rem 0' }}>
            <div>
              <div className="fw-700">Demo Mode</div>
              <div className="muted small">Always on. Real payments are not available.</div>
            </div>
            <span className="badge badge-warning">DEMO MODE: ON</span>
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="card-title mb-1">Notifications</h3>
          <label className="flex-between" style={{ padding: '.6rem 0', cursor: 'pointer' }}>
            <span>Email notifications</span>
            <input type="checkbox" checked={settings.notifyEmail} onChange={(e) => updateSettings({ notifyEmail: e.target.checked })} />
          </label>
          <label className="flex-between" style={{ padding: '.6rem 0', cursor: 'pointer' }}>
            <span>Push notifications</span>
            <input type="checkbox" checked={settings.notifyPush} onChange={(e) => updateSettings({ notifyPush: e.target.checked })} />
          </label>
          <p className="muted small mt-1">These toggles are demonstration only and do not send real notifications.</p>
        </div>
      </div>

      <div className="card card-pad">
        <h3 className="card-title mb-1">Data Management</h3>
        <p className="muted small">Reset the entire demonstration or move data between browsers.</p>
        <div className="flex" style={{ gap: '.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-danger" onClick={() => setConfirmReset(true)}><FiRefreshCw /> Reset Demo Data</button>
          <button className="btn btn-outline" onClick={exportData}><FiDownload /> Export Demo Data</button>
          <button className="btn btn-outline" onClick={() => fileRef.current?.click()}><FiUpload /> Import Demo Data</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
        </div>
        <p className="muted small mt-2">Demo data is stored entirely in your browser's localStorage. Resetting cannot be undone.</p>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset Demo Data"
        message="This clears all INRFlow demo data and reinitializes the demonstration. Continue?"
        confirmLabel="Reset and Reload"
        danger
        onConfirm={doReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}