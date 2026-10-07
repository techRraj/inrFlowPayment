import Modal from './Modal.jsx';

export default function ConfirmDialog({ open, title = 'Please confirm', message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}
      footer={(
        <>
          <button className="btn btn-outline" onClick={onCancel}>{cancelLabel}</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </>
      )}>
      <p style={{ margin: 0 }}>{message}</p>
    </Modal>
  );
}