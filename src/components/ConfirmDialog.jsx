export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', busy, onConfirm, onCancel, danger = false }) {
  return <div className="dialog-backdrop" role="presentation"><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <span className={`dialog-icon ${danger ? 'danger' : ''}`}>!</span><h2 id="dialog-title">{title}</h2><p>{message}</p>
    <div className="dialog-actions"><button className="button button-quiet" onClick={onCancel} disabled={busy}>Cancel</button><button className={`button ${danger ? 'button-danger' : 'button-primary'}`} onClick={onConfirm} disabled={busy}>{busy ? 'Working...' : confirmLabel}</button></div>
  </div></div>
}
