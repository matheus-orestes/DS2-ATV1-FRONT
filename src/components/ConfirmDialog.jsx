export default function ConfirmDialog({ aberto, funcionario, endpoint, onCancelar, onConfirmar }) {
  if (!aberto || !funcionario) return null;
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <div className="dialog">
        <div className="dialog-title">Excluir candidato?</div>
        <div className="dialog-body">
          {funcionario.nome} ({funcionario.cargo}) será removido da lista. A ação não pode ser desfeita.
        </div>
        <div className="mono muted" style={{ fontSize: 12 }}>{endpoint}</div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirmar}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
