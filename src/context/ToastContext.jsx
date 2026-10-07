import { createContext, useCallback, useContext, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((message, type = 'info', duration = 3500) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
  }, [remove]);

  const api = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
    warning: (m) => push(m, 'warning'),
    push,
  };

  const iconFor = (t) => {
    if (t === 'success') return <FiCheckCircle color="#10b981" size={18} />;
    if (t === 'error') return <FiAlertCircle color="#ef4444" size={18} />;
    if (t === 'warning') return <FiAlertTriangle color="#f59e0b" size={18} />;
    return <FiInfo color="#06b6d4" size={18} />;
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div style={{ marginTop: 2 }}>{iconFor(t.type)}</div>
            <div style={{ flex: 1 }}>{t.message}</div>
            <button className="modal-close" onClick={() => remove(t.id)} aria-label="Dismiss"><FiX size={14} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}