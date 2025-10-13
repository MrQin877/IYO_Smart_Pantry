import React from "react";


export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
  children, // optional extra JSX (e.g., a checklist)
}) {
  if (!open) return null;
  return (
    <div className="cd-mask" onClick={onCancel}>
      <div className="cd-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cd-head">
          <h3 className="cd-title">{title}</h3>
          <button className="cd-x" onClick={onCancel}>✕</button>
        </div>

        <div className="cd-body">
          {message && <p className="cd-msg">{message}</p>}
          {children}
        </div>

        <div className="cd-actions">
          <button className="btn secondary" onClick={onCancel} disabled={busy}>
            {cancelText}
          </button>
          <button
            className={`btn ${danger ? "danger" : "primary"}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
