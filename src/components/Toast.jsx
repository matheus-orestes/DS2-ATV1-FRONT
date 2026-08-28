export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="toast">
      <i className="ph ph-check-circle" style={{ fontSize: 18, color: 'var(--color-accent-300)' }} />
      <div>
        <div style={{ fontSize: 13.5 }}>{toast.mensagem}</div>
        {toast.meta ? <div className="toast-meta">{toast.meta}</div> : null}
      </div>
    </div>
  );
}
