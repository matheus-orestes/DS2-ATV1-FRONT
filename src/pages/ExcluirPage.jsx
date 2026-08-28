import { StatusTag } from '../components/Tag';

export default function ExcluirPage({ funcionarios, onExcluir }) {
  return (
    <div className="card" style={{ padding: 'var(--space-6)', gap: 'var(--space-6)' }}>
      <div>
        <h5 style={{ margin: 0 }}>Excluir candidato</h5>
        <div className="muted" style={{ fontSize: 12 }}>
          O registro é localizado pelo ID e removido da lista. A ação pede confirmação.
        </div>
      </div>
      <div className="table-scroll">
        <table className="table" style={{ minWidth: 560 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Cargo</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map((f) => (
              <tr key={f.id}>
                <td className="mono muted">{f.id}</td>
                <td>{f.nome}</td>
                <td>{f.cargo}</td>
                <td>
                  <StatusTag status={f.status} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => onExcluir(f.id)}>
                    <i className="ph ph-trash" /> Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
