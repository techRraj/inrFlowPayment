import { useState } from 'react';
import { FiShield, FiUpload, FiCheckCircle } from 'react-icons/fi';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getKYCForUser, submitKYC } from '../services/kycService.js';
import { createNotification } from '../services/notificationService.js';
import { formatDate } from '../utils/dates.js';

const ID_TYPES = [
  { id: 'DEMO_AADHAAR', label: 'Demo Aadhaar (masked)' },
  { id: 'DEMO_PAN', label: 'Demo PAN (masked)' },
  { id: 'DEMO_VOTER', label: 'Demo Voter ID' },
];

export default function KYC() {
  const { currentUser } = useAuth();
  const { dataVersion, bumpData } = useApp();
  const toast = useToast();
  const existing = getKYCForUser(currentUser.id);

  const [step, setStep] = useState(existing ? 'status' : 'personal');
  const [form, setForm] = useState({
    fullName: currentUser.name,
    dob: '',
    idType: 'DEMO_AADHAAR',
    idNumber: '',
    address: '',
    documentName: null,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(existing);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validatePersonal = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.dob) e.dob = 'Date of birth is required.';
    if (!form.idNumber.trim()) e.idNumber = 'Demo ID number is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateAddress = () => {
    const e = {};
    if (!form.address.trim()) e.address = 'Demo address is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) set('documentName', f.name);
  };

  const finalSubmit = () => {
    if (!validateAddress()) return;
    const record = submitKYC(currentUser.id, form);
    createNotification(currentUser.id, {
      title: 'KYC submitted',
      message: 'Your simulated KYC has been submitted and is pending admin review.',
      type: 'INFO',
    });
    setSubmitted(record);
    setStep('submitted');
    bumpData();
    toast.success('Demo KYC submitted successfully.');
  };

  if (step === 'status' && submitted) {
    return <StatusView record={submitted} onNew={() => { setSubmitted(null); setStep('personal'); }} />;
  }

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-.02em' }}>KYC Verification</h1>
      <p className="muted small mb-3">Completely simulated. Do not enter real Aadhaar, PAN or identity details.</p>

      <div className="card card-pad mb-3" style={{ background: '#fef3c7', borderColor: '#fcd34d' }}>
        <strong style={{ color: '#92400e' }}>SIMULATED KYC — NO REAL IDENTITY VERIFICATION IS PERFORMED.</strong>
      </div>

      <div className="flex mb-3" style={{ gap: '.5rem', flexWrap: 'wrap' }}>
        {['personal', 'address', 'review'].map((s, i) => (
          <div key={s} className="flex-center">
            <span className={`badge ${step === s ? 'badge-primary' : 'badge-muted'}`}>{i + 1}. {labelFor(s)}</span>
            {i < 2 && <span className="muted small" style={{ margin: '0 .25rem' }}>→</span>}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{labelFor(step)}</h3>
          <FiShield className="muted" />
        </div>
        <div className="card-pad">
          {step === 'personal' && (
            <>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
                  {errors.fullName && <div className="form-error">{errors.fullName}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" value={form.dob} onChange={(e) => set('dob', e.target.value)} />
                  {errors.dob && <div className="form-error">{errors.dob}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Demo ID Type</label>
                  <select className="form-control" value={form.idType} onChange={(e) => set('idType', e.target.value)}>
                    {ID_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Demo ID Number</label>
                  <input className="form-control" value={form.idNumber} onChange={(e) => set('idNumber', e.target.value)} placeholder="e.g. XXXX-XXXX-1234" />
                  {errors.idNumber && <div className="form-error">{errors.idNumber}</div>}
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => { if (validatePersonal()) setStep('address'); }}>Continue</button>
            </>
          )}

          {step === 'address' && (
            <>
              <div className="form-group">
                <label className="form-label">Demo Address</label>
                <textarea className="form-control" rows={3} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Demo address for this prototype" />
                {errors.address && <div className="form-error">{errors.address}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Demo Document Upload</label>
                <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                  <FiUpload /> Choose demo file
                  <input type="file" hidden onChange={onFile} />
                </label>
                {form.documentName && <div className="form-hint">Selected: {form.documentName} (only the file name is stored)</div>}
              </div>
              <div className="flex" style={{ gap: '.5rem' }}>
                <button className="btn btn-outline" onClick={() => setStep('personal')}>Back</button>
                <button className="btn btn-primary" onClick={() => { if (validateAddress()) setStep('review'); }}>Continue</button>
              </div>
            </>
          )}

          {step === 'review' && (
            <>
              <div className="grid grid-2 mb-2">
                <Field label="Full Name" value={form.fullName} />
                <Field label="Date of Birth" value={form.dob} />
                <Field label="Demo ID Type" value={ID_TYPES.find((t) => t.id === form.idType)?.label} />
                <Field label="Demo ID Number" value={form.idNumber} />
                <Field label="Demo Address" value={form.address} />
                <Field label="Document" value={form.documentName || 'Not uploaded'} />
              </div>
              <div className="flex" style={{ gap: '.5rem' }}>
                <button className="btn btn-outline" onClick={() => setStep('address')}>Back</button>
                <button className="btn btn-primary" onClick={finalSubmit}>Submit Demo KYC</button>
              </div>
            </>
          )}

          {step === 'submitted' && submitted && (
            <StatusView record={submitted} inline />
          )}
        </div>
      </div>
    </div>
  );
}

function labelFor(s) {
  return { personal: 'Personal Information', address: 'Demo Verification', review: 'Review', submitted: 'Submitted' }[s] || s;
}

function Field({ label, value }) {
  return (
    <div className="card card-pad" style={{ padding: '.75rem 1rem' }}>
      <div className="muted small">{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function StatusView({ record, onNew, inline }) {
  const colors = {
    PENDING: 'badge-warning', VERIFIED: 'badge-success', REJECTED: 'badge-danger', NOT_SUBMITTED: 'badge-muted',
  };
  return (
    <div className={inline ? '' : 'card card-pad'}>
      <div className="flex-between mb-2">
        <h3 className="card-title">KYC Status</h3>
        <Badge status={record.status} />
      </div>
      <div className="grid grid-2">
        <Field label="Submitted" value={formatDate(record.submittedAt)} />
        <Field label="Reviewed" value={record.reviewedAt ? formatDate(record.reviewedAt) : 'Pending review'} />
        <Field label="Full Name" value={record.fullName} />
        <Field label="Demo ID" value={record.idNumber} />
        {record.rejectionReason && <Field label="Rejection reason" value={record.rejectionReason} />}
      </div>
      <p className="muted small mt-2">SIMULATED KYC — NO REAL IDENTITY VERIFICATION IS PERFORMED.</p>
      {onNew && <button className="btn btn-outline btn-sm mt-2" onClick={onNew}>Submit another demo KYC</button>}
    </div>
  );
}